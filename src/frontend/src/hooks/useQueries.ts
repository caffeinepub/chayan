import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { decryptMessage, getConversationId } from '../lib/crypto/chayanCrypto';
import type { Principal } from '@icp-sdk/core/principal';
import type { Message } from '../backend';

export interface DecryptedMessage {
  sender: Principal;
  recipient: Principal;
  timestamp: bigint;
  ciphertext: string;
  plaintext: string;
  decryptionError?: boolean;
}

export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim() || !identity) return [];
      const results = await actor.searchUsers(searchTerm);
      
      // Filter out the current user from search results
      const currentPrincipal = identity.getPrincipal().toString();
      return results.filter(([principal]) => principal.toString() !== currentPrincipal);
    },
    enabled: !!actor && !isFetching && !!identity && searchTerm.trim().length > 0,
  });
}

export function useMessages(recipient: Principal | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<DecryptedMessage[]>({
    queryKey: ['messages', recipient?.toString()],
    queryFn: async () => {
      if (!actor || !recipient || !identity) return [];
      
      const messages = await actor.getMessages(recipient);
      const currentUserPrincipal = identity.getPrincipal();
      const conversationId = getConversationId(currentUserPrincipal, recipient);
      
      return messages.map((msg: Message) => {
        try {
          const plaintext = decryptMessage(msg.ciphertext, conversationId);
          return {
            ...msg,
            plaintext,
            decryptionError: false,
          };
        } catch {
          return {
            ...msg,
            plaintext: '',
            decryptionError: true,
          };
        }
      });
    },
    enabled: !!actor && !isFetching && !!recipient && !!identity,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}
