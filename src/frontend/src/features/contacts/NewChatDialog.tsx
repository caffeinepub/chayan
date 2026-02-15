import { useState } from 'react';
import { useSearchUsers } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (contact: Principal, contactName: string) => void;
}

export default function NewChatDialog({ open, onOpenChange, onSelectContact }: NewChatDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users, isLoading } = useSearchUsers(searchTerm);

  const handleSelect = (principal: Principal, name: string) => {
    onSelectContact(principal, name);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border border-border/50">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="p-2 space-y-1">
                {users.map(([principal, name]) => (
                  <Button
                    key={principal.toString()}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleSelect(principal, name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {principal.toString().slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">Start typing to search</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
