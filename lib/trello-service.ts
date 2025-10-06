import { TrelloResponse, TrelloError, TrelloOperation } from "./types/trello";
import * as TrelloTools from "@/TrelloTools";
import { cacheService } from "./cache-service";
import { monitoringService } from "./monitoring-service";

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
  public async executeToolOperation<T = any>(
    operation: TrelloOperation,
    params: Record<string, any> = {},
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
        return this.createErrorResponse(`Tool '${operation}' not found`);
      }

      // Execute the tool
      const toolStartTime = Date.now();
      const result = (await tool.execute(params, {
        toolCallId: `${operation}-${Date.now()}`,
        messages: [],
      })) as any;
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

      // Cache successful read operations
      if (cacheService.shouldCache(operation) && result.success !== false) {
        cacheService.set(operation, params, result);
      }

      // Invalidate cache for write operations
      if (!cacheService.shouldCache(operation)) {
        this.invalidateRelatedCache(operation);
      }

      // Standardize the response
      const standardizedResult = this.standardizeResponse(result);

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
  private getToolByName(operation: TrelloOperation) {
    const toolMap: Record<string, any> = {
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

    return toolMap[operation];
  }

  /**
   * Standardize tool response to consistent format
   */
  private standardizeResponse<T>(result: any): TrelloResponse<T> {
    if (result.success === false) {
      return {
        success: false,
        error: (result as any).error || "Operation failed",
        message: (result as any).message || "Unknown error occurred",
      };
    }

    // Extract data based on operation type
    let data: T;
    let count: number | undefined;

    if ((result as any).boards) {
      data = (result as any).boards as T;
      count = (result as any).count;
    } else if ((result as any).lists) {
      data = (result as any).lists as T;
      count = (result as any).count;
    } else if ((result as any).cards) {
      data = (result as any).cards as T;
      count = (result as any).count;
    } else if ((result as any).labels) {
      data = (result as any).labels as T;
      count = (result as any).count;
    } else if ((result as any).attachments) {
      data = (result as any).attachments as T;
      count = (result as any).count;
    } else if ((result as any).checklists) {
      data = (result as any).checklists as T;
      count = (result as any).count;
    } else if ((result as any).members) {
      data = (result as any).members as T;
      count = (result as any).count;
    } else if ((result as any).workspaces) {
      data = (result as any).workspaces as T;
      count = (result as any).count;
    } else if ((result as any).board) {
      data = (result as any).board as T;
    } else if ((result as any).list) {
      data = (result as any).list as T;
    } else if ((result as any).card) {
      data = (result as any).card as T;
    } else if ((result as any).label) {
      data = (result as any).label as T;
    } else if ((result as any).attachment) {
      data = (result as any).attachment as T;
    } else if ((result as any).checklist) {
      data = (result as any).checklist as T;
    } else if ((result as any).member) {
      data = (result as any).member as T;
    } else if ((result as any).workspace) {
      data = (result as any).workspace as T;
    } else {
      // For operations that don't return specific data
      data = result as T;
    }

    return {
      success: true,
      data,
      count,
      message: result.message || "Operation completed successfully",
    };
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): TrelloResponse {
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
      errorMessage = (error as any).message;
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
  private createErrorResponse(message: string): TrelloResponse {
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
