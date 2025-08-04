'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MuxAsset } from '@/lib/mux/types';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import {
  Copy,
  Download,
  Eye,
  MoreVertical,
  Play,
  Share,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ModernAssetsTableProps = {
  assets: MuxAsset[];
  onViewAsset: (asset: MuxAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  onDuplicateAsset?: (assetId: string) => void;
  isLoading?: boolean;
};

export function ModernAssetsTable({
  assets,
  onViewAsset,
  onDeleteAsset,
  onDuplicateAsset,
  isLoading = false,
}: ModernAssetsTableProps): React.ReactElement {
  const router = useRouter();
  const getStatusBadge = (status: string): React.ReactElement => {
    type StatusKey = 'ready' | 'preparing' | 'errored' | 'unknown';

    const variants: Record<
      StatusKey,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className: string;
      }
    > = {
      ready: {
        variant: 'default',
        className:
          'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-800',
      },
      preparing: {
        variant: 'secondary',
        className:
          'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-500/10 dark:text-warning-400 dark:border-warning-800',
      },
      errored: {
        variant: 'destructive',
        className:
          'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-800',
      },
      unknown: {
        variant: 'outline',
        className: '',
      },
    };

    const key: StatusKey =
      status === 'ready' || status === 'preparing' || status === 'errored'
        ? (status as StatusKey)
        : 'unknown';

    const config = variants[key];

    return (
      <Badge
        variant={config.variant}
        className={cn('font-medium', config.className)}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getThumbnailUrl = (asset: MuxAsset): string | null => {
    // playback_ids may be undefined; guard and return null when absent
    const ids = asset.playback_ids;
    if (!ids || ids.length === 0 || !ids[0]?.id) return null;
    const playbackId = ids[0].id;
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=160&height=90&fit_mode=crop`;
  };

  const handleRowAction = (action: string, asset: MuxAsset): void => {
    switch (action) {
      case 'view':
        onViewAsset(asset);
        break;
      case 'duplicate':
        onDuplicateAsset?.(asset.id);
        break;
      case 'delete':
        if (
          confirm(
            'Are you sure you want to delete this asset? This action cannot be undone.'
          )
        ) {
          onDeleteAsset(asset.id);
        }
        break;
      case 'copy-id':
        void navigator.clipboard.writeText(asset.id);
        // You could add a toast notification here
        break;
      case 'share':
        const playbackId = asset.playback_ids?.[0]?.id;
        if (playbackId) {
          const shareUrl = `https://stream.mux.com/${playbackId}`;
          void navigator.clipboard.writeText(shareUrl);
          // You could add a toast notification here
        }
        break;
      case 'download':
        const downloadPlaybackId = asset.playback_ids?.[0]?.id;
        if (downloadPlaybackId) {
          const downloadUrl = `https://stream.mux.com/${downloadPlaybackId}.mp4`;
          window.open(downloadUrl, '_blank');
        }
        break;
      default:
        break;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="shadow-card border-0">
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="bg-muted h-12 w-20 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-1/4 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-1/6 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-6 w-16 animate-pulse rounded-full" />
                <div className="bg-muted h-8 w-8 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <Card className="shadow-card border-0">
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="bg-muted/50 mb-4 rounded-full p-4">
            <Play className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            No assets found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Upload your first video to get started with Mux video processing and
            delivery.
          </p>
          <Button
            className="bg-accent-500 hover:bg-accent-600 text-white"
            onClick={() => router.push('/dashboard/upload')}
            aria-label="Upload Asset"
          >
            Upload Asset
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden border-0">
      <div className="relative max-h-[600px] overflow-auto">
        <Table>
          {/* Sticky Header */}
          <TableHeader className="bg-card border-border sticky top-0 z-10 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground w-20 text-xs font-semibold tracking-wide uppercase">
                Preview
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Asset ID
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Duration
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Ratio
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Created
              </TableHead>
              <TableHead className="text-muted-foreground w-12 text-xs font-semibold tracking-wide uppercase">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body with Zebra Rows */}
          <TableBody>
            {assets.map((asset, index) => (
              <TableRow
                key={asset.id}
                className={cn(
                  'hover:bg-muted/50 border-border/50 border-b transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                )}
              >
                {/* Preview */}
                <TableCell className="py-4">
                  {(() => {
                    const thumb = getThumbnailUrl(asset);
                    if (!thumb) {
                      return (
                        <div className="bg-muted border-border/50 flex h-12 w-20 items-center justify-center rounded-md border">
                          <Play className="text-muted-foreground h-4 w-4" />
                        </div>
                      );
                    }
                    return (
                      <div className="group relative">
                        <Image
                          src={thumb}
                          alt="Asset thumbnail"
                          width={80}
                          height={48}
                          className="border-border/50 group-hover:border-accent-500/50 h-12 w-20 rounded-md border object-cover transition-colors"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 transition-colors group-hover:bg-black/20">
                          <Play className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    );
                  })()}
                </TableCell>

                {/* Asset ID */}
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <code className="text-foreground bg-muted/50 rounded px-2 py-1 font-mono text-sm">
                      {asset.id.slice(0, 8)}...
                    </code>
                    <p className="text-muted-foreground text-xs">
                      {asset.passthrough ?? 'Untitled'}
                    </p>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-4">
                  {getStatusBadge(asset.status)}
                </TableCell>

                {/* Duration */}
                <TableCell className="text-foreground py-4 text-sm">
                  {asset.duration ? formatDuration(asset.duration) : '—'}
                </TableCell>

                {/* Aspect Ratio */}
                <TableCell className="text-foreground py-4 text-sm">
                  {asset.aspect_ratio ?? '—'}
                </TableCell>

                {/* Created */}
                <TableCell className="text-muted-foreground py-4 text-sm">
                  {formatDate(asset.created_at)}
                </TableCell>

                {/* Actions Dropdown */}
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted h-8 w-8"
                        aria-label="Open menu"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleRowAction('view', asset)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRowAction('copy-id', asset)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Asset ID
                      </DropdownMenuItem>
                      {onDuplicateAsset && (
                        <DropdownMenuItem
                          onClick={() => handleRowAction('duplicate', asset)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleRowAction('share', asset)}
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRowAction('download', asset)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRowAction('delete', asset)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
