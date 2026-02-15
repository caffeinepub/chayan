import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { encryptMessage, getConversationId } from '../../lib/crypto/chayanCrypto';
import type { Principal } from '@icp-sdk/core/principal';

interface SendMessageParams {
  recipient: Principal;
  plaintext: string;
}

export function useSendMessage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, plaintext }: SendMessageParams) => {
      if (!actor) throw new Error('Actor not initialized');
      if (!identity) throw new Error('Not authenticated');
      
      const currentUserPrincipal = identity.getPrincipal();
      const conversationId = getConversationId(currentUserPrincipal, recipient);
      const ciphertext = encryptMessage(plaintext, conversationId);
      
      await actor.sendMessage(recipient, ciphertext);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.recipient.toString()] });
    },
  });
}
