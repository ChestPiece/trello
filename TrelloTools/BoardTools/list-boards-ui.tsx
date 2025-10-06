import { z } from 'zod';
import axios from 'axios';

// Define interfaces for Trello API response types
interface TrelloBoardResponse {
  id: string;
  name: string;
  desc: string;
  url: string;
  shortUrl: string;
  prefs?: { permissionLevel?: string; [key: string]: unknown };
  idOrganization?: string;
  closed: boolean;
  pinned: boolean;
  starred: boolean;
  dateLastActivity?: string;
  dateLastView?: string;
  idShort: number;
  organization?: { id?: string; name?: string; displayName?: string };
  lists?: Array<{ id: string; name: string; closed: boolean }>;
}

const listBoardsSchema = z.object({
  filter: z.enum(["all", "closed", "none", "open", "starred"]).optional(),
  fields: z.array(z.string()).optional(),
  organization: z.boolean().optional(),
  organizationFields: z.array(z.string()).optional(),
  lists: z.string().optional(),
  listFields: z.array(z.string()).optional(),
});

// Board List Component
const BoardListComponent = ({ boards }: { boards: any[] }) => (
  <div className="space-y-3">
    <div className="text-lg font-semibold text-foreground">
      Your Trello Boards ({boards.length})
    </div>
    <div className="grid gap-3">
      {boards.map((board) => (
        <div
          key={board.id}
          className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">{board.name}</h3>
              {board.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {board.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    board.closed ? 'bg-destructive' : 'bg-green-500'
                  }`}></span>
                  {board.closed ? 'Closed' : 'Active'}
                </span>
                {board.starred && (
                  <span className="flex items-center gap-1">
                    ⭐ Starred
                  </span>
                )}
                {board.pinned && (
                  <span className="flex items-center gap-1">
                    📌 Pinned
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <a
                href={board.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Open in Trello
              </a>
              {board.organization && (
                <span className="text-xs text-muted-foreground">
                  {board.organization.displayName || board.organization.name}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Loading Component
const LoadingComponent = () => (
  <div className="animate-pulse p-4 bg-muted rounded-lg">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <span className="text-sm text-muted-foreground">Loading your boards...</span>
    </div>
  </div>
);

// Error Component
const ErrorComponent = ({ error }: { error: string }) => (
  <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-destructive">⚠️</span>
      <span className="font-medium text-destructive">Failed to load boards</span>
    </div>
    <p className="text-sm text-destructive/80">{error}</p>
  </div>
);

export const listBoardsTool = {
  description: "List all Trello boards accessible to the authenticated user with optional filtering and field selection",
  inputSchema: listBoardsSchema,
  generate: async function* ({
    filter = "all",
    fields,
    organization,
    organizationFields,
    lists,
    listFields,
  }: {
    filter?: "all" | "closed" | "none" | "open" | "starred";
    fields?: string[];
    organization?: boolean;
    organizationFields?: string[];
    lists?: string;
    listFields?: string[];
  }) {
    // Show loading state first
    yield <LoadingComponent />;

    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/members/me/boards";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        filter,
        ...(fields && { fields: fields.join(",") }),
        ...(organization !== undefined && {
          organization: organization.toString(),
        }),
        ...(organizationFields && {
          organization_fields: organizationFields.join(","),
        }),
        ...(lists && { lists }),
        ...(listFields && { list_fields: listFields.join(",") }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      const boards = response.data.map((board: TrelloBoardResponse) => ({
        id: board.id,
        name: board.name,
        description: board.desc,
        url: board.url,
        shortUrl: board.shortUrl,
        visibility: board.prefs?.permissionLevel,
        organizationId: board.idOrganization,
        closed: board.closed,
        pinned: board.pinned,
        starred: board.starred,
        dateLastActivity: board.dateLastActivity,
        dateLastView: board.dateLastView,
        idShort: board.idShort,
        organization: board.organization,
        lists: board.lists,
      }));

      return <BoardListComponent boards={boards} />;
    } catch (error: unknown) {
      console.error("List boards error:", error);

      let errorMessage = "Failed to list boards";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      return <ErrorComponent error={errorMessage} />;
    }
  },
};
