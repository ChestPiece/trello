import {
  // Board Tools
  createBoardTool,
  getBoardTool,
  updateBoardTool,
  deleteBoardTool,
  listBoardsTool,
  // List Tools
  createListTool,
  getListTool,
  updateListTool,
  deleteListTool,
  listListsTool,
  archiveListTool,
  unarchiveListTool,
  // Card Tools
  createCardTool,
  getCardTool,
  updateCardTool,
  deleteCardTool,
  listCardsTool,
  // Label Tools
  createLabelTool,
  getLabelTool,
  updateLabelTool,
  deleteLabelTool,
  listLabelsTool,
  addLabelToCardTool,
  removeLabelFromCardTool,
  // Attachment Tools
  createAttachmentTool,
  getAttachmentTool,
  deleteAttachmentTool,
  listAttachmentsTool,
  // Checklist Tools
  createChecklistTool,
  getChecklistTool,
  updateChecklistTool,
  deleteChecklistTool,
  listChecklistsTool,
  createChecklistItemTool,
  updateChecklistItemTool,
  deleteChecklistItemTool,
  // Member Tools
  addMemberToBoardTool,
  removeMemberFromBoardTool,
  listMembersTool,
  getMemberTool,
  // Workspace Tools
  createWorkspaceTool,
  getWorkspaceTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  listWorkspacesTool,
} from "@/TrelloTools";

/**
 * Centralized registry of all Trello tools
 * This makes it easier to maintain and reference tools across the application
 */
export const trelloTools = {
  // Board Tools
  createBoard: createBoardTool,
  getBoard: getBoardTool,
  updateBoard: updateBoardTool,
  deleteBoard: deleteBoardTool,
  listBoards: listBoardsTool,

  // List Tools
  createList: createListTool,
  getList: getListTool,
  updateList: updateListTool,
  deleteList: deleteListTool,
  listLists: listListsTool,
  archiveList: archiveListTool,
  unarchiveList: unarchiveListTool,

  // Card Tools
  createCard: createCardTool,
  getCard: getCardTool,
  updateCard: updateCardTool,
  deleteCard: deleteCardTool,
  listCards: listCardsTool,

  // Label Tools
  createLabel: createLabelTool,
  getLabel: getLabelTool,
  updateLabel: updateLabelTool,
  deleteLabel: deleteLabelTool,
  listLabels: listLabelsTool,
  addLabelToCard: addLabelToCardTool,
  removeLabelFromCard: removeLabelFromCardTool,

  // Attachment Tools
  createAttachment: createAttachmentTool,
  getAttachment: getAttachmentTool,
  deleteAttachment: deleteAttachmentTool,
  listAttachments: listAttachmentsTool,

  // Checklist Tools
  createChecklist: createChecklistTool,
  getChecklist: getChecklistTool,
  updateChecklist: updateChecklistTool,
  deleteChecklist: deleteChecklistTool,
  listChecklists: listChecklistsTool,
  createChecklistItem: createChecklistItemTool,
  updateChecklistItem: updateChecklistItemTool,
  deleteChecklistItem: deleteChecklistItemTool,

  // Member Tools
  addMemberToBoard: addMemberToBoardTool,
  removeMemberFromBoard: removeMemberFromBoardTool,
  listMembers: listMembersTool,
  getMember: getMemberTool,

  // Workspace Tools
  createWorkspace: createWorkspaceTool,
  getWorkspace: getWorkspaceTool,
  updateWorkspace: updateWorkspaceTool,
  deleteWorkspace: deleteWorkspaceTool,
  listWorkspaces: listWorkspacesTool,
} as const;

/**
 * Get tool by name
 */
export function getToolByName(toolName: string) {
  return trelloTools[toolName as keyof typeof trelloTools];
}

/**
 * Get all tool names
 */
export function getAllToolNames(): string[] {
  return Object.keys(trelloTools);
}

/**
 * Check if tool exists
 */
export function hasTool(toolName: string): boolean {
  return toolName in trelloTools;
}
