import { useConversationStore } from '../../state/conversationsStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';

export default function ConversationList() {
  const { conversations, selectedContact, setSelectedContact } = useConversationStore();

  // Sort conversations by last message time
  const sortedConversations = [...conversations].sort((a, b) => 
    (b.lastMessageTime || 0) - (a.lastMessageTime || 0)
  );

  return (
    <aside className="w-80 border-r border-border/50 bg-card/20">
      <div className="border-b border-border/50 p-4">
        <h2 className="font-semibold text-foreground">Conversations</h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        {sortedConversations.length > 0 ? (
          <div className="p-2 space-y-1">
            {sortedConversations.map((conv) => {
              const principal = Principal.fromText(conv.principal);
              const isSelected = selectedContact?.toString() === conv.principal;
              
              return (
                <Button
                  key={conv.principal}
                  variant={isSelected ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedContact(principal, conv.displayName)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="font-medium truncate">{conv.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Tap to view messages
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No conversations yet.<br />Start a new chat to begin.
            </p>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
