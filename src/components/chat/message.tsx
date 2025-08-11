import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

export function Message({ role, content, isLoading = false }: MessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={cn(
      "flex items-start gap-4 p-4",
      isUser ? "bg-muted/50" : "bg-background"
    )}>
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          {isUser ? (
            <AvatarFallback>U</AvatarFallback>
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="font-medium">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          isLoading && "animate-pulse"
        )}>
          {isLoading ? 'Thinking...' : content}
        </div>
      </div>
    </div>
  );
}
