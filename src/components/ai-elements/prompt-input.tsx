import * as React from 'react';
import { Send, Loader2, Paperclip, SendHorizonal, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState } from 'react';

export interface PromptInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFileUpload?: (file: File) => void;
  isLoading?: boolean;
  className?: string;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInput({ className, onSubmit, onFileUpload, isLoading, ...props }, ref) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isComposing, setIsComposing] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        // Only submit if there's content
        const value = e.currentTarget.value || '';
        if (value.trim().length > 0) {
          const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
          form.dispatchEvent(submitEvent);
        }
      }
    }
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onFileUpload) {
        onFileUpload(files[0]);
        // Reset the input to allow selecting the same file again
        e.target.value = '';
      }
    };

    return (
      <div className={cn('relative', className)}>
        <div className="flex items-start gap-1 p-1 bg-background rounded-lg border">
          <div className="flex flex-wrap gap-1 p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => document.execCommand('bold', false, '')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => document.execCommand('italic', false, '')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => document.execCommand('insertUnorderedList', false, '')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => document.execCommand('insertOrderedList', false, '')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            {onFileUpload && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </>
            )}
          </div>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const textarea = form.querySelector('textarea');
            const value = textarea?.value || '';
            
            if (onSubmit && value.trim().length > 0) {
              // Clear the input after submission
              if (textarea) {
                textarea.value = '';
                // Trigger any onChange handlers to update parent state
                const inputEvent = new Event('input', { bubbles: true });
                textarea.dispatchEvent(inputEvent);
              }
              onSubmit(e);
            }
          }} 
          className="relative w-full"
        >
          <Textarea
            ref={ref}
            className="pr-12 min-h-[120px] mt-2"
            disabled={isLoading}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            {...props}
          />
          <Button
            type="submit"
            size="icon"
            variant="blue"
            disabled={isLoading || !props.value || (typeof props.value === 'string' && props.value.trim().length === 0)}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full shrink-0 transition-all"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    );
  }
);

PromptInput.displayName = "PromptInput"

export interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  function PromptInputTextarea({ className, minHeight = 60, maxHeight = 200, ...props }, ref) {
    return (
      <Textarea
        ref={ref}
        placeholder="Describe the app you want to build..."
        className={cn(
          `pr-12 min-h-[${minHeight}px] max-h-[${maxHeight}px] resize-none focus-visible:ring-blue-500 border-blue-200`,
          className
        )}
        {...props}
      />
    );
  }
);

export interface PromptInputSubmitProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  status?: 'ready' | 'streaming' | 'error';
}

const PromptInputSubmit = React.forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, status = 'ready', disabled, ...props }, ref) => {
    const isLoading = status === 'streaming';

    return (
      <Button
        ref={ref}
        type="submit"
        size="icon"
        variant="blue"
        disabled={disabled || isLoading}
        className={cn(
          "h-8 w-8 rounded-full shrink-0 transition-all",
          isLoading && "animate-pulse-blue",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    )
  }
)
PromptInputSubmit.displayName = "PromptInputSubmit"

export { PromptInput, PromptInputTextarea, PromptInputSubmit }