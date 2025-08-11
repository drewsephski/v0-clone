export type AIModelProvider = 'openrouter' | 'openai' | 'anthropic' | 'google';

export interface AIModelConfig {
  provider: AIModelProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isDefault: boolean;
}

export const DEFAULT_AI_SETTINGS: AIModelConfig = {
  provider: 'openrouter',
  apiKey: '',
  model: 'mistralai/mistral-7b-instruct:free',
  temperature: 0.7,
  maxTokens: 1000,
  isDefault: true
};

export const PROVIDER_MODELS: Record<AIModelProvider, string[]> = {
  openrouter: [
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-7b-it:free',
    'openai/gpt-3.5-turbo',
    'anthropic/claude-3-haiku'
  ],
  openai: [
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-4'
  ],
  anthropic: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  google: [
    'gemini-pro',
    'gemini-1.5-pro-latest'
  ]
};
