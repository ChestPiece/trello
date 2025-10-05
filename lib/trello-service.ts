import { TrelloResponse, TrelloError, TrelloOperation } from "./types/trello";
import * as TrelloTools from "@/TrelloTools";

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
   * Execute a Trello tool operation with standardized error handling
   */
  public async executeToolOperation<T = any>(
    operation: TrelloOperation,
    params: Record<string, any> = {}
  ): Promise<TrelloResponse<T>> {
    try {
      // Get the tool from TrelloTools
      const tool = this.getToolByName(operation);
      if (!tool) {
        return this.createErrorResponse(`Tool '${operation}' not found`);
      }

      // Execute the tool
      const result = await tool.execute(params, {
        toolCallId: `${operation}-${Date.now()}`,
        messages: [],
      });

      // Standardize the response
      return this.standardizeResponse(result);
    } catch (error) {
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
        error: result.error || "Operation failed",
        message: result.message || "Unknown error occurred",
      };
    }

    // Extract data based on operation type
    let data: T;
    let count: number | undefined;

    if (result.boards) {
      data = result.boards as T;
      count = result.count;
    } else if (result.lists) {
      data = result.lists as T;
      count = result.count;
    } else if (result.cards) {
      data = result.cards as T;
      count = result.count;
    } else if (result.labels) {
      data = result.labels as T;
      count = result.count;
    } else if (result.attachments) {
      data = result.attachments as T;
      count = result.count;
    } else if (result.checklists) {
      data = result.checklists as T;
      count = result.count;
    } else if (result.members) {
      data = result.members as T;
      count = result.count;
    } else if (result.workspaces) {
      data = result.workspaces as T;
      count = result.count;
    } else if (result.board) {
      data = result.board as T;
    } else if (result.list) {
      data = result.list as T;
    } else if (result.card) {
      data = result.card as T;
    } else if (result.label) {
      data = result.label as T;
    } else if (result.attachment) {
      data = result.attachment as T;
    } else if (result.checklist) {
      data = result.checklist as T;
    } else if (result.member) {
      data = result.member as T;
    } else if (result.workspace) {
      data = result.workspace as T;
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
   * Get API credentials (for debugging)
   */
  public getCredentials(): { hasKey: boolean; hasToken: boolean } {
    return {
      hasKey: !!this.apiKey,
      hasToken: !!this.apiToken,
    };
  }
}

// Export singleton instance
export const trelloService = TrelloService.getInstance();
