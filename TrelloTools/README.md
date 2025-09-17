# Trello AI Tools

This directory contains AI-powered tools for managing Trello boards, lists, cards, and other Trello resources through the Vercel AI SDK.

## Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Trello API Configuration
# Get these from: https://trello.com/app-key
TRELLO_API_KEY=your_trello_api_key_here
TRELLO_API_TOKEN=your_trello_api_token_here
```

### 2. Getting Trello API Credentials

1. Go to [Trello App Key](https://trello.com/app-key)
2. Copy your API Key
3. Generate a token by visiting: `https://trello.com/1/authorize?key=YOUR_API_KEY&response_type=token&scope=read,write&expiration=never&name=TrelloAI`
4. Replace `YOUR_API_KEY` with your actual API key
5. Authorize the application and copy the token

## Available Tools

### Board Tools (`BoardTools/`)

- **createBoard**: Create new Trello boards with custom settings
- **getBoard**: Retrieve detailed board information
- **updateBoard**: Modify board properties and settings
- **deleteBoard**: Permanently delete boards
- **listBoards**: List all accessible boards with filtering

### List Tools (`ListTools/`)

- **createList**: Create new lists within boards with custom positioning
- **getList**: Retrieve detailed list information including cards
- **updateList**: Modify list properties, position, and settings
- **deleteList**: Permanently delete lists
- **listLists**: List all lists in a board with filtering

### Card Tools (`CardTools/`)

- **createCard**: Create new cards in lists with descriptions, due dates, and assignments
- **getCard**: Retrieve detailed card information including attachments, members, and checklists
- **updateCard**: Modify card properties, move between lists, and update assignments
- **deleteCard**: Permanently delete cards
- **listCards**: List all cards in a board or list with filtering

## Usage

The tools are automatically integrated into your AI chatbot. Users can interact with them through natural language:

### Examples

**Board Operations:**

- "Create a new board called 'Project Planning'"
- "Show me all my boards"
- "Get details for board ID 12345"
- "Update the board settings to make it public"
- "Delete the board with ID 67890"

**List Operations:**

- "Create a new list called 'To Do' in board 12345"
- "Show me all lists in board 12345"
- "Get details for list ID 67890"
- "Update the list name to 'In Progress'"
- "Delete the list with ID 67890"

**Card Operations:**

- "Create a new card called 'Task 1' in list 12345"
- "Show me all cards in board 12345"
- "Get details for card ID 67890"
- "Update the card description to 'Updated task'"
- "Move the card to list 54321"
- "Delete the card with ID 67890"

## Tool Features

### Comprehensive Board Management

- Full CRUD operations for boards
- Detailed board information retrieval
- Flexible filtering and field selection
- Error handling and validation

### Security

- Environment variable protection
- Input validation using Zod schemas
- Proper error handling and user feedback

### AI Integration

- Natural language processing
- Streaming responses
- Multi-step tool usage
- Context-aware responses

## Architecture

```
TrelloTools/
├── BoardTools/
│   ├── create-board.ts
│   ├── get-board.ts
│   ├── update-board.ts
│   ├── delete-board.ts
│   ├── list-boards.ts
│   └── index.ts
├── index.ts
└── README.md
```

## Future Enhancements

- List management tools
- Card management tools
- Member management tools
- Team/Organization tools
- Power-up integration tools

## Error Handling

All tools include comprehensive error handling:

- API credential validation
- Network error handling
- Trello API error responses
- User-friendly error messages

## Contributing

When adding new tools:

1. Follow the existing pattern in `BoardTools/`
2. Use Zod for input validation
3. Include comprehensive error handling
4. Add proper TypeScript types
5. Update the main index file
6. Add tool descriptions to the system prompt
