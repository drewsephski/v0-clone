# AI Chatbot with Next.js

A modern, responsive AI chatbot application built with Next.js, TypeScript, Tailwind CSS, and the OpenAI API. This application provides a clean, user-friendly interface for interacting with an AI assistant.

## Features

- Real-time chat interface with message history
- Responsive design that works on desktop and mobile
- Dark/light mode support
- Markdown rendering for rich text responses
- Loading states and error handling

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- OpenAI API key (get one from [OpenAI](https://platform.openai.com/api-keys))

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ai-chatbot.git
   cd ai-chatbot
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy the example environment file and add your OpenAI API key:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your OpenAI API key.

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for server-rendered applications
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [OpenAI API](https://platform.openai.com/) - For AI-powered chat completions

## Project Structure

- `src/app` - Main application pages and API routes
- `src/components` - Reusable React components
- `src/components/chat` - Chat-specific components
- `src/lib` - Utility functions and configurations

## Deployment

### Vercel

The easiest way to deploy this application is to use [Vercel](https://vercel.com/):

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import the repository on Vercel
3. Add your OpenAI API key as an environment variable
4. Deploy!

### Other Platforms

You can also deploy to other platforms that support Next.js applications, such as:

- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Railway](https://railway.app/)

## License

This project is open source and available under the [MIT License](LICENSE).
