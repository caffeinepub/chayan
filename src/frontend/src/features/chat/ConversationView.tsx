import { useConversationStore } from '../../state/conversationsStore';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import MessageTimeline from './MessageTimeline';
import MessageComposer from './MessageComposer';
import ConversationPrivacyMenu from '../privacy/ConversationPrivacyMenu';
import { User } from 'lucide-react';

export default function ConversationView() {
  const { selectedContact, selectedContactName } = useConversationStore();
  const { identity } = useInternetIdentity();

  if (!selectedContact || !identity) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 bg-card/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{selectedContactName}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedContact.toString().slice(0, 16)}...
            </p>
          </div>
        </div>
        <ConversationPrivacyMenu />
      </div>

      <MessageTimeline recipient={selectedContact} currentUser={identity.getPrincipal()} />
      <MessageComposer recipient={selectedContact} />
    </div>
  );
}
