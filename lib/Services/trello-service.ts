import { TrelloResponse, TrelloOperation } from "../types/trello";
import * as TrelloTools from "@/TrelloTools";
import { cacheService } from "../cache-service";
import { monitoringService } from "./monitoring-service";
import { Tool } from "ai";

// Tool interface that matches AI SDK tool structure
interface TrelloTool {
  execute: (
    args: Record<string, unknown>,
    options: { toolCallId: string; messages: unknown[] }
  ) => Promise<unknown>;
}

export class TrelloService {
  private static instance: TrelloService;
  private apiKey: string;
  private apiToken: string;

  private constructor() {
    this.apiKey = process.env.TRELLO_API_KEY || "";
    this.apiToken = process.env.TRELLO_API_TOKEN || "";

    if (!this.apiKey || !this.apiToken) {
      console.warn(
        "Trello API credentials not configured. Trello operations will not work properly."
      );
    }
  }

  public static getInstance(): TrelloService {
    if (!TrelloService.instance) {
      TrelloService.instance = new TrelloService();
    }
    return TrelloService.instance;
  }

  /**
   * Execute a Trello tool operation with standardized error handling and caching
   */
  public async executeToolOperation<T = unknown>(
    operation: TrelloOperation,
    params: Record<string, unknown> = {},
    requestId?: string
  ): Promise<TrelloResponse<T>> {
    const startTime = Date.now();

    try {
      // Check cache first for read operations
      if (cacheService.shouldCache(operation)) {
        const cachedResult = cacheService.get<T>(operation, params);
        if (cachedResult !== null) {
          console.log(`[TrelloService] Cache hit for ${operation}`);
          return this.standardizeResponse(cachedResult);
        }
      }

      // Get the tool from TrelloTools
      const tool = this.getToolByName(operation);
      if (!tool) {
        return this.createErrorResponse<T>(`Tool '${operation}' not found`);
      }

      // Execute the tool
      const toolStartTime = Date.now();
      const result = await tool.execute(params, {
        toolCallId: `${operation}-${Date.now()}`,
        messages: [],
      });
      const toolDuration = Date.now() - toolStartTime;

      // Log tool execution
      if (requestId) {
        monitoringService.logToolExecution(
          requestId,
          operation,
          toolDuration,
          true
        );
      }

      // Standardize the response first
      const standardizedResult = this.standardizeResponse<T>(result);

      // Cache successful read operations
      if (
        cacheService.shouldCache(operation) &&
        standardizedResult.success !== false
      ) {
        cacheService.set(operation, params, standardizedResult);
      }

      // Invalidate cache for write operations
      if (!cacheService.shouldCache(operation)) {
        this.invalidateRelatedCache(operation);
      }

      const totalDuration = Date.now() - startTime;
      console.log(
        `[TrelloService] ${operation} completed in ${totalDuration}ms`
      );

      return standardizedResult;
    } catch (error) {
      const toolDuration = Date.now() - startTime;

      // Log tool execution error
      if (requestId) {
        monitoringService.logToolExecution(
          requestId,
          operation,
          toolDuration,
          false,
          error instanceof Error ? error.message : String(error)
        );
      }

      return this.handleError(error);
    }
  }

  /**
   * Get tool by name from TrelloTools
   */
  private getToolByName(operation: TrelloOperation): TrelloTool | null {
    const toolMap: Record<string, Tool> = {
      // Board Tools
      listBoards: TrelloTools.listBoardsTool,
      getBoard: TrelloTools.getBoardTool,
      createBoard: TrelloTools.createBoardTool,
      updateBoard: TrelloTools.updateBoardTool,
      deleteBoard: TrelloTools.deleteBoardTool,

      // List Tools
      listLists: TrelloTools.listListsTool,
      getList: TrelloTools.getListTool,
      createList: TrelloTools.createListTool,
      updateList: TrelloTools.updateListTool,
      deleteList: TrelloTools.deleteListTool,
      archiveList: TrelloTools.archiveListTool,
      unarchiveList: TrelloTools.unarchiveListTool,

      // Card Tools
      listCards: TrelloTools.listCardsTool,
      getCard: TrelloTools.getCardTool,
      createCard: TrelloTools.createCardTool,
      updateCard: TrelloTools.updateCardTool,
      deleteCard: TrelloTools.deleteCardTool,

      // Label Tools
      listLabels: TrelloTools.listLabelsTool,
      getLabel: TrelloTools.getLabelTool,
      createLabel: TrelloTools.createLabelTool,
      updateLabel: TrelloTools.updateLabelTool,
      deleteLabel: TrelloTools.deleteLabelTool,
      addLabelToCard: TrelloTools.addLabelToCardTool,
      removeLabelFromCard: TrelloTools.removeLabelFromCardTool,

      // Attachment Tools
      listAttachments: TrelloTools.listAttachmentsTool,
      getAttachment: TrelloTools.getAttachmentTool,
      createAttachment: TrelloTools.createAttachmentTool,
      deleteAttachment: TrelloTools.deleteAttachmentTool,

      // Checklist Tools
      listChecklists: TrelloTools.listChecklistsTool,
      getChecklist: TrelloTools.getChecklistTool,
      createChecklist: TrelloTools.createChecklistTool,
      updateChecklist: TrelloTools.updateChecklistTool,
      deleteChecklist: TrelloTools.deleteChecklistTool,
      createChecklistItem: TrelloTools.createChecklistItemTool,
      updateChecklistItem: TrelloTools.updateChecklistItemTool,
      deleteChecklistItem: TrelloTools.deleteChecklistItemTool,

      // Member Tools
      listMembers: TrelloTools.listMembersTool,
      getMember: TrelloTools.getMemberTool,
      addMemberToBoard: TrelloTools.addMemberToBoardTool,
      removeMemberFromBoard: TrelloTools.removeMemberFromBoardTool,

      // Workspace Tools
      listWorkspaces: TrelloTools.listWorkspacesTool,
      getWorkspace: TrelloTools.getWorkspaceTool,
      createWorkspace: TrelloTools.createWorkspaceTool,
      updateWorkspace: TrelloTools.updateWorkspaceTool,
      deleteWorkspace: TrelloTools.deleteWorkspaceTool,
    };

    const tool = toolMap[operation];
    return tool ? (tool as unknown as TrelloTool) : null;
  }

  /**
   * Standardize tool response to consistent format
   */
  private standardizeResponse<T>(result: unknown): TrelloResponse<T> {
    const typedResult = result as Record<string, unknown>;

    if (typedResult.success === false) {
      return {
        success: false,
        error: (typedResult.error as string) || "Operation failed",
        message: (typedResult.message as string) || "Unknown error occurred",
      };
    }

    // Extract data based on operation type
    let data: T;
    let count: number | undefined;

    if (typedResult.boards) {
      data = typedResult.boards as T;
      count = typedResult.count as number;
    } else if (typedResult.lists) {
      data = typedResult.lists as T;
      count = typedResult.count as number;
    } else if (typedResult.cards) {
      data = typedResult.cards as T;
      count = typedResult.count as number;
    } else if (typedResult.labels) {
      data = typedResult.labels as T;
      count = typedResult.count as number;
    } else if (typedResult.attachments) {
      data = typedResult.attachments as T;
      count = typedResult.count as number;
    } else if (typedResult.checklists) {
      data = typedResult.checklists as T;
      count = typedResult.count as number;
    } else if (typedResult.members) {
      data = typedResult.members as T;
      count = typedResult.count as number;
    } else if (typedResult.workspaces) {
      data = typedResult.workspaces as T;
      count = typedResult.count as number;
    } else if (typedResult.board) {
      data = typedResult.board as T;
    } else if (typedResult.list) {
      data = typedResult.list as T;
    } else if (typedResult.card) {
      data = typedResult.card as T;
    } else if (typedResult.label) {
      data = typedResult.label as T;
    } else if (typedResult.attachment) {
      data = typedResult.attachment as T;
    } else if (typedResult.checklist) {
      data = typedResult.checklist as T;
    } else if (typedResult.member) {
      data = typedResult.member as T;
    } else if (typedResult.workspace) {
      data = typedResult.workspace as T;
    } else {
      // For operations that don't return specific data
      data = result as T;
    }

    return {
      success: true,
      data,
      count,
      message:
        (typedResult.message as string) || "Operation completed successfully",
    };
  }

  /**
   * Handle errors consistently
   */
  private handleError<T = unknown>(error: unknown): TrelloResponse<T> {
    let errorMessage = "An unexpected error occurred";
    let status = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types
      if (error.message.includes("API credentials")) {
        status = 401;
      } else if (error.message.includes("not found")) {
        status = 404;
      } else if (error.message.includes("permission")) {
        status = 403;
      } else if (error.message.includes("validation")) {
        status = 400;
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as Error).message;
    }

    console.error("TrelloService Error:", {
      message: errorMessage,
      status,
      error,
    });

    return {
      success: false,
      error: errorMessage,
      message: `Trello operation failed: ${errorMessage}`,
    };
  }

  /**
   * Create standardized error response
   */
  private createErrorResponse<T>(message: string): TrelloResponse<T> {
    return {
      success: false,
      error: message,
      message: `Error: ${message}`,
    };
  }

  /**
   * Check if API credentials are configured
   */
  public isConfigured(): boolean {
    return !!(this.apiKey && this.apiToken);
  }

  /**
   * Invalidate related cache entries when data changes
   */
  private invalidateRelatedCache(operation: TrelloOperation): void {
    // Define cache invalidation rules based on operation type
    const invalidationRules: Record<string, string[]> = {
      // Board operations invalidate board-related caches
      createBoard: ["listBoards", "getBoard"],
      updateBoard: ["getBoard", "listBoards"],
      deleteBoard: ["getBoard", "listBoards", "listLists"],

      // List operations invalidate list and card caches
      createList: ["listLists", "getList"],
      updateList: ["getList", "listLists"],
      deleteList: ["getList", "listLists", "listCards"],
      archiveList: ["getList", "listLists"],
      unarchiveList: ["getList", "listLists"],

      // Card operations invalidate card caches
      createCard: ["listCards", "getCard"],
      updateCard: ["getCard", "listCards"],
      deleteCard: ["getCard", "listCards"],

      // Label operations invalidate label caches
      createLabel: ["listLabels", "getLabel"],
      updateLabel: ["getLabel", "listLabels"],
      deleteLabel: ["getLabel", "listLabels"],
      addLabelToCard: ["getCard"],
      removeLabelFromCard: ["getCard"],

      // Attachment operations invalidate attachment caches
      createAttachment: ["listAttachments", "getAttachment"],
      deleteAttachment: ["getAttachment", "listAttachments"],

      // Checklist operations invalidate checklist caches
      createChecklist: ["listChecklists", "getChecklist"],
      updateChecklist: ["getChecklist", "listChecklists"],
      deleteChecklist: ["getChecklist", "listChecklists"],
      createChecklistItem: ["getChecklist"],
      updateChecklistItem: ["getChecklist"],
      deleteChecklistItem: ["getChecklist"],

      // Member operations invalidate member caches
      addMemberToBoard: ["listMembers", "getMember"],
      removeMemberFromBoard: ["listMembers", "getMember"],

      // Workspace operations invalidate workspace caches
      createWorkspace: ["listWorkspaces", "getWorkspace"],
      updateWorkspace: ["getWorkspace", "listWorkspaces"],
      deleteWorkspace: ["getWorkspace", "listWorkspaces"],
    };

    const operationsToInvalidate = invalidationRules[operation] || [];
    operationsToInvalidate.forEach((op) => {
      cacheService.invalidate(op);
    });

    console.log(
      `[TrelloService] Invalidated cache for operations: ${operationsToInvalidate.join(
        ", "
      )}`
    );
  }

  /**
   * Get API credentials (for debugging)
   */
  public getCredentials(): { hasKey: boolean; hasToken: boolean } {
    return {
      hasKey: !!this.apiKey,
      hasToken: !!this.apiToken,
    };
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Clear cache (useful for testing or manual cache invalidation)
   */
  public clearCache(): void {
    cacheService.clear();
    console.log("[TrelloService] Cache cleared");
  }
}

// Export singleton instance
export const trelloService = TrelloService.getInstance();
