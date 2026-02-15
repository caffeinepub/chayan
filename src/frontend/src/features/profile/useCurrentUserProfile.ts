import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { generateEncryptionKeyMaterial } from '../../lib/crypto/chayanCrypto';
import type { Profile } from '../../backend';

export function useCurrentUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<Profile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      
      const profile = await actor.getCallerProfile();
      
      // If no profile exists, create one with default values
      if (!profile) {
        const principal = identity.getPrincipal();
        const defaultName = `User ${principal.toString().slice(0, 8)}`;
        const encryptionKey = generateEncryptionKeyMaterial();
        
        await actor.saveCallerProfile(defaultName, encryptionKey);
        
        return {
          displayName: defaultName,
          encryptionKey,
        };
      }
      
      return profile;
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: Infinity, // Profile doesn't change unless we update it
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useUpdateDisplayName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newName: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateDisplayName(newName);
    },
    onSuccess: (_, newName) => {
      // Update the cached profile
      queryClient.setQueryData<Profile | null>(['currentUserProfile'], (old) => {
        if (!old) return null;
        return {
          ...old,
          displayName: newName,
        };
      });
    },
  });
}
