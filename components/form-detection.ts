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
  listArchive: RegExp;
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
  // Board patterns - Make them more specific to avoid false positives
  boardCreation:
    /\b(?:board\s+creation\s+form|create\s+board\s+form|new\s+board\s+form)\b/i,
  boardUpdate:
    /\b(?:board\s+update\s+form|update\s+board\s+form|edit\s+board\s+form|modify\s+board\s+form)\b/i,
  boardDelete:
    /\b(?:board\s+delete\s+form|delete\s+board\s+form|remove\s+board\s+form)\b/i,
  boardClose:
    /\b(?:board\s+close\s+form|close\s+board\s+form|reopen\s+board\s+form)\b/i,

  // List patterns - Make them more specific
  listCreation:
    /\b(?:list\s+creation\s+form|create\s+list\s+form|new\s+list\s+form)\b/i,
  listUpdate:
    /\b(?:list\s+update\s+form|update\s+list\s+form|edit\s+list\s+form|modify\s+list\s+form)\b/i,
  listDelete:
    /\b(?:list\s+delete\s+form|delete\s+list\s+form|remove\s+list\s+form)\b/i,
  listClose:
    /\b(?:list\s+close\s+form|close\s+list\s+form|reopen\s+list\s+form)\b/i,
  listArchive:
    /\b(?:list\s+archive\s+form|archive\s+list\s+form|unarchive\s+list\s+form)\b/i,

  // Card patterns - Make them more specific
  cardCreation:
    /\b(?:card\s+creation\s+form|create\s+card\s+form|new\s+card\s+form)\b/i,
  cardUpdate:
    /\b(?:card\s+update\s+form|update\s+card\s+form|edit\s+card\s+form|modify\s+card\s+form)\b/i,
  cardDelete:
    /\b(?:card\s+delete\s+form|delete\s+card\s+form|remove\s+card\s+form)\b/i,

  // Workspace patterns - Make them more specific
  workspaceCreation:
    /\b(?:workspace\s+creation\s+form|create\s+workspace\s+form|new\s+workspace\s+form)\b/i,
  workspaceUpdate:
    /\b(?:workspace\s+update\s+form|update\s+workspace\s+form|edit\s+workspace\s+form|modify\s+workspace\s+form)\b/i,
  workspaceDelete:
    /\b(?:workspace\s+delete\s+form|delete\s+workspace\s+form|remove\s+workspace\s+form)\b/i,

  // Label patterns - Make them more specific
  labelCreation:
    /\b(?:label\s+creation\s+form|create\s+label\s+form|new\s+label\s+form)\b/i,
  labelUpdate:
    /\b(?:label\s+update\s+form|update\s+label\s+form|edit\s+label\s+form|modify\s+label\s+form)\b/i,
  labelDelete:
    /\b(?:label\s+delete\s+form|delete\s+label\s+form|remove\s+label\s+form)\b/i,

  // Attachment patterns - Make them more specific
  attachmentCreation:
    /\b(?:attachment\s+creation\s+form|create\s+attachment\s+form|add\s+attachment\s+form)\b/i,
  attachmentDelete:
    /\b(?:attachment\s+delete\s+form|delete\s+attachment\s+form|remove\s+attachment\s+form)\b/i,

  // Checklist patterns - Make them more specific
  checklistCreation:
    /\b(?:checklist\s+creation\s+form|create\s+checklist\s+form|new\s+checklist\s+form)\b/i,
  checklistUpdate:
    /\b(?:checklist\s+update\s+form|update\s+checklist\s+form|edit\s+checklist\s+form|modify\s+checklist\s+form)\b/i,
  checklistDelete:
    /\b(?:checklist\s+delete\s+form|delete\s+checklist\s+form|remove\s+checklist\s+form)\b/i,
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
  shouldShowListArchiveForm: boolean;
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
      shouldShowListArchiveForm: false,
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
    shouldShowListArchiveForm: formDetectionPatterns.listArchive.test(content),
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
