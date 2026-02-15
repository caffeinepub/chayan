import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateDisplayName } from './useCurrentUserProfile';
import { AlertCircle } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDisplayName: string;
  onSaved: (newName: string) => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  currentDisplayName,
  onSaved,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [validationError, setValidationError] = useState('');
  const updateMutation = useUpdateDisplayName();

  const handleSave = async () => {
    // Validate
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setValidationError('Display name cannot be empty');
      return;
    }

    setValidationError('');

    try {
      await updateMutation.mutateAsync(trimmedName);
      onSaved(trimmedName);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update display name:', error);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentDisplayName);
    setValidationError('');
    updateMutation.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your display name. This is how other users will see you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setValidationError('');
              }}
              placeholder="Enter your display name"
              disabled={updateMutation.isPending}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {updateMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to update display name. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[oklch(0.65_0.19_145)] hover:bg-[oklch(0.60_0.19_145)] text-white"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
