# Trello AI Assistant

An intelligent Trello management assistant built with Next.js, Vercel AI SDK v5, and OpenAI. This application provides both a conversational interface and direct API access for managing Trello boards, lists, cards, workspaces, and more.

## Features

- **AI-Powered Trello Management**: Create, update, delete, and manage Trello resources through natural language
- **Dual API Modes**: Both conversational AI chat and direct API access for programmatic integration
- **Real-time Streaming**: Live responses from OpenAI with streaming capabilities using Vercel AI SDK v5
- **Interactive Forms**: Smart form detection and generation for complex operations
- **Comprehensive Tool Suite**: Full CRUD operations for boards, lists, cards, labels, attachments, checklists, and workspaces
- **Backend Infrastructure**: Built-in rate limiting, caching, and monitoring (transparent to users)
- **Error Recovery**: Intelligent error handling with automatic repair mechanisms
- **Performance Optimized**: UI throttling, LRU caching, and efficient state management
- **Modern UI**: Clean, accessible interface built with shadcn/ui components
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Chat History**: Persistent conversation management with sidebar navigation
- **Enhanced UX**: Stop/regenerate controls, loading states, and keyboard shortcuts

## API Architecture

The application uses a **consolidated API architecture** with a single endpoint that supports both modes:

### Single API Endpoint: `/api/chat`

**Chat Mode** (Default):

```json
POST /api/chat
{
  "mode": "chat",
  "messages": [
    {
      "role": "user",
      "parts": [{"type": "text", "text": "Create a new board"}]
    }
  ]
}
```

**Direct API Mode**:

```json
POST /api/chat
{
  "mode": "api",
  "operation": "createBoard",
  "params": {
    "name": "My Board",
    "description": "Board description",
    "visibility": "private"
  }
}
```

### Backend Features (Transparent to Users)

- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Caching**: LRU cache for read operations (5-minute TTL)
- **Monitoring**: Request logging, error tracking, and performance metrics
- **Error Handling**: Standardized error responses with proper HTTP status codes

### Supported Operations

The API supports all Trello operations:

**Boards**: `listBoards`, `getBoard`, `createBoard`, `updateBoard`, `deleteBoard`
**Lists**: `listLists`, `getList`, `createList`, `updateList`, `deleteList`, `archiveList`, `unarchiveList`
**Cards**: `listCards`, `getCard`, `createCard`, `updateCard`, `deleteCard`
**Labels**: `listLabels`, `getLabel`, `createLabel`, `updateLabel`, `deleteLabel`, `addLabelToCard`, `removeLabelFromCard`
**Attachments**: `listAttachments`, `getAttachment`, `createAttachment`, `deleteAttachment`
**Checklists**: `listChecklists`, `getChecklist`, `createChecklist`, `updateChecklist`, `deleteChecklist`, `createChecklistItem`, `updateChecklistItem`, `deleteChecklistItem`
**Members**: `listMembers`, `getMember`, `addMemberToBoard`, `removeMemberFromBoard`
**Workspaces**: `listWorkspaces`, `getWorkspace`, `createWorkspace`, `updateWorkspace`, `deleteWorkspace`

## Getting Started

### Prerequisites

- Node.js 18.x or later
- OpenAI API key
- Trello API credentials (optional, for full functionality)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your API keys:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for Trello functionality
TRELLO_API_KEY=your_trello_api_key_here
TRELLO_API_TOKEN=your_trello_api_token_here
```

4. Get Trello API credentials (optional):

   - Visit [Trello App Key](https://trello.com/app-key)
   - Copy your API Key
   - Generate a token by visiting: `https://trello.com/1/authorize?key=YOUR_API_KEY&response_type=token&scope=read,write&expiration=never&name=TrelloAI`
   - Replace `YOUR_API_KEY` with your actual API key and authorize the application

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

Once the application is running, you can interact with the Trello AI Assistant using natural language:

- **"Create a new board called 'Project Planning'"** - Creates a new Trello board
- **"Add a list to my board for 'In Progress' tasks"** - Creates a new list
- **"Create a card for 'Review design mockups'"** - Creates a new card
- **"Show me all my boards"** - Lists all accessible boards
- **"Update the board description"** - Shows an update form

The assistant will automatically detect your intent and show the appropriate interactive form or execute the requested action.

## Deployment

This application can be easily deployed on Vercel. Make sure to add your environment variables in your Vercel project settings:

- `OPENAI_API_KEY` (required)
- `TRELLO_API_KEY` (optional)
- `TRELLO_API_TOKEN` (optional)

## Architecture

The application uses a **consolidated architecture** with modern infrastructure:

### Backend Infrastructure

- **Single API Endpoint**: `/api/chat` handles both AI chat and direct API calls
- **Rate Limiting**: In-memory sliding window rate limiter (100 requests/15 minutes)
- **Caching**: LRU cache for read operations with automatic invalidation
- **Monitoring**: Request logging, error tracking, and performance metrics
- **Error Handling**: Standardized error responses with proper HTTP status codes

### Frontend Architecture

- **Vercel AI SDK v5**: Modern streaming with `DefaultChatTransport` and `UIMessage`
- **Tool Registry**: Centralized tool management for easier maintenance
- **Type Safety**: Full TypeScript support with proper type definitions
- **Performance**: UI throttling and efficient state management

### Key Components

- **API Route**: `/app/api/chat/route.ts` - Consolidated endpoint with dual modes
- **Trello Tools**: `/TrelloTools/` - Comprehensive suite of Trello management tools
- **Infrastructure**: `/lib/` - Rate limiting, caching, monitoring, and API helpers
- **UI Components**: `/components/` - Reusable React components with shadcn/ui
- **Form Detection**: Smart form generation based on user intent
- **Error Handling**: Robust error recovery and user feedback

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Vercel AI SDK](https://v5.ai-sdk.dev/) - AI integration
- [OpenAI](https://openai.com/) - Language model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Trello API](https://developer.atlassian.com/cloud/trello/) - Trello integration
