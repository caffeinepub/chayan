import { useEffect, useRef } from 'react';
import { useMessages } from '../../hooks/useQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useDeleteMessage } from '../messages/useDeleteMessage';
import { Trash2, Lock } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface MessageTimelineProps {
  recipient: Principal;
  currentUser: Principal;
}

export default function MessageTimeline({ recipient, currentUser }: MessageTimelineProps) {
  const { data: messages, isLoading, error } = useMessages(recipient);
  const scrollRef = useRef<HTMLDivElement>(null);
  const deleteMessage = useDeleteMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">Failed to load messages</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender.toString() === currentUser.toString();
            const isUndecryptable = msg.decryptionError;

            return (
              <div
                key={msg.timestamp.toString()}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`group relative max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-[oklch(0.65_0.19_145)] text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {isUndecryptable ? (
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <Lock className="h-4 w-4" />
                        <span>Message cannot be decrypted</span>
                      </div>
                    ) : (
                      <p className="break-words">{msg.plaintext}</p>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {isCurrentUser && !isUndecryptable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteMessage.mutate({ recipient, timestamp: msg.timestamp })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-center">
          <div className="space-y-2">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        </div>
      )}
    </ScrollArea>
  );
}
