'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  dotClassName?: string;
}

export function TypingIndicator({
  className,
  size = 'md',
  dotClassName,
  ...props
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <div
      className={cn('flex items-center space-x-1', className)}
      {...props}
      aria-label="Typing..."
    >
      <span
        className={cn(
          'inline-block rounded-full bg-muted-foreground/50',
          sizeClasses[size],
          'animate-typing-dot-1',
          dotClassName
        )}
      />
      <span
        className={cn(
          'inline-block rounded-full bg-muted-foreground/50',
          sizeClasses[size],
          'animate-typing-dot-2',
          dotClassName
        )}
      />
      <span
        className={cn(
          'inline-block rounded-full bg-muted-foreground/50',
          sizeClasses[size],
          'animate-typing-dot-3',
          dotClassName
        )}
      />
    </div>
  );
}

// Add global styles for the typing animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes typing-dot {
      0% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
      100% { transform: translateY(0); }
    }
    .animate-typing-dot-1 {
      animation: typing-dot 1.4s infinite ease-in-out;
    }
    .animate-typing-dot-2 {
      animation: typing-dot 1.4s infinite 0.2s ease-in-out;
    }
    .animate-typing-dot-3 {
      animation: typing-dot 1.4s infinite 0.4s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}
