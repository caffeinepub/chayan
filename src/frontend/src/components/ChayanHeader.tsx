import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useConversationStore } from '../state/conversationsStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageSquarePlus, LogOut, User } from 'lucide-react';

interface ChayanHeaderProps {
  displayName: string;
  onNewChat: () => void;
}

export default function ChayanHeader({ displayName, onNewChat }: ChayanHeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { clearAllConversations } = useConversationStore();

  const handleSignOut = async () => {
    // Clear all cached data
    queryClient.clear();
    clearAllConversations();
    
    // Sign out from Internet Identity
    await clear();
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/chayan-logo.dim_512x512.png" 
            alt="chayan logo" 
            className="h-8 w-8"
          />
          <h1 className="text-xl font-bold text-foreground">chayan</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onNewChat}
            className="bg-[oklch(0.65_0.19_145)] hover:bg-[oklch(0.60_0.19_145)] text-white"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
