import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Copy, Loader2, Pencil, RefreshCw, AlertCircle } from 'lucide-react';
import { type ReactNode, forwardRef } from 'react';

export type MessageVariant = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: MessageVariant;
  content: string;
  status?: MessageStatus;
  onEdit?: (content: string) => void;
  onRegenerate?: () => void;
  children?: ReactNode;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({
    className,
    from,
    content,
    status = 'sent',
    onEdit,
    onRegenerate,
    children,
    ...props
  }, ref) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(content);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex w-full items-start gap-3 p-4',
          from === 'user' ? 'justify-end' : 'justify-start',
          className
        )}
        {...props}
      >
        <div 
          className={cn(
            'relative flex max-w-[min(85%,42rem)] flex-col gap-2 rounded-2xl px-4 py-3 text-sm',
            'shadow-sm transition-all duration-200 ease-in-out',
            'break-words overflow-hidden',
            from === 'user' 
              ? 'bg-primary/90 text-primary-foreground rounded-br-none' 
              : 'bg-muted/50 dark:bg-muted/80 text-foreground rounded-bl-none',
            status === 'error' && 'border border-destructive/50 bg-destructive/10 dark:bg-destructive/5',
            {
              'opacity-80': status === 'sending',
              'hover:shadow-md': from === 'user',
            }
          )}
        >
          {/* Message content */}
          <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-p:leading-relaxed prose-p:my-1.5 prose-p:last:mb-0">
            {children || content}
          </div>

          {/* Status indicator */}
          <div className={cn(
            'mt-1 flex items-center justify-end gap-1.5 text-xs min-h-[1.25rem]',
            from === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground',
            'flex-wrap justify-end'
          )}>
            {status === 'sending' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Sending...</span>
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive dark:text-destructive-foreground">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="whitespace-normal break-words">Failed to send message. Please try again.</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 px-1.5 text-xs text-destructive hover:bg-destructive/20 dark:text-destructive-foreground"
                  onClick={onRegenerate}
                >
                  Retry
                </Button>
              </span>
            )}
            {status === 'sent' && from === 'user' && (
              <span className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                <Check className="h-3 w-3" />
                <span>Sent</span>
              </span>
            )}
          </div>

          {/* Action buttons - only show on hover/focus */}
          <div className={cn(
            'absolute -top-2 right-0 flex gap-1 opacity-0 transition-opacity',
            'rounded-full bg-background/80 backdrop-blur-sm shadow-lg ring-1 ring-border p-0.5',
            'group-hover:opacity-100 group-focus-within:opacity-100',
            from === 'user' ? 'right-0' : 'left-0',
            'transform -translate-y-full',
            'z-10'
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted/50"
                  onClick={handleCopy}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="sr-only">Copy message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Copy message</TooltipContent>
            </Tooltip>
            
            {from === 'user' && onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-muted/50"
                    onClick={() => onEdit(content)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Edit message</TooltipContent>
              </Tooltip>
            )}
            
            {from === 'assistant' && onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-muted/50"
                    onClick={onRegenerate}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="sr-only">Regenerate response</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Regenerate response</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = 'Message';
