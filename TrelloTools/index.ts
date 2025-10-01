// Individual tool exports for backward compatibility
export {
  createBoardTool,
  getBoardTool,
  updateBoardTool,
  deleteBoardTool,
  listBoardsTool,
} from "./BoardTools";

export {
  createListTool,
  getListTool,
  updateListTool,
  deleteListTool,
  listListsTool,
  archiveListTool,
  unarchiveListTool,
} from "./ListTools";

export {
  createCardTool,
  getCardTool,
  updateCardTool,
  deleteCardTool,
  listCardsTool,
} from "./CardTools";

export {
  createLabelTool,
  getLabelTool,
  updateLabelTool,
  deleteLabelTool,
  listLabelsTool,
  addLabelToCardTool,
  removeLabelFromCardTool,
} from "./LabelTools";

export {
  createAttachmentTool,
  getAttachmentTool,
  deleteAttachmentTool,
  listAttachmentsTool,
} from "./AttachmentTools";

export {
  createChecklistTool,
  getChecklistTool,
  updateChecklistTool,
  deleteChecklistTool,
  listChecklistsTool,
  createChecklistItemTool,
  updateChecklistItemTool,
  deleteChecklistItemTool,
} from "./ChecklistTools";

export {
  addMemberToBoardTool,
  removeMemberFromBoardTool,
  listMembersTool,
  getMemberTool,
} from "./MemberTools";

export {
  createWorkspaceTool,
  getWorkspaceTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  listWorkspacesTool,
} from "./WorkspaceTools";

// Import all tools for centralized export
import {
  createBoardTool,
  getBoardTool,
  updateBoardTool,
  deleteBoardTool,
  listBoardsTool,
} from "./BoardTools";

import {
  createListTool,
  getListTool,
  updateListTool,
  deleteListTool,
  listListsTool,
  archiveListTool,
  unarchiveListTool,
} from "./ListTools";

import {
  createCardTool,
  getCardTool,
  updateCardTool,
  deleteCardTool,
  listCardsTool,
} from "./CardTools";

import {
  createLabelTool,
  getLabelTool,
  updateLabelTool,
  deleteLabelTool,
  listLabelsTool,
  addLabelToCardTool,
  removeLabelFromCardTool,
} from "./LabelTools";

import {
  createAttachmentTool,
  getAttachmentTool,
  deleteAttachmentTool,
  listAttachmentsTool,
} from "./AttachmentTools";

import {
  createChecklistTool,
  getChecklistTool,
  updateChecklistTool,
  deleteChecklistTool,
  listChecklistsTool,
  createChecklistItemTool,
  updateChecklistItemTool,
  deleteChecklistItemTool,
} from "./ChecklistTools";

import {
  addMemberToBoardTool,
  removeMemberFromBoardTool,
  listMembersTool,
  getMemberTool,
} from "./MemberTools";

import {
  createWorkspaceTool,
  getWorkspaceTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  listWorkspacesTool,
} from "./WorkspaceTools";

import {
  createBoardFormTool,
  createCardFormTool,
  createListFormTool,
  createWorkspaceFormTool,
  createLabelFormTool,
  createChecklistFormTool,
  createAttachmentFormTool,
  updateBoardFormTool,
  updateCardFormTool,
  updateListFormTool,
  updateLabelFormTool,
  updateChecklistFormTool,
  updateChecklistItemFormTool,
  updateWorkspaceFormTool,
} from "./ClientSideTools";

import { advancedTools } from "./AdvancedTools";

// Centralized tools object following AI SDK best practices
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

  // Client-side Form Tools (for interactive UI generation)
  createBoardForm: createBoardFormTool,
  createCardForm: createCardFormTool,
  createListForm: createListFormTool,
  createWorkspaceForm: createWorkspaceFormTool,
  createLabelForm: createLabelFormTool,
  createChecklistForm: createChecklistFormTool,
  createAttachmentForm: createAttachmentFormTool,
  updateBoardForm: updateBoardFormTool,
  updateCardForm: updateCardFormTool,
  updateListForm: updateListFormTool,
  updateLabelForm: updateLabelFormTool,
  updateChecklistForm: updateChecklistFormTool,
  updateChecklistItemForm: updateChecklistItemFormTool,
  updateWorkspaceForm: updateWorkspaceFormTool,

  // Advanced Tools
  ...advancedTools,
};
