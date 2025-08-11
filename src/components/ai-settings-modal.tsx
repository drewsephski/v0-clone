'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AIModelProvider, PROVIDER_MODELS } from '@/types/ai-settings';
import { useAISettings } from '@/hooks/use-ai-settings';

interface AISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsModal({ open, onOpenChange }: AISettingsModalProps) {
  const { settings, updateSettings, resetToDefaults, models } = useAISettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleProviderChange = (provider: AIModelProvider) => {
    setLocalSettings(prev => ({
      ...prev,
      provider,
      // Reset model to first available model for the provider
      model: PROVIDER_MODELS[provider]?.[0] || ''
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      resetToDefaults();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Model Settings</DialogTitle>
          <DialogDescription>
            Configure your AI model preferences and API keys.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={localSettings.provider}
              onValueChange={(value) => handleProviderChange(value as AIModelProvider)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PROVIDER_MODELS).map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">
              {localSettings.provider === 'openrouter' 
                ? 'OpenRouter API Key' 
                : `${localSettings.provider.charAt(0).toUpperCase() + localSettings.provider.slice(1)} API Key`}
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${localSettings.provider} API key`}
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {localSettings.temperature}</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.temperature < 0.3 ? 'Precise' : 
                 localSettings.temperature < 0.7 ? 'Balanced' : 'Creative'}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[localSettings.temperature]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, temperature: value }))}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens: {localSettings.maxTokens}</Label>
            <Slider
              id="maxTokens"
              min={100}
              max={4000}
              step={100}
              value={[localSettings.maxTokens]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, maxTokens: value }))}
              className="py-4"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
