// UI-Compatible Trello Tools for streamUI
// These tools return React components instead of data objects

// Board Tools
export { listBoardsTool } from "../TrelloTools/BoardTools/list-boards-ui";
export { createBoardTool } from "../TrelloTools/BoardTools/create-board-ui";

// Note: For now, we'll start with just these two tools to test the streamUI implementation
// Additional tools can be added following the same pattern:
// 1. Create a new .tsx file with the tool definition
// 2. Use the 'generate' function that yields loading components and returns result components
// 3. Export the tool from this registry
// 4. Import it in the actions.tsx file

// Future tools to implement:
// - getBoardTool
// - updateBoardTool
// - deleteBoardTool
// - createListTool
// - getListTool
// - updateListTool
// - deleteListTool
// - listListsTool
// - createCardTool
// - getCardTool
// - updateCardTool
// - deleteCardTool
// - listCardsTool
// - And all other Trello tools...
