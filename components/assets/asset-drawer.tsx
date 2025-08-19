'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AppAssetWithMetadata } from '@/lib/mux/types';
import { formatDate, formatDuration } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import { Copy, Edit3 } from 'lucide-react';
import Image from 'next/image';

type AssetDrawerProps = {
  asset: AppAssetWithMetadata | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditMetadata?: (asset: AppAssetWithMetadata) => void;
};

export function AssetDrawer({
  asset,
  open,
  onOpenChange,
  onEditMetadata,
}: AssetDrawerProps): React.ReactElement | null {
  if (!asset) return null;

  // Use the asset directly since it's already typed correctly
  const typedAsset = asset;
  const playbackId = typedAsset.playback_ids?.[0]?.id;
  const thumbnailUrl = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=crop`
    : null;

  const copyToClipboard = (text: string): void => {
    void navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-screen w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Asset Details</SheetTitle>
          <SheetDescription>
            View asset information, playback details, and analytics
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Asset Preview / Player */}
          {playbackId ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
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
            </div>
          ) : (
            thumbnailUrl && (
              <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={thumbnailUrl}
                  alt="Asset preview"
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                />
              </div>
            )
          )}

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="playback">Playback</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Asset ID</label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm">{typedAsset.id}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(typedAsset.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(typedAsset.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p className="text-sm">
                    {typedAsset.duration
                      ? formatDuration(typedAsset.duration)
                      : '—'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Aspect Ratio</label>
                  <p className="text-sm">{typedAsset.aspect_ratio ?? '—'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm">
                    {typedAsset.created_at
                      ? formatDate(typedAsset.created_at)
                      : 'N/A'}
                  </p>
                </div>

                {typedAsset.passthrough && (
                  <div>
                    <label className="text-sm font-medium">Passthrough</label>
                    <p className="text-sm">{typedAsset.passthrough}</p>
                  </div>
                )}
              </div>

              {/* Metadata Section */}
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Metadata</h4>
                  {onEditMetadata && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditMetadata(typedAsset)}
                    >
                      <Edit3 className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <p className="text-sm">
                      {typedAsset.metadata?.title ?? 'No title set'}
                    </p>
                  </div>

                  {typedAsset.metadata?.description && (
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-sm">
                        {typedAsset.metadata.description}
                      </p>
                    </div>
                  )}

                  {typedAsset.metadata?.tags &&
                    typedAsset.metadata.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Tags</label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {typedAsset.metadata.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {typedAsset.metadata && (
                    <div className="text-muted-foreground text-xs">
                      <p>
                        Last updated:{' '}
                        {formatDate(typedAsset.metadata.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {typedAsset.status === 'errored' && (
                <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
                  <h4 className="text-destructive font-medium">Error</h4>
                  <p className="text-destructive mt-2 text-sm">
                    Asset processing failed. Please try uploading again.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="playback" className="space-y-4">
              {typedAsset.playback_ids && typedAsset.playback_ids.length > 0 ? (
                <div className="space-y-4">
                  {/* Inline Mux Player */}
                  <div className="rounded-lg border p-3">
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                      <MuxPlayer
                        playbackId={typedAsset.playback_ids[0]?.id as string}
                        streamType="on-demand"
                        autoPlay={false}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Secure playback uses the first playback ID. Additional IDs
                      are listed below.
                    </p>
                  </div>

                  {/* Playback IDs and URLs */}
                  {typedAsset.playback_ids.map(playbackId => (
                    <div key={playbackId.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Playback ID</h4>
                          <code className="text-muted-foreground text-sm">
                            {playbackId.id}
                          </code>
                        </div>
                        <Badge variant="outline">{playbackId.policy}</Badge>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div>
                          <label className="text-sm font-medium">HLS URL</label>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">
                              https://stream.mux.com/{playbackId.id}.m3u8
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(
                                  `https://stream.mux.com/${playbackId.id}.m3u8`
                                )
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Thumbnail URL
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">
                              https://image.mux.com/{playbackId.id}
                              /thumbnail.jpg
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(
                                  `https://image.mux.com/${playbackId.id}/thumbnail.jpg`
                                )
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No playback IDs available
                </p>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Analytics</h4>
                <p className="text-muted-foreground mt-2 text-sm">
                  Analytics data will be displayed here once implemented.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
