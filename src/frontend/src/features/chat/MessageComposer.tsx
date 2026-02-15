import { useState } from 'react';
import { useSendMessage } from '../messages/useSendMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface MessageComposerProps {
  recipient: Principal;
}

export default function MessageComposer({ recipient }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useSendMessage();

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage.mutate(
      { recipient, plaintext: message },
      {
        onSuccess: () => {
          setMessage('');
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/50 bg-card/20 p-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sendMessage.isPending}
          className="min-h-[60px] max-h-[120px] resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
          className="bg-[oklch(0.65_0.19_145)] hover:bg-[oklch(0.60_0.19_145)] text-white self-end"
          size="icon"
        >
          {sendMessage.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {sendMessage.isError && (
        <p className="mt-2 text-xs text-destructive">Failed to send message. Please try again.</p>
      )}
    </div>
  );
}
