import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Principal } from '@icp-sdk/core/principal';

export interface ConversationInfo {
  principal: string; // Store as string for persistence
  displayName: string;
  lastMessageTime?: number;
}

interface ConversationState {
  selectedContact: Principal | null;
  selectedContactName: string;
  conversations: ConversationInfo[];
  setSelectedContact: (contact: Principal, name: string) => void;
  clearSelectedContact: () => void;
  addOrUpdateConversation: (principal: Principal, displayName: string) => void;
  removeConversation: (principal: Principal) => void;
  clearAllConversations: () => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      selectedContact: null,
      selectedContactName: '',
      conversations: [],
      
      setSelectedContact: (contact, name) => 
        set({ selectedContact: contact, selectedContactName: name }),
      
      clearSelectedContact: () => 
        set({ selectedContact: null, selectedContactName: '' }),
      
      addOrUpdateConversation: (principal, displayName) =>
        set((state) => {
          const principalStr = principal.toString();
          const existing = state.conversations.find(c => c.principal === principalStr);
          
          if (existing) {
            return {
              conversations: state.conversations.map(c =>
                c.principal === principalStr
                  ? { ...c, displayName, lastMessageTime: Date.now() }
                  : c
              ),
            };
          }
          
          return {
            conversations: [
              ...state.conversations,
              { principal: principalStr, displayName, lastMessageTime: Date.now() },
            ],
          };
        }),
      
      removeConversation: (principal) =>
        set((state) => ({
          conversations: state.conversations.filter(
            c => c.principal !== principal.toString()
          ),
        })),
      
      clearAllConversations: () =>
        set({ conversations: [], selectedContact: null, selectedContactName: '' }),
    }),
    {
      name: 'chayan-conversations',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
