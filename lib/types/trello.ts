// Centralized Trello type definitions

// Base response structure
export interface TrelloResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// Error types
export interface TrelloError {
  message: string;
  code?: string;
  status?: number;
}

// Resource interfaces
export interface Board {
  id: string;
  name: string;
  description?: string;
  visibility?: string;
  url?: string;
  shortUrl?: string;
  closed?: boolean;
  pinned?: boolean;
  starred?: boolean;
  organizationId?: string;
  dateLastActivity?: string;
  dateLastView?: string;
  idShort?: number;
  prefs?: Record<string, any>;
  organization?: Record<string, any>;
  lists?: List[];
}

export interface List {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  cards?: Card[];
}

export interface Card {
  id: string;
  name: string;
  desc?: string;
  closed: boolean;
  idList: string;
  idBoard?: string;
  pos: number;
  due?: string;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
  url?: string;
  shortUrl?: string;
  idShort?: number;
  dateLastActivity?: string;
  idAttachmentCover?: string;
  manualCoverAttachment?: boolean;
  idChecklists?: string[];
  idMembersVoted?: string[];
  labels?: Label[];
  members?: Member[];
  attachments?: Attachment[];
  checklists?: Checklist[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  idBoard: string;
}

export interface Member {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  bytes?: number;
  date: string;
}

export interface Checklist {
  id: string;
  name: string;
  idCard: string;
  pos: number;
  checkItems?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  state: "complete" | "incomplete";
  idChecklist: string;
  pos: number;
}

export interface Workspace {
  id: string;
  name: string;
  displayName: string;
  desc?: string;
  descData?: any;
  url?: string;
  website?: string;
  logo?: string;
  prefs?: {
    permissionLevel?: "private" | "public" | "org";
    externalMembersDisabled?: boolean;
    googleAppsVersion?: number;
    orgInviteRestrict?: string;
    boardVisibilityRestrict?: {
      private?: string;
      org?: string;
      public?: string;
    };
    boardDeleteRestrict?: {
      private?: string;
      org?: string;
      public?: string;
    };
    selfJoin?: boolean;
    cardCovers?: boolean;
    hideVotes?: boolean;
    invitations?: "disabled" | "enabled" | "members";
    voting?: "disabled" | "enabled" | "members";
    comments?: "disabled" | "enabled" | "members";
    background?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundImageScaled?: Array<{
      width: number;
      height: number;
      url: string;
    }>;
    backgroundTile?: boolean;
    backgroundBrightness?: "dark" | "light";
    backgroundBottomColor?: string;
    backgroundTopColor?: string;
    canBePublic?: boolean;
    canBeEnterprise?: boolean;
    canBeOrg?: boolean;
    canBePrivate?: boolean;
    canInvite?: boolean;
  };
  memberships?: Array<{
    id: string;
    idMember: string;
    memberType: "admin" | "normal" | "observer";
    unconfirmed: boolean;
    deactivated: boolean;
  }>;
  boards?: Array<{
    id: string;
    name: string;
    desc?: string;
    closed: boolean;
    url: string;
    shortUrl: string;
  }>;
  members?: Array<{
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  }>;
}

// API operation types
export type TrelloOperation =
  | "listBoards"
  | "getBoard"
  | "createBoard"
  | "updateBoard"
  | "deleteBoard"
  | "listLists"
  | "getList"
  | "createList"
  | "updateList"
  | "deleteList"
  | "archiveList"
  | "unarchiveList"
  | "listCards"
  | "getCard"
  | "createCard"
  | "updateCard"
  | "deleteCard"
  | "listLabels"
  | "getLabel"
  | "createLabel"
  | "updateLabel"
  | "deleteLabel"
  | "addLabelToCard"
  | "removeLabelFromCard"
  | "listAttachments"
  | "getAttachment"
  | "createAttachment"
  | "deleteAttachment"
  | "listChecklists"
  | "getChecklist"
  | "createChecklist"
  | "updateChecklist"
  | "deleteChecklist"
  | "createChecklistItem"
  | "updateChecklistItem"
  | "deleteChecklistItem"
  | "listMembers"
  | "getMember"
  | "addMemberToBoard"
  | "removeMemberFromBoard"
  | "listWorkspaces"
  | "getWorkspace"
  | "createWorkspace"
  | "updateWorkspace"
  | "deleteWorkspace";

// Hook options
export interface TrelloHookOptions {
  autoFetch?: boolean;
  refreshTriggers?: string[];
  transform?: (data: any) => any;
}

// Resource type mapping
export type TrelloResourceType =
  | "boards"
  | "lists"
  | "cards"
  | "labels"
  | "attachments"
  | "checklists"
  | "members"
  | "workspaces";

// Generic resource data type
export type TrelloResourceData<T extends TrelloResourceType> =
  T extends "boards"
    ? Board[]
    : T extends "lists"
    ? List[]
    : T extends "cards"
    ? Card[]
    : T extends "labels"
    ? Label[]
    : T extends "attachments"
    ? Attachment[]
    : T extends "checklists"
    ? Checklist[]
    : T extends "members"
    ? Member[]
    : T extends "workspaces"
    ? Workspace[]
    : never;
