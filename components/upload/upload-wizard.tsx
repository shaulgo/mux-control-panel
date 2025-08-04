'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAssetPolling } from '@/hooks/use-assets';
import { useUpload } from '@/hooks/use-upload';
import type { AppAsset, UploadResult } from '@/lib/mux/types';
import { assetId as createAssetId } from '@/lib/mux/types';
import {
  uploadUrlsSchema,
  type UploadUrlsInput,
} from '@/lib/validations/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Clock, Copy, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function UploadWizard(): React.ReactElement {
  const [results, setResults] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const uploadMutation = useUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadUrlsInput>({
    resolver: zodResolver(uploadUrlsSchema),
  });

  const onSubmit = async (data: UploadUrlsInput): Promise<void> => {
    setIsUploading(true);
    setResults([]);

    try {
      const response = await uploadMutation.mutateAsync(data);
      setResults(response.results);
      reset();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  type DirectUploadCreated = { id: string; url: string; status: string };
  type DirectUploadInfo = {
    id: string;
    url: string | null;
    status: string;
    asset_id?: string | null;
    error?: string | null;
  };

  const createDirectUpload = async (): Promise<DirectUploadCreated> => {
    const res = await fetch('/api/upload/direct', { method: 'POST' });
    if (!res.ok) {
      let message = 'Failed to create direct upload';
      try {
        const e = (await res.json()) as { error?: string };
        if (e.error) message = e.error;
      } catch {
        // ignore json parse error
      }
      throw new Error(message);
    }
    return res.json() as Promise<DirectUploadCreated>;
  };

  const getDirectUpload = async (id: string): Promise<DirectUploadInfo> => {
    const res = await fetch(`/api/upload/direct?id=${encodeURIComponent(id)}`);
    if (!res.ok) {
      let message = 'Failed to get direct upload';
      try {
        const e = (await res.json()) as { error?: string };
        if (e.error) message = e.error;
      } catch {
        // ignore json parse error
      }
      throw new Error(message);
    }
    return res.json() as Promise<DirectUploadInfo>;
  };

  const uploadFiles = async (selected: FileList): Promise<void> => {
    setIsUploading(true);
    setResults([]);
    try {
      const localResults: UploadResult[] = [];

      for (const file of Array.from(selected)) {
        try {
          // Create direct upload
          const du = await createDirectUpload();
          // Upload file bytes directly to Mux
          const putRes = await fetch(du.url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });
          if (!putRes.ok) {
            throw new Error(`Upload failed with status ${putRes.status}`);
          }

          // Poll direct upload until it has an asset_id or errored
          let assetIdString: string | undefined;
          let attempts = 0;
          while (attempts < 60 && !assetIdString) {
            const info = await getDirectUpload(du.id);
            if (info.status === 'errored') {
              throw new Error(info.error ?? 'Mux marked upload as errored');
            }
            if (info.status === 'asset_created' || info.asset_id) {
              assetIdString = info.asset_id ?? undefined;
              break;
            }
            // Backoff
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
          }

          if (!assetIdString) {
            throw new Error('Timeout waiting for asset to be created');
          }

          // Shape UploadResult to match existing UI expectations
          localResults.push({
            url: file.name,
            success: true,
            // Provide minimal asset shape; the UI will poll for full asset
            asset: {
              id: createAssetId(assetIdString),
              status: 'preparing',
            } as AppAsset,
          });
        } catch (e) {
          localResults.push({
            url: file.name,
            success: false,
            error: (e as Error).message,
          });
        }
      }

      setResults(localResults);
    } catch (error) {
      console.error('File uploads failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string): void => {
    void navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="from-background to-muted/30 border-b bg-gradient-to-r">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-xl p-2">
              <Upload className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                Upload Assets
              </CardTitle>
              <CardDescription className="text-base">
                Paste video URLs or upload video files to create new assets.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Tabs defaultValue="urls" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="urls">From URLs</TabsTrigger>
              <TabsTrigger value="files">From Files</TabsTrigger>
            </TabsList>

            <TabsContent value="urls" className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="urls" className="text-sm font-medium">
                    Video URLs
                  </Label>
                  <Textarea
                    id="urls"
                    placeholder={`https://example.com/video1.mp4
https://example.com/video2.mp4
https://example.com/video3.mp4`}
                    rows={8}
                    {...register('urls')}
                    disabled={isUploading}
                    className="border-border/50 focus:border-primary/50 resize-none transition-all duration-300"
                  />
                  {errors.urls && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.urls.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isUploading}
                  size="lg"
                  className="w-full shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  {isUploading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Creating Assets...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Create Assets
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="file-input" className="text-sm font-medium">
                  Video Files
                </Label>
                <input
                  id="file-input"
                  type="file"
                  accept="video/*"
                  multiple
                  disabled={isUploading}
                  onChange={e => setFiles(e.target.files)}
                  className="border-border/50 file:bg-primary file:text-primary-foreground block w-full rounded-md border bg-transparent px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
                />
                <p className="text-muted-foreground text-xs">
                  Supported formats depend on Mux ingestion; common types
                  include MP4, MOV, WebM. Max 10 files recommended.
                </p>
              </div>

              <Button
                type="button"
                disabled={isUploading || !files || files.length === 0}
                size="lg"
                className="w-full shadow-lg transition-all duration-300 hover:shadow-xl"
                onClick={() => files && uploadFiles(files)}
              >
                {isUploading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Files...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-green-500/10 p-2">
                  <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-green-900 dark:text-green-100">
                    Upload Results
                  </CardTitle>
                  <CardDescription className="text-base text-green-700 dark:text-green-300">
                    {results.filter(r => r.success).length} of {results.length}{' '}
                    assets created successfully
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600 dark:text-green-400">
                  Complete
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {results.map((result, index) => (
                <UploadResultItem
                  key={index}
                  result={result}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type UploadResultItemProps = {
  result: UploadResult;
  onCopy: (text: string) => void;
};

function UploadResultItem({
  result,
  onCopy,
}: UploadResultItemProps): React.ReactElement {
  const { data: assetData } = useAssetPolling(
    result.asset?.id ?? createAssetId(''),
    result.success && result.asset?.status === 'preparing' && !!result.asset.id
  );

  // Use polling data if available, otherwise use original result
  const currentAsset = assetData?.data ?? result.asset;
  const currentResult: UploadResult = {
    ...result,
    asset: currentAsset
      ? ({
          ...currentAsset,
          id:
            typeof currentAsset.id === 'string'
              ? createAssetId(currentAsset.id)
              : currentAsset.id,
        } as AppAsset)
      : undefined,
  };

  const getStatusIcon = (result: UploadResult): React.ReactElement => {
    if (!result.success) {
      return <XCircle className="text-destructive h-4 w-4" />;
    }

    if (result.asset?.status === 'ready') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (result.asset?.status === 'errored') {
      return <XCircle className="text-destructive h-4 w-4" />;
    }

    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (result: UploadResult): React.ReactElement => {
    if (!result.success) {
      return <Badge variant="destructive">Failed</Badge>;
    }

    // Exhaustive switch: explicitly handle undefined as well
    switch (result.asset?.status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'preparing':
        return <Badge variant="warning">Processing</Badge>;
      case 'errored':
        return <Badge variant="destructive">Error</Badge>;
      case undefined:
        return <Badge variant="outline">Unknown</Badge>;
      default: {
        // Assert exhaustive check without introducing an unused variable
        (() => {
          const _never: never = result.asset?.status as never;
          return _never;
        })();
        return <Badge variant="outline">Unknown</Badge>;
      }
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getStatusIcon(currentResult)}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{result.url}</p>
            {currentResult.success && currentResult.asset && (
              <div className="mt-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <code className="text-muted-foreground text-xs">
                    {currentResult.asset.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (currentResult.asset?.id) {
                        onCopy(currentResult.asset.id);
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {currentResult.asset.playback_ids?.[0] && (
                  <div className="flex items-center space-x-2">
                    <code className="text-muted-foreground text-xs">
                      https://stream.mux.com/
                      {currentResult.asset.playback_ids[0].id}.m3u8
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const playbackId =
                          currentResult.asset?.playback_ids?.[0]?.id;
                        if (playbackId) {
                          onCopy(`https://stream.mux.com/${playbackId}.m3u8`);
                        }
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {result.error && (
              <p className="text-destructive mt-1 text-xs">{result.error}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(currentResult)}
        </div>
      </div>
    </div>
  );
}
