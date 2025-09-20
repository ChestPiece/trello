// Enhanced form detection logic with robust regex patterns

export interface FormDetectionPatterns {
  boardCreation: RegExp;
  boardUpdate: RegExp;
  boardDelete: RegExp;
  boardClose: RegExp;
  listCreation: RegExp;
  listUpdate: RegExp;
  listDelete: RegExp;
  listClose: RegExp;
  cardCreation: RegExp;
  cardUpdate: RegExp;
  cardDelete: RegExp;
  workspaceCreation: RegExp;
  workspaceUpdate: RegExp;
  workspaceDelete: RegExp;
  labelCreation: RegExp;
  labelUpdate: RegExp;
  labelDelete: RegExp;
  attachmentCreation: RegExp;
  attachmentDelete: RegExp;
  checklistCreation: RegExp;
  checklistUpdate: RegExp;
  checklistDelete: RegExp;
}

// Define comprehensive regex patterns for form detection
export const formDetectionPatterns: FormDetectionPatterns = {
  // Board patterns
  boardCreation:
    /\b(?:create|make|new|add)\s+(?:a\s+)?board\b|board\s+(?:creation|create)\s+form/i,
  boardUpdate:
    /\b(?:update|edit|modify|change)\s+(?:a\s+)?board\b|board\s+(?:update|edit|modify)\s+form/i,
  boardDelete:
    /\b(?:delete|remove|destroy)\s+(?:a\s+)?board\b|board\s+(?:delete|remove)\s+form/i,
  boardClose:
    /\b(?:close|reopen|archive)\s+(?:a\s+)?board\b|board\s+(?:close|reopen)\s+form/i,

  // List patterns
  listCreation:
    /\b(?:create|make|new|add)\s+(?:a\s+)?list\b|list\s+(?:creation|create)\s+form/i,
  listUpdate:
    /\b(?:update|edit|modify|change)\s+(?:a\s+)?list\b|list\s+(?:update|edit|modify)\s+form/i,
  listDelete:
    /\b(?:delete|remove|destroy)\s+(?:a\s+)?list\b|list\s+(?:delete|remove)\s+form/i,
  listClose:
    /\b(?:close|reopen|archive)\s+(?:a\s+)?list\b|list\s+(?:close|reopen)\s+form/i,

  // Card patterns
  cardCreation:
    /\b(?:create|make|new|add)\s+(?:a\s+)?card\b|card\s+(?:creation|create)\s+form/i,
  cardUpdate:
    /\b(?:update|edit|modify|change)\s+(?:a\s+)?card\b|card\s+(?:update|edit|modify)\s+form/i,
  cardDelete:
    /\b(?:delete|remove|destroy)\s+(?:a\s+)?card\b|card\s+(?:delete|remove)\s+form/i,

  // Workspace patterns
  workspaceCreation:
    /\b(?:create|make|new|add)\s+(?:a\s+)?workspace\b|workspace\s+(?:creation|create)\s+form/i,
  workspaceUpdate:
    /\b(?:update|edit|modify|change)\s+(?:a\s+)?workspace\b|workspace\s+(?:update|edit|modify)\s+form/i,
  workspaceDelete:
    /\b(?:delete|remove|destroy)\s+(?:a\s+)?workspace\b|workspace\s+(?:delete|remove)\s+form/i,

  // Label patterns
  labelCreation:
    /\b(?:create|make|new|add)\s+(?:a\s+)?label\b|label\s+(?:creation|create)\s+form/i,
  labelUpdate:
    /\b(?:update|edit|modify|change)\s+(?:a\s+)?label\b|label\s+(?:update|edit|modify)\s+form/i,
  labelDelete:
    /\b(?:delete|remove|destroy)\s+(?:a\s+)?label\b|label\s+(?:delete|remove)\s+form/i,

  // Attachment patterns
  attachmentCreation:
    /\b(?:add|attach|upload|create)\s+(?:an\s+)?(?:attachment|file)\b|attachment\s+(?:creation|create)\s+form/i,
  attachmentDelete:
    /\b(?:delete|remove|destroy)\s+(?:an\s+)?(?:attachment|file)\b|attachment\s+(?:delete|remove)\s+form/i,

  // Checklist patterns
  checklistCreation:
    /\b(?:create|make|new|add)\s+(?:a\s+)?checklist\b|checklist\s+(?:creation|create)\s+form/i,
  checklistUpdate:
    /\b(?:update|edit|modify|change)\s+(?:a\s+)?checklist\b|checklist\s+(?:update|edit|modify)\s+form/i,
  checklistDelete:
    /\b(?:delete|remove|destroy)\s+(?:a\s+)?checklist\b|checklist\s+(?:delete|remove)\s+form/i,
};

// Form detection result interface
export interface FormDetectionResult {
  shouldShowBoardCreationForm: boolean;
  shouldShowBoardUpdateForm: boolean;
  shouldShowBoardDeleteForm: boolean;
  shouldShowBoardCloseForm: boolean;
  shouldShowListCreationForm: boolean;
  shouldShowListUpdateForm: boolean;
  shouldShowListDeleteForm: boolean;
  shouldShowListCloseForm: boolean;
  shouldShowCardCreationForm: boolean;
  shouldShowCardUpdateForm: boolean;
  shouldShowCardDeleteForm: boolean;
  shouldShowWorkspaceCreationForm: boolean;
  shouldShowWorkspaceUpdateForm: boolean;
  shouldShowWorkspaceDeleteForm: boolean;
  shouldShowLabelCreationForm: boolean;
  shouldShowLabelUpdateForm: boolean;
  shouldShowLabelDeleteForm: boolean;
  shouldShowAttachmentCreationForm: boolean;
  shouldShowAttachmentDeleteForm: boolean;
  shouldShowChecklistCreationForm: boolean;
  shouldShowChecklistUpdateForm: boolean;
  shouldShowChecklistDeleteForm: boolean;
}

// Enhanced form detection function
export function detectFormType(
  messageContent: string,
  role: string
): FormDetectionResult {
  // Only process assistant messages
  if (role !== "assistant") {
    return {
      shouldShowBoardCreationForm: false,
      shouldShowBoardUpdateForm: false,
      shouldShowBoardDeleteForm: false,
      shouldShowBoardCloseForm: false,
      shouldShowListCreationForm: false,
      shouldShowListUpdateForm: false,
      shouldShowListDeleteForm: false,
      shouldShowListCloseForm: false,
      shouldShowCardCreationForm: false,
      shouldShowCardUpdateForm: false,
      shouldShowCardDeleteForm: false,
      shouldShowWorkspaceCreationForm: false,
      shouldShowWorkspaceUpdateForm: false,
      shouldShowWorkspaceDeleteForm: false,
      shouldShowLabelCreationForm: false,
      shouldShowLabelUpdateForm: false,
      shouldShowLabelDeleteForm: false,
      shouldShowAttachmentCreationForm: false,
      shouldShowAttachmentDeleteForm: false,
      shouldShowChecklistCreationForm: false,
      shouldShowChecklistUpdateForm: false,
      shouldShowChecklistDeleteForm: false,
    };
  }

  const content = messageContent.toLowerCase();

  return {
    shouldShowBoardCreationForm:
      formDetectionPatterns.boardCreation.test(content),
    shouldShowBoardUpdateForm: formDetectionPatterns.boardUpdate.test(content),
    shouldShowBoardDeleteForm: formDetectionPatterns.boardDelete.test(content),
    shouldShowBoardCloseForm: formDetectionPatterns.boardClose.test(content),
    shouldShowListCreationForm:
      formDetectionPatterns.listCreation.test(content),
    shouldShowListUpdateForm: formDetectionPatterns.listUpdate.test(content),
    shouldShowListDeleteForm: formDetectionPatterns.listDelete.test(content),
    shouldShowListCloseForm: formDetectionPatterns.listClose.test(content),
    shouldShowCardCreationForm:
      formDetectionPatterns.cardCreation.test(content),
    shouldShowCardUpdateForm: formDetectionPatterns.cardUpdate.test(content),
    shouldShowCardDeleteForm: formDetectionPatterns.cardDelete.test(content),
    shouldShowWorkspaceCreationForm:
      formDetectionPatterns.workspaceCreation.test(content),
    shouldShowWorkspaceUpdateForm:
      formDetectionPatterns.workspaceUpdate.test(content),
    shouldShowWorkspaceDeleteForm:
      formDetectionPatterns.workspaceDelete.test(content),
    shouldShowLabelCreationForm:
      formDetectionPatterns.labelCreation.test(content),
    shouldShowLabelUpdateForm: formDetectionPatterns.labelUpdate.test(content),
    shouldShowLabelDeleteForm: formDetectionPatterns.labelDelete.test(content),
    shouldShowAttachmentCreationForm:
      formDetectionPatterns.attachmentCreation.test(content),
    shouldShowAttachmentDeleteForm:
      formDetectionPatterns.attachmentDelete.test(content),
    shouldShowChecklistCreationForm:
      formDetectionPatterns.checklistCreation.test(content),
    shouldShowChecklistUpdateForm:
      formDetectionPatterns.checklistUpdate.test(content),
    shouldShowChecklistDeleteForm:
      formDetectionPatterns.checklistDelete.test(content),
  };
}

// Utility function to check if any form should be shown
export function shouldShowAnyForm(
  detectionResult: FormDetectionResult
): boolean {
  return Object.values(detectionResult).some(Boolean);
}

// Utility function to get the primary form type (for debugging/logging)
export function getPrimaryFormType(
  detectionResult: FormDetectionResult
): string | null {
  const formTypes = [
    { key: "boardCreation", name: "Board Creation" },
    { key: "boardUpdate", name: "Board Update" },
    { key: "boardDelete", name: "Board Delete" },
    { key: "boardClose", name: "Board Close" },
    { key: "listCreation", name: "List Creation" },
    { key: "listUpdate", name: "List Update" },
    { key: "listDelete", name: "List Delete" },
    { key: "listClose", name: "List Close" },
    { key: "cardCreation", name: "Card Creation" },
    { key: "cardUpdate", name: "Card Update" },
    { key: "cardDelete", name: "Card Delete" },
    { key: "workspaceCreation", name: "Workspace Creation" },
    { key: "workspaceUpdate", name: "Workspace Update" },
    { key: "workspaceDelete", name: "Workspace Delete" },
    { key: "labelCreation", name: "Label Creation" },
    { key: "labelUpdate", name: "Label Update" },
    { key: "labelDelete", name: "Label Delete" },
    { key: "attachmentCreation", name: "Attachment Creation" },
    { key: "attachmentDelete", name: "Attachment Delete" },
    { key: "checklistCreation", name: "Checklist Creation" },
    { key: "checklistUpdate", name: "Checklist Update" },
    { key: "checklistDelete", name: "Checklist Delete" },
  ];

  for (const formType of formTypes) {
    if (detectionResult[formType.key as keyof FormDetectionResult]) {
      return formType.name;
    }
  }

  return null;
}
