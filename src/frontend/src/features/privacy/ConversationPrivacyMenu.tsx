import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useConversationStore } from '../../state/conversationsStore';
import { clearConversationKeys } from '../../lib/storage/localKeyStore';
import { getConversationId } from '../../lib/crypto/chayanCrypto';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, KeyRound, Trash2 } from 'lucide-react';

export default function ConversationPrivacyMenu() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { selectedContact, clearSelectedContact, removeConversation } = useConversationStore();
  const [showClearKeysDialog, setShowClearKeysDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedContact) throw new Error('Not ready');
      await actor.deleteConversation(selectedContact);
    },
    onSuccess: () => {
      if (selectedContact) {
        removeConversation(selectedContact);
        queryClient.invalidateQueries({ queryKey: ['messages', selectedContact.toString()] });
        clearSelectedContact();
      }
      setShowDeleteDialog(false);
    },
  });

  const handleClearKeys = () => {
    if (selectedContact && identity) {
      const currentUserPrincipal = identity.getPrincipal();
      const conversationId = getConversationId(currentUserPrincipal, selectedContact);
      clearConversationKeys(conversationId);
      
      // Invalidate messages query to show decryption errors
      queryClient.invalidateQueries({ queryKey: ['messages', selectedContact.toString()] });
      setShowClearKeysDialog(false);
    }
  };

  const handleDeleteConversation = () => {
    deleteConversationMutation.mutate();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowClearKeysDialog(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Clear encryption keys
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showClearKeysDialog} onOpenChange={setShowClearKeysDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear encryption keys?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the local encryption keys for this conversation. You will no longer be able to decrypt past messages on this device. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearKeys}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear keys
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation from your account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              disabled={deleteConversationMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConversationMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
