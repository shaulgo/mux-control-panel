'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AppAsset } from '@/lib/mux/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { Eye, Trash2 } from 'lucide-react';
import Image from 'next/image';

type AssetsTableProps = {
  assets: AppAsset[];
  onViewAsset: (asset: AppAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  isLoading?: boolean;
};

export function AssetsTable({
  assets,
  onViewAsset,
  onDeleteAsset,
  isLoading = false,
}: AssetsTableProps): React.ReactElement {
  const getStatusBadge = (status: string): React.ReactElement => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'preparing':
        return <Badge variant="warning">Preparing</Badge>;
      case 'errored':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getThumbnailUrl = (asset: AppAsset): string | null => {
    const playbackId = asset.playback_ids?.[0]?.id;
    if (!playbackId) return null;
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=160&height=90&fit_mode=crop`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center">
        No assets found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Preview</TableHead>
          <TableHead>Asset ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Aspect Ratio</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map(asset => (
          <TableRow key={asset.id}>
            <TableCell>
              {getThumbnailUrl(asset) ? (
                <Image
                  src={getThumbnailUrl(asset)!}
                  alt="Asset thumbnail"
                  width={64}
                  height={40}
                  className="h-10 w-16 rounded object-cover"
                />
              ) : (
                <div className="bg-muted h-10 w-16 rounded" />
              )}
            </TableCell>
            <TableCell className="font-mono text-sm">{asset.id}</TableCell>
            <TableCell>{getStatusBadge(asset.status)}</TableCell>
            <TableCell>
              {asset.duration ? formatDuration(asset.duration) : '—'}
            </TableCell>
            <TableCell>{asset.aspect_ratio ?? '—'}</TableCell>
            <TableCell>{formatDate(asset.created_at)}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewAsset(asset)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View asset</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteAsset(asset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete asset</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
