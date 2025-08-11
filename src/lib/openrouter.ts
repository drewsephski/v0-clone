// OpenRouter configuration
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// List of available models with their details
export const OPENROUTER_MODELS = {
  // Free models
  'mistralai/mistral-7b-instruct:free': {
    name: 'Mistral 7B Instruct (Free)',
    context: 8192,
    pricing: 'Free',
    provider: 'Mistral AI'
  },
  'google/gemma-7b-it:free': {
    name: 'Gemma 7B (Free)',
    context: 8192,
    pricing: 'Free',
    provider: 'Google'
  },
  // Paid models (uncomment and add your API key in .env to use)
  'openai/gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    context: 16385,
    pricing: 'Paid',
    provider: 'OpenAI'
  },
  'anthropic/claude-3-haiku': {
    name: 'Claude 3 Haiku',
    context: 200000,
    pricing: 'Paid',
    provider: 'Anthropic'
  }
} as const;

export type OpenRouterModel = keyof typeof OPENROUTER_MODELS;

// Default model to use
const DEFAULT_MODEL: OpenRouterModel = 'mistralai/mistral-7b-instruct:free';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type MessageLike = 
  | ChatMessage 
  | { role: string; content: string | number | boolean | object | null | undefined };

export async function chatWithOpenRouter(
  messages: MessageLike[],
  model: OpenRouterModel = DEFAULT_MODEL,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key is not set. Please set the OPENROUTER_API_KEY environment variable.');
    }

    // Ensure all messages have the correct format
    const formattedMessages = messages.map(msg => {
      // If it's already in the correct format, return as is
      if ('role' in msg && typeof msg.role === 'string' && 'content' in msg) {
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: String(msg.content || '')
        };
      }
      // Otherwise, try to convert to the correct format
      return {
        role: 'user' as const,
        content: typeof msg === 'string' ? msg : JSON.stringify(msg)
      };
    });

    console.log('Sending to OpenRouter API:', {
      model,
      messages: formattedMessages,
      temperature,
      maxTokens
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Chatbot',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: Math.max(0, Math.min(1, temperature)), // Ensure between 0 and 1
        max_tokens: Math.max(1, Math.min(4096, maxTokens)), // Ensure reasonable limits
      })
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('OpenRouter API error response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      const errorMessage = responseData.error?.message || 
                         responseData.error ||
                         response.statusText ||
                         'Failed to fetch from OpenRouter API';
      
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    if (!responseData.choices || !responseData.choices[0]?.message?.content) {
      console.error('Unexpected OpenRouter API response format:', responseData);
      throw new Error('Unexpected response format from OpenRouter API');
    }

    return String(responseData.choices[0].message.content);
  } catch (error) {
    console.error('Error in chatWithOpenRouter:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred while communicating with OpenRouter');
  }
}
