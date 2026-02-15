import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import ChayanHeader from './ChayanHeader';
import ConversationList from '../features/conversations/ConversationList';
import ConversationView from '../features/chat/ConversationView';
import NewChatDialog from '../features/contacts/NewChatDialog';
import { useConversationStore } from '../state/conversationsStore';
import { useCurrentUserProfile } from '../features/profile/useCurrentUserProfile';
import type { Principal } from '@icp-sdk/core/principal';

export default function ChatLayout() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [showNewChat, setShowNewChat] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const { selectedContact, addOrUpdateConversation } = useConversationStore();
  
  // Fetch or create user profile
  const { data: profile, isLoading: profileLoading, isFetched } = useCurrentUserProfile();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  const handleStartChat = (contact: Principal, contactName: string) => {
    if (actor) {
      actor.startConversation(contact).then(() => {
        // Add to conversation list immediately
        addOrUpdateConversation(contact, contactName);
        useConversationStore.getState().setSelectedContact(contact, contactName);
        setShowNewChat(false);
      }).catch(console.error);
    }
  };

  const handleDisplayNameUpdated = (newName: string) => {
    setDisplayName(newName);
  };

  // Show loading state while profile is being fetched/created
  if (profileLoading || !isFetched) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChayanHeader 
        displayName={displayName}
        onNewChat={() => setShowNewChat(true)}
        onDisplayNameUpdated={handleDisplayNameUpdated}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ConversationList />
        
        <main className="flex-1 flex flex-col">
          {selectedContact ? (
            <ConversationView />
          ) : (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <img 
                    src="/assets/generated/chayan-logo.dim_512x512.png" 
                    alt="chayan" 
                    className="h-10 w-10 opacity-50"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Welcome to chayan</h2>
                  <p className="mt-2 text-muted-foreground">
                    Select a conversation or start a new chat
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <NewChatDialog 
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onSelectContact={handleStartChat}
      />
    </div>
  );
}
