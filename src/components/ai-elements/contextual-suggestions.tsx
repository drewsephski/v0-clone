'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Suggestion, Suggestions } from './suggestion';

export interface ContextualSuggestion {
  text: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface ContextualSuggestionsProps {
  suggestions: ContextualSuggestion[];
  className?: string;
  title?: string;
  showWhenEmpty?: boolean;
}

export function ContextualSuggestions({
  suggestions,
  className,
  title = 'Try one of these',
  showWhenEmpty = false,
}: ContextualSuggestionsProps) {
  if (!showWhenEmpty && suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
      )}
      <Suggestions>
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            onClick={suggestion.onClick}
            suggestion={suggestion.text}
            className="whitespace-nowrap"
          >
            {suggestion.icon && (
              <span className="mr-2">{suggestion.icon}</span>
            )}
          </Suggestion>
        ))}
      </Suggestions>
    </div>
  );
}
