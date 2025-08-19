'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useAssetMetadata,
  useUpdateAssetMetadata,
  type UpdateAssetMetadataInput,
} from '@/hooks/use-asset-metadata';
import type { AssetId } from '@/lib/mux/types';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type AssetMetadataEditorProps = {
  assetId: AssetId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssetMetadataEditor({
  assetId,
  open,
  onOpenChange,
}: AssetMetadataEditorProps): React.ReactElement {
  const { data: metadata, isLoading } = useAssetMetadata(assetId);
  const updateMetadata = useUpdateAssetMetadata();

  const [formData, setFormData] = useState<UpdateAssetMetadataInput>({
    title: '',
    description: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');

  // Update form data when metadata loads
  useEffect(() => {
    if (metadata) {
      setFormData({
        title: metadata.title || '',
        description: metadata.description || '',
        tags: metadata.tags || [],
      });
    }
  }, [metadata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const metadataUpdate: UpdateAssetMetadataInput = {};

      if (formData.title) {
        metadataUpdate.title = formData.title;
      }
      if (formData.description) {
        metadataUpdate.description = formData.description;
      }
      if (formData.tags?.length) {
        metadataUpdate.tags = formData.tags;
      }

      await updateMetadata.mutateAsync({
        assetId,
        metadata: metadataUpdate,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  };

  const addTag = () => {
    if (
      newTag.trim() &&
      formData.tags &&
      !formData.tags.includes(newTag.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Asset Metadata</DialogTitle>
          <DialogDescription>
            Add or edit metadata for this asset.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-16 animate-pulse rounded" />
            <div className="bg-muted h-8 w-1/2 animate-pulse rounded" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter asset title"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter asset description"
                maxLength={1000}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>

              {/* Existing tags */}
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add new tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  maxLength={50}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={
                    !newTag.trim() || (formData.tags?.length || 0) >= 20
                  }
                  size="icon"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.tags && formData.tags.length >= 20 && (
                <p className="text-muted-foreground text-xs">
                  Maximum of 20 tags allowed
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMetadata.isPending}>
                {updateMetadata.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
