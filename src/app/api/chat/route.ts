import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, provider, apiKey, model } = await req.json();

  const getModel = () => {
    switch (provider) {
      case 'google':
        return createGoogleGenerativeAI({ apiKey })(model);
      case 'openai':
        return createOpenAI({ apiKey })(model);
      case 'anthropic':
        return createAnthropic({ apiKey })(model);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  const result = await streamText({
    model: getModel(),
    messages,
  });

  return result.toTextStreamResponse();
}
