# Trello AI Assistant

An intelligent Trello management assistant built with Next.js, Vercel AI SDK, and OpenAI. This application provides a conversational interface for managing Trello boards, lists, cards, workspaces, and more through natural language interactions.

## Features

- **AI-Powered Trello Management**: Create, update, delete, and manage Trello resources through natural language
- **Real-time Streaming**: Live responses from OpenAI with streaming capabilities
- **Interactive Forms**: Smart form detection and generation for complex operations
- **Comprehensive Tool Suite**: Full CRUD operations for boards, lists, cards, labels, attachments, checklists, and workspaces
- **Error Recovery**: Intelligent error handling with automatic repair mechanisms
- **Performance Optimized**: UI throttling and efficient state management
- **Modern UI**: Clean, accessible interface built with shadcn/ui components
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Chat History**: Persistent conversation management with sidebar navigation
- **Enhanced UX**: Stop/regenerate controls, loading states, and keyboard shortcuts

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

The application is built with a modular architecture:

- **API Route**: `/app/api/chat/route.ts` - Handles AI conversations and tool calls
- **Trello Tools**: `/TrelloTools/` - Comprehensive suite of Trello management tools
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
