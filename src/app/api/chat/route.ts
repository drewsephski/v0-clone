import { streamText, convertToCoreMessages, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { OPENROUTER_MODELS, OpenRouterModel, chatWithOpenRouter } from '@/lib/openrouter';

// Type for message part that might contain text
interface TextPart {
  text?: string;
  type?: string;
  [key: string]: unknown;
}

// Helper function to extract text content from UIMessage
function getMessageContent(message: UIMessage): string {
  // Handle string messages
  if (typeof message === 'string') return message;
  
  // Handle object messages with content
  if (message && typeof message === 'object' && 'content' in message) {
    const content = message.content;
    
    // Handle string content
    if (typeof content === 'string') {
      return content;
    }
    
    // Handle array content (like in Vercel AI SDK)
    if (Array.isArray(content)) {
      return content
        .map(part => {
          // Handle string parts
          if (typeof part === 'string') return part;
          
          // Handle object parts
          if (part && typeof part === 'object') {
            const partObj = part as TextPart;
            // Handle different possible text field locations
            if ('text' in partObj) return String(partObj.text);
            if ('type' in partObj && partObj.type === 'text' && 'text' in partObj) {
              return String(partObj.text);
            }
          }
          
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }
  }
  
  // Fallback to string representation
  return JSON.stringify(message);
}

export const maxDuration = 30; // Allow streaming for up to 30 seconds

type RequestBody = {
  messages: UIMessage[];
  model: string;
  webSearch?: boolean;
  temperature?: number;
  maxTokens?: number;
};

export async function POST(req: Request) {
  try {
    console.log('Received chat request');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { messages, model = 'mistralai/mistral-7b-instruct:free', webSearch, temperature = 0.7, maxTokens = 1000 } = body as RequestBody;
    
    if (!messages || !Array.isArray(messages)) {
      const error = new Error('Invalid messages format');
      console.error('Invalid messages format:', messages);
      console.error('Error in chat API:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error details:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if using OpenRouter (for models not directly supported by Vercel AI SDK)
    const isOpenRouterModel = model in OPENROUTER_MODELS;

    if (isOpenRouterModel) {
      try {
        // Get the API key from the request headers or environment variables
        const openRouterApiKey = req.headers.get('x-openrouter-api-key') || process.env.OPENROUTER_API_KEY;
        
        if (!openRouterApiKey) {
          throw new Error('OpenRouter API key is required');
        }

        // Format messages for OpenRouter
        const formattedMessages = messages.map(msg => {
          const content = getMessageContent(msg);
          let role: 'user' | 'assistant' | 'system' = 'user';
          
          // Handle role assignment
          if (typeof msg === 'object' && msg !== null && 'role' in msg) {
            const msgRole = (msg as { role: string }).role;
            
            // Map Vercel AI SDK roles to OpenRouter roles
            if (msgRole === 'assistant' || msgRole === 'system') {
              role = msgRole as 'assistant' | 'system';
            }
            // data/tool messages default to 'user' role
          }
          
          return {
            role,
            content: content.trim()
          };
        }).filter(msg => msg.content); // Remove empty messages

        // Make sure we have messages to process
        if (!formattedMessages.length) {
          throw new Error('No valid messages to process');
        }

        console.log('Sending to OpenRouter:', {
          model,
          messages: formattedMessages,
          temperature,
          maxTokens
        });

        // Call the OpenRouter API
        const response = await chatWithOpenRouter(
          formattedMessages,
          model as OpenRouterModel,
          temperature,
          maxTokens
        );

        // Create a stream from the response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Handle string response
              if (typeof response === 'string') {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: response })}\n\n`));
              } 
              // Handle AsyncIterable response
              else if (response && typeof response === 'object' && response !== null) {
                // Check if the response is an async iterable
                const maybeAsyncIterable = response as { [Symbol.asyncIterator]?: () => AsyncIterator<unknown> };
                if (typeof maybeAsyncIterable[Symbol.asyncIterator] === 'function') {
                  // Type assertion to handle async iterable
                  const asyncIterable = response as AsyncIterable<unknown>;
                  for await (const chunk of asyncIterable) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: String(chunk) })}\n\n`));
                  }
                }
              } 
              // Handle other response types
              else {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: String(response) })}\n\n`));
              }
              controller.close();
            } catch (error) {
              console.error('Error streaming response:', error);
              controller.error(error);
            }
          },
        });

        return new Response(stream, {
          headers: { 
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('OpenRouter API error:', error);
        throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // For models supported by Vercel AI SDK
    const getModel = () => {
      if (webSearch) {
        return google('gemini-1.5-pro-latest'); // Use Gemini for web search
      }
      
      if (model.startsWith('openai/')) {
        return openai(model.replace('openai/', ''));
      }
      
      if (model.startsWith('anthropic/')) {
        return anthropic(model.replace('anthropic/', ''));
      }
      
      // Default to Google's model
      const modelName = model.startsWith('google/') 
        ? model.replace('google/', '') 
        : model;
      return google(modelName);
    };

    const systemMessages = [
      'You are a helpful AI assistant.',
      'Answer questions clearly and concisely.',
      ...(webSearch ? ['When web search is enabled, use the latest information from the web to answer questions.'] : []),
      'When providing information from the web, always cite your sources using the provided source URLs.',
      'For complex questions, break down your reasoning step by step.',
    ].filter(Boolean);

    const result = streamText({
      model: getModel(),
      messages: convertToCoreMessages(messages),
      system: systemMessages.join(' '),
      maxRetries: 2,
      temperature,
    });

    // Convert the stream to a UI message stream response
    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('AI API error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request.',
        details: error instanceof Error ? error.message : String(error)
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
