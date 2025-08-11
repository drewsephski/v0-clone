'use client';

import { useState, FormEvent } from 'react';
import { FileIcon, Lightbulb, MessageSquarePlus, Sparkles, Loader2, Send, Settings } from 'lucide-react';
import { AISettingsModal } from '@/components/ai-settings-modal';
import { useAISettings } from '@/hooks/use-ai-settings';

import { cn } from '@/lib/utils';
import { Message } from '@/components/ai-elements/message';
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation';
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview';
import { TypingIndicator } from '@/components/ai-elements/typing-indicator';
import { ContextualSuggestions } from '@/components/ai-elements/contextual-suggestions';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface Chat {
  id: string;
  demo: string;
}

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const { settings } = useAISettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  interface ChatAttachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  }

  interface ChatMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
    attachments?: ChatAttachment[];
  }

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessage = message.trim();
    
    // Don't send empty messages or if already loading
    if (!userMessage || isLoading) return;

    const messageId = `msg-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: messageId,
      type: 'user' as const,
      content: userMessage,
      timestamp: new Date(),
      status: 'sending' as const
    };
    
    // Add the user message to the chat history
    setChatHistory(prev => [...prev, newMessage]);
    setMessage(''); // Clear the input field
    
    setIsLoading(true);

    try {
      // Update message status to sent
      setChatHistory(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' as const }
          : msg
      ));
      
      // Prepare the request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add the appropriate API key header based on provider
      if (settings.provider === 'openrouter') {
        headers['x-openrouter-api-key'] = settings.apiKey;
      } else if (settings.provider === 'openai') {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
      } else if (settings.provider === 'anthropic') {
        headers['x-api-key'] = settings.apiKey;
      }
      
      // Make the API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ],
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          chatId: currentChat?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to process chat request');
      }

      const chat: Chat = await response.json();
      setCurrentChat(chat);
      
      // Add assistant's response
      const assistantMessageId = `msg-${Date.now()}`;
      setChatHistory(prev => [
        ...prev,
        {
          id: assistantMessageId,
          type: 'assistant' as const,
          content: 'Generated new app preview. Check the preview panel!',
          timestamp: new Date(),
          status: 'sent' as const
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      
      // Update the user message to show error
      setChatHistory(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'error' as const }
          : msg
      ));
      
      // Add error message from assistant
      const errorMessageId = `msg-${Date.now()}`;
      const errorMessage = error instanceof Error ? error.message : 'Sorry, there was an error processing your request.';
      
      setChatHistory(prev => [
        ...prev,
        {
          id: errorMessageId,
          type: 'assistant' as const,
          content: errorMessage,
          timestamp: new Date(),
          status: 'error' as const
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Chat Panel */}
      <div className="w-1/2 flex flex-col border-r">
        {/* Header */}
        <div className="border-b p-3 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">v0 Clone</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {settings.model.split('/').pop()}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSettingsOpen(true)}
              title="AI Settings"
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center font-semibold mt-8">
              <p className="text-3xl mt-4">What can we build together?</p>
            </div>
          ) : (
            <>
              <Conversation className="flex-1">
                <ConversationContent className="space-y-6 p-4">
                  {chatHistory.map((msg) => {
                    // System messages (like file uploads)
                    if (msg.type === 'system') {
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div className={cn(
                            'max-w-[80%] w-full',
                            msg.status === 'error' ? 'border-l-4 border-l-red-500 pl-4' : ''
                          )}>
                            <Message
                              from="assistant"
                              content={msg.content}
                              status={msg.status}
                              className={cn(
                                msg.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-muted/50',
                                'transition-colors duration-200'
                              )}
                            >
                              {msg.attachments?.map((file) => (
                                <div key={file.id} className={cn(
                                  'mt-2 flex items-center gap-2 rounded-lg p-2 text-sm transition-colors',
                                  msg.status === 'error' 
                                    ? 'bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                                    : 'bg-background border',
                                  'group-hover:shadow-sm'
                                )}>
                                  <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                  <span className="truncate flex-1">{file.name}</span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))}
                            </Message>
                          </div>
                        </div>
                      );
                    }
                    
                    // Regular messages (user or assistant)
                    const isUser = msg.type === 'user';
                    return (
                      <div 
                        key={msg.id} 
                        className={cn(
                          'group flex',
                          isUser ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div className={cn(
                          'max-w-[80%]',
                          isUser ? 'flex justify-end' : ''
                        )}>
                          <Message 
                            from={isUser ? 'user' : 'assistant'}
                            content={msg.content}
                            status={msg.status || 'sent'}
                            className={cn(
                              'transition-all duration-200',
                              isUser 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-muted/80 dark:bg-muted/50 rounded-tl-none',
                              msg.status === 'error' && 'border-l-4 border-l-red-500',
                              'group-hover:shadow-md'
                            )}
                            onRegenerate={isUser ? () => {
                              setMessage(msg.content);
                              // In a real app, you would trigger a resend of the message
                            } : undefined}
                          >
                            {msg.content}
                            {msg.attachments?.map((file) => (
                              <div key={file.id} className="mt-2">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'inline-flex items-center gap-2 text-sm p-2 rounded-lg transition-colors',
                                    'border',
                                    isUser
                                      ? 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-blue-400/30'
                                      : 'bg-muted hover:bg-muted/80 text-foreground border-border'
                                  )}
                                >
                                  <FileIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate max-w-[200px]">{file.name}</span>
                                  <span className="text-xs opacity-70 whitespace-nowrap">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </a>
                              </div>
                            ))}
                          </Message>
                        </div>
                      </div>
                    );
                  })}
                </ConversationContent>
                <ConversationScrollButton 
                  className="bg-background/80 backdrop-blur-sm border border-border/60 shadow-lg hover:bg-background/90"
                />
              </Conversation>
              {isLoading && (
                <Message 
                  from="assistant"
                  content=""
                  status="sending"
                >
                  <TypingIndicator />
                </Message>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="max-w-2xl mx-auto">
            {!currentChat && !inputFocused && message.length === 0 && (
              <div className="mb-4 space-y-4">
                <ContextualSuggestions
                  suggestions={[
                    {
                      text: 'Create a responsive navbar with Tailwind CSS',
                      icon: <Sparkles className="h-4 w-4" />,
                      onClick: () => setMessage('Create a responsive navbar with Tailwind CSS'),
                    },
                    {
                      text: 'Build a todo app with React',
                      icon: <Lightbulb className="h-4 w-4" />,
                      onClick: () => setMessage('Build a todo app with React'),
                    },
                    {
                      text: 'Make a landing page for a coffee shop',
                      icon: <MessageSquarePlus className="h-4 w-4" />,
                      onClick: () => setMessage('Make a landing page for a coffee shop'),
                    },
                  ]}
                  title="Try one of these examples"
                />
              </div>
            )}

            {inputFocused && message.length === 0 && (
              <div className="mb-4">
                <ContextualSuggestions
                  suggestions={[
                    {
                      text: 'Add a dark mode toggle',
                      onClick: () => setMessage(prev => prev + ' Add a dark mode toggle'),
                    },
                    {
                      text: 'Make it mobile responsive',
                      onClick: () => setMessage(prev => prev + ' Make it mobile responsive'),
                    },
                    {
                      text: 'Add animations',
                      onClick: () => setMessage(prev => prev + ' Add smooth animations'),
                    },
                  ]}
                  title="Enhance your request"
                />
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <form onSubmit={handleSendMessage} className="w-full">
                  <div className="relative w-full">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e as unknown as FormEvent<HTMLFormElement>);
                        }
                      }}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                      placeholder="Describe the app you want to build..."
                      disabled={isLoading}
                      className="min-h-[60px] max-h-[200px] resize-none pr-12"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="blue"
                      disabled={isLoading || !message.trim()}
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground text-right">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col">
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl
              readOnly
              placeholder="Your app here..."
              value={currentChat?.demo}
            />
          </WebPreviewNavigation>
          <WebPreviewBody src={currentChat?.demo} />
        </WebPreview>
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default ChatBot;