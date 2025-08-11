import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Copy, Loader2, Pencil, RefreshCw, AlertCircle, Bot, User } from 'lucide-react';
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
    const isUser = from === 'user';

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex w-full items-start gap-3',
          isUser && 'justify-end',
          className
        )}
        {...props}
      >
        {/* Avatar */}
        {!isUser && (
          <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-zinc-700/50">
            <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-400">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'relative flex max-w-[min(85%,42rem)] flex-col gap-1 rounded-xl px-3.5 py-2.5 text-sm',
            'shadow-sm transition-all duration-200 ease-in-out',
            'break-words overflow-hidden',
            isUser
              ? 'dark:bg-blue-600 bg-blue-500 text-primary-foreground rounded-br-none shadow-lg dark:shadow-blue-600/20'
              : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-bl-none',
            status === 'error' && 'border border-destructive/50 bg-destructive/10 dark:bg-destructive/5',
            {
              'opacity-80': status === 'sending',
              'hover:shadow-md': status !== 'error',
            },
          )}
        >
          {/* Message content */}
        <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-p:leading-normal prose-p:my-1 prose-p:first:mt-0 prose-p:last:mb-0">
            {children || content}
          </div>

          {/* Status indicator */}
          <div className={cn(
            'mt-1 flex items-center justify-end gap-1.5 text-xs min-h-[1rem]',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
            'flex-wrap justify-end'
          )}>
            {status === 'sending' && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Sending...</span>
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1.5 text-destructive dark:text-destructive-foreground/80">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Failed to send</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-1.5 py-0.5 text-xs hover:bg-destructive/20"
                  onClick={onRegenerate}
                >
                  Retry
                </Button>
              </span>
            )}
            {status === 'sent' && isUser && (
              <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Check className="h-3 w-3" />
                <span>Sent</span>
              </span>
            )}
          </div>
        </div>

        {/* User Avatar */}
        {isUser && (
          <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-blue-500/50">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}

        {/* Action buttons - positioned inside the bubble on hover */}
        <div className={cn(
          'absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity',
          'group-hover:opacity-100 group-focus-within:opacity-100',
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
            <TooltipContent side="top" className="text-xs">Copy</TooltipContent>
          </Tooltip>

          {isUser && onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted/50"
                  onClick={() => onEdit(content)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
            </Tooltip>
          )}

          {!isUser && onRegenerate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted/50"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="sr-only">Regenerate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Regenerate</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }
);

Message.displayName = 'Message';
