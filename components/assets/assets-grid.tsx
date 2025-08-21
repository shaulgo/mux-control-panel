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
import type { AppAssetWithMetadata } from '@/lib/mux/types';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import {
  Copy,
  Edit3,
  Eye,
  MoreVertical,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type AssetsGridProps = {
  assets: AppAssetWithMetadata[];
  onViewAsset: (asset: AppAssetWithMetadata) => void;
  onDeleteAsset: (assetId: string) => void;
  onEditMetadata?: (asset: AppAssetWithMetadata) => void;
  isLoading?: boolean;
};

// Helper functions
const getPlaybackId = (asset: AppAssetWithMetadata): string | undefined => {
  return asset.playback_ids?.[0]?.id;
};

const getHlsUrl = (playbackId: string): string => {
  return `https://stream.mux.com/${playbackId}.m3u8`;
};

const getThumbnailUrl = (playbackId: string): string => {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=320&height=180&fit_mode=crop`;
};

const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

export function AssetsGrid({
  assets,
  onViewAsset,
  onDeleteAsset,
  onEditMetadata,
  isLoading = false,
}: AssetsGridProps): React.ReactElement {
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  const getStatusBadge = (status: string): React.ReactElement | null => {
    // Don't show badge for 'ready' status
    if (status === 'ready') {
      return null;
    }

    type StatusKey = 'preparing' | 'errored' | 'unknown';

    const variants: Record<
      StatusKey,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className: string;
      }
    > = {
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
      status === 'preparing' || status === 'errored'
        ? (status as StatusKey)
        : 'unknown';

    const config = variants[key];

    return (
      <Badge
        variant={config.variant}
        className={cn('text-xs font-medium', config.className)}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handlePlayToggle = (asset: AppAssetWithMetadata): void => {
    if (activeAssetId === asset.id) {
      setActiveAssetId(null);
    } else {
      setActiveAssetId(asset.id);
    }
  };

  const handleCopyHls = async (asset: AppAssetWithMetadata): Promise<void> => {
    const playbackId = getPlaybackId(asset);
    if (playbackId) {
      try {
        await copyToClipboard(getHlsUrl(playbackId));
        // TODO: Add toast notification for successful copy
      } catch (error) {
        console.error('Failed to copy HLS URL:', error);
      }
    }
  };

  const handleAction = (action: string, asset: AppAssetWithMetadata): void => {
    switch (action) {
      case 'view':
        onViewAsset(asset);
        break;
      case 'edit-metadata':
        onEditMetadata?.(asset);
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
      default:
        break;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="shadow-card overflow-hidden border-0">
            <div className="bg-muted aspect-video animate-pulse" />
            <div className="space-y-3 p-4">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
              <div className="bg-muted h-6 w-16 animate-pulse rounded-full" />
            </div>
          </Card>
        ))}
      </div>
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
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {assets.map(asset => {
        const playbackId = getPlaybackId(asset);
        const thumbnailUrl = playbackId ? getThumbnailUrl(playbackId) : null;
        const isPlaying = activeAssetId === asset.id;
        const canPlay = asset.status === 'ready' && playbackId;
        const canCopy = canPlay;

        return (
          <Card
            key={asset.id}
            className="group shadow-card overflow-hidden border-0 transition-all duration-200 hover:shadow-lg"
          >
            {/* Video/Thumbnail Area */}
            <div className="relative aspect-video bg-black">
              {isPlaying && playbackId ? (
                <MuxPlayer
                  playbackId={playbackId}
                  streamType="on-demand"
                  autoPlay={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                  }}
                />
              ) : (
                <>
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={asset.metadata?.title ?? 'Asset thumbnail'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      <Play className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}
                </>
              )}

              {/* Play Overlay - Only show when not playing to allow video interaction */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                    onClick={() => handlePlayToggle(asset)}
                    disabled={!canPlay}
                    aria-label="Play video"
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              )}

              {/* Stop button for playing videos - positioned to not interfere with player controls */}
              {isPlaying && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80"
                    onClick={() => handlePlayToggle(asset)}
                    aria-label="Stop playing"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Duration Badge - adjust position when playing to avoid conflict with stop button */}
              {asset.duration && (
                <div
                  className={`absolute ${isPlaying ? 'left-2' : 'right-2'} bottom-2 z-10`}
                >
                  <Badge
                    variant="secondary"
                    className="border-0 bg-black/60 text-xs text-white"
                  >
                    {formatDuration(asset.duration)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="space-y-3 p-4">
              {/* Title and Status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-foreground line-clamp-2 flex-1 text-sm font-medium">
                    {asset.metadata?.title ?? 'Untitled'}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted ml-2 h-6 w-6 flex-shrink-0"
                        aria-label="Open menu"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleAction('view', asset)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {onEditMetadata && (
                        <DropdownMenuItem
                          onClick={() => handleAction('edit-metadata', asset)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Metadata
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAction('delete', asset)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(asset.status)}
                  <span className="text-muted-foreground text-xs">
                    {formatDate(asset.created_at)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleCopyHls(asset)}
                  disabled={!canCopy}
                  aria-label="Copy HLS URL"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy M3U8
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewAsset(asset)}
                  aria-label="View asset details"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>

              {/* Tags */}
              {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {asset.metadata.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {asset.metadata.tags.length > 2 && (
                    <span className="text-muted-foreground text-xs">
                      +{asset.metadata.tags.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
