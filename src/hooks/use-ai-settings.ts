import { useState, useEffect } from 'react';
import { AIModelConfig, AIModelProvider, DEFAULT_AI_SETTINGS, PROVIDER_MODELS } from '@/types/ai-settings';

export function useAISettings() {
  const [settings, setSettings] = useState<AIModelConfig>(DEFAULT_AI_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('aiSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Ensure we have all required fields
          setSettings({
            ...DEFAULT_AI_SETTINGS,
            ...parsed,
            // Ensure provider is valid
            provider: Object.keys(PROVIDER_MODELS).includes(parsed.provider)
              ? parsed.provider as AIModelProvider
              : DEFAULT_AI_SETTINGS.provider,
            // Ensure model is valid for the provider
            model: PROVIDER_MODELS[parsed.provider as AIModelProvider]?.includes(parsed.model)
              ? parsed.model
              : PROVIDER_MODELS[parsed.provider as AIModelProvider]?.[0] || DEFAULT_AI_SETTINGS.model
          });
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<AIModelConfig>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('aiSettings', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset to default settings
  const resetToDefaults = () => {
    setSettings(DEFAULT_AI_SETTINGS);
    localStorage.setItem('aiSettings', JSON.stringify(DEFAULT_AI_SETTINGS));
  };

  return {
    settings,
    isLoading,
    updateSettings,
    resetToDefaults,
    models: PROVIDER_MODELS[settings.provider] || []
  };
}
