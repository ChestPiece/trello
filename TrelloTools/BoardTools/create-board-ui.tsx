import { z } from 'zod';
import axios from 'axios';

const createBoardSchema = z.object({
  name: z.string().describe("The name of the board"),
  description: z.string().optional().describe("The description of the board"),
  visibility: z.enum(["private", "public", "org"]).optional().describe("The visibility of the board"),
  organizationId: z.string().optional().describe("The ID of the organization to add the board to"),
  defaultLists: z.boolean().optional().describe("Whether to create default lists"),
  defaultLabels: z.boolean().optional().describe("Whether to create default labels"),
});

// Board Creation Success Component
const BoardCreatedComponent = ({ board }: { board: any }) => (
  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-green-600">✅</span>
      <span className="font-medium text-green-800">Board Created Successfully!</span>
    </div>
    <div className="space-y-2">
      <h3 className="font-semibold text-green-900">{board.name}</h3>
      {board.description && (
        <p className="text-sm text-green-700">{board.description}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-green-600">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            board.closed ? 'bg-red-500' : 'bg-green-500'
          }`}></span>
          {board.closed ? 'Closed' : 'Active'}
        </span>
        <span>Visibility: {board.visibility}</span>
      </div>
      <div className="pt-2">
        <a
          href={board.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 underline"
        >
          Open in Trello →
        </a>
      </div>
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
      <span className="text-sm text-muted-foreground">Creating board...</span>
    </div>
  </div>
);

// Error Component
const ErrorComponent = ({ error }: { error: string }) => (
  <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-destructive">⚠️</span>
      <span className="font-medium text-destructive">Failed to create board</span>
    </div>
    <p className="text-sm text-destructive/80">{error}</p>
  </div>
);

export const createBoardTool = {
  description: "Create a new Trello board with specified name, description, and settings. Supports comprehensive board configuration including visibility, permissions, and custom preferences.",
  inputSchema: createBoardSchema,
  generate: async function* ({
    name,
    description,
    visibility = "private",
    organizationId,
    defaultLists = true,
    defaultLabels = true,
  }: {
    name: string;
    description?: string;
    visibility?: "private" | "public" | "org";
    organizationId?: string;
    defaultLists?: boolean;
    defaultLabels?: boolean;
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

      const baseUrl = "https://api.trello.com/1/boards";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        name,
        ...(description && { desc: description }),
        prefs_permissionLevel: visibility,
        ...(organizationId && { idOrganization: organizationId }),
        defaultLists: defaultLists.toString(),
        defaultLabels: defaultLabels.toString(),
      });

      const response = await axios.post(baseUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const board = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.desc,
        url: response.data.url,
        shortUrl: response.data.shortUrl,
        visibility: response.data.prefs?.permissionLevel,
        organizationId: response.data.idOrganization,
        closed: response.data.closed,
        pinned: response.data.pinned,
        starred: response.data.starred,
      };

      return <BoardCreatedComponent board={board} />;
    } catch (error: unknown) {
      console.error("Create board error:", error);

      let errorMessage = "Failed to create board";

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
