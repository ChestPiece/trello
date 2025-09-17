# AI Chatbot with Vercel AI SDK and OpenAI

This is a chatbot application built with Next.js, Vercel AI SDK, and OpenAI's Responses API.

## Features

- Real-time streaming responses from OpenAI
- Chat history persistence
- Modern UI similar to ChatGPT and Claude
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 18.x or later
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This application can be easily deployed on Vercel. Make sure to add your `OPENAI_API_KEY` as an environment variable in your Vercel project settings.

## Built With

- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://v5.ai-sdk.dev/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
