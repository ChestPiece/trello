# Trello Chat Assistant

An AI-powered chat assistant for Trello that helps you manage boards, cards, lists, and more through natural language conversations.

## Features

- 💬 **Natural Language Interface**: Interact with Trello using everyday language
- 🔄 **Real-time AI Responses**: Get immediate responses through streaming
- 🛠️ **Tool Integration**: Direct integration with Trello API for creating, reading, updating and deleting Trello resources
- 🎮 **Interactive UI**: Dynamic form generation for complex operations
- 🎭 **Theme Support**: Light and dark mode
- ⚙️ **Configurable**: Settings panel for API keys, model selection and transport options
- 📊 **Visual Cards**: Rich visual representations of Trello objects

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Trello account and API credentials
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
TRELLO_API_KEY=your_trello_api_key
TRELLO_API_TOKEN=your_trello_token
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Start a Conversation**: Type natural language requests like "Show me all my boards" or "Create a new card for the Marketing board"
2. **Interactive Forms**: For creation/update operations, the assistant will generate interactive forms
3. **Visual Results**: View rich visual representations of your Trello data
4. **Settings**: Configure your API keys and preferences via the Settings panel

## Recent Improvements

- ✅ Added cancel button for streaming responses
- ✅ Enhanced error message display with more details and better retry functionality
- ✅ Fixed dynamic data loading in form components
- ✅ Improved error handling in API routes
- ✅ Fixed feedback loop for tool results in conversation
- ✅ Added Settings panel for configuring API keys and transport options
- ✅ Optimized rendering of Trello objects to prevent timeouts
- ✅ Fixed controlled/uncontrolled component state transitions

## Technical Stack

- **Framework**: Next.js 15
- **UI**: React 19 with Tailwind CSS
- **AI**: Vercel AI SDK v5 with OpenAI integration
- **API Integration**: Trello REST API
- **State Management**: React Context API
- **Styling**: Tailwind CSS with shadcn/ui components

## Project Structure

```
/
├── app/             # Next.js app directory
│   ├── api/         # API routes for AI and tools
│   └── page.tsx     # Main page
├── components/      # React components
│   ├── Chat/        # Chat components
│   │   └── generative-ui/  # Trello object UI components
│   ├── Settings/    # Settings panel
│   └── ui/          # UI components (buttons, inputs, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── public/          # Static assets
└── TrelloTools/     # Trello API integration tools
```

## Error Handling and Debugging

If you encounter any issues:

1. Check the browser console for errors
2. Verify your API keys in the Settings panel
3. Ensure your Trello API keys have the necessary permissions
4. Look for detailed error messages in the chat interface

## License

[MIT](LICENSE)
