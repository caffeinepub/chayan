import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { Principal } from '@icp-sdk/core/principal';
import type { Time } from '../../backend';

interface DeleteMessageParams {
  recipient: Principal;
  timestamp: Time;
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, timestamp }: DeleteMessageParams) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteMessage(recipient, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.recipient.toString()] });
    },
  });
}
