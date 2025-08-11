'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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

const ChatBot = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = useAISettings();
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
      },
    }),
  });
  const isLoading = status === 'submitted' || status === 'streaming';
  const [input, setInput] = useState('');

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
          {messages.length === 0 && !isLoading && (
            <div className="text-center font-semibold mt-8">
              <p className="text-3xl mt-4">What can we build together?</p>
            </div>
          )}
          <Conversation className="flex-1">
            <ConversationContent className="space-y-6 p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'group flex',
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[80%]',
                    m.role === 'user' ? 'flex justify-end' : ''
                  )}>
                    <Message
                      from={m.role === 'user' ? 'user' : 'assistant'}
                      content={m.parts.map(part => part.type === 'text' ? part.text : '').join('')}
                      className={cn(
                        'transition-all duration-200',
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-muted/80 dark:bg-muted/50 rounded-tl-none',
                        'group-hover:shadow-md'
                      )}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <Message 
                  from="assistant"
                  content=""
                  status="sending"
                >
                  <TypingIndicator />
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton
              className="bg-background/80 backdrop-blur-sm border border-border/60 shadow-lg hover:bg-background/90"
            />
          </Conversation>
          {error && (
            <Message from="assistant" content={`Error: ${error.message}`} />
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 && (
              <div className="mb-4 space-y-4">
                <ContextualSuggestions
                  suggestions={[
                    {
                      text: 'Create a responsive navbar with Tailwind CSS',
                      icon: <Sparkles className="h-4 w-4" />,
                      onClick: () => setInput('Create a responsive navbar with Tailwind CSS'),
                    },
                    {
                      text: 'Build a todo app with React',
                      icon: <Lightbulb className="h-4 w-4" />,
                      onClick: () => setInput('Build a todo app with React'),
                    },
                    {
                      text: 'Make a landing page for a coffee shop',
                      icon: <MessageSquarePlus className="h-4 w-4" />,
                      onClick: () => setInput('Make a landing page for a coffee shop'),
                    },
                  ]}
                  title="Try one of these examples"
                />
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage({ text: input });
                      setInput('');
                    }
                  }}
                  className="w-full"
                >
                  <div className="relative w-full">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim()) {
                            sendMessage({ text: input });
                            setInput('');
                          }
                        }
                      }}
                      placeholder="Describe the app you want to build..."
                      disabled={isLoading}
                      className="min-h-[60px] max-h-[200px] resize-none pr-12"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="blue"
                      disabled={isLoading || !input.trim()}
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
            />
          </WebPreviewNavigation>
          <WebPreviewBody />
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