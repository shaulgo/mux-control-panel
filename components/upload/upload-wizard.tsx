'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAssetPolling } from '@/hooks/use-assets';
import { useUpload } from '@/hooks/use-upload';
import type { MuxAsset } from '@/lib/mux/types';
import { uploadUrlsSchema, type UploadUrlsInput } from '@/lib/validations/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Clock, Copy, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface UploadResult {
  url: string;
  success: boolean;
  asset?: MuxAsset;
  error?: string;
}

export function UploadWizard() {
  const [results, setResults] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadUrlsInput>({
    resolver: zodResolver(uploadUrlsSchema),
  });

  const onSubmit = async (data: UploadUrlsInput) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (result: UploadResult) => {
    if (!result.success) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (result.asset?.status === 'ready') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (result.asset?.status === 'errored') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (result: UploadResult) => {
    if (!result.success) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    
    switch (result.asset?.status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'preparing':
        return <Badge variant="warning">Processing</Badge>;
      case 'errored':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-background to-muted/30 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Upload Assets</CardTitle>
              <CardDescription className="text-base">
                Paste video URLs (one per line) to create new assets. Supports up to 10 URLs at once.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="urls" className="text-sm font-medium">Video URLs</Label>
              <Textarea
                id="urls"
                placeholder={`https://example.com/video1.mp4
https://example.com/video2.mp4
https://example.com/video3.mp4`}
                rows={8}
                {...register('urls')}
                disabled={isUploading}
                className="resize-none border-border/50 focus:border-primary/50 transition-all duration-300"
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
              className="w-full shadow-lg hover:shadow-xl transition-all duration-300"
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
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-green-900 dark:text-green-100">Upload Results</CardTitle>
                  <CardDescription className="text-base text-green-700 dark:text-green-300">
                    {results.filter(r => r.success).length} of {results.length} assets created successfully
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Complete</span>
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

interface UploadResultItemProps {
  result: UploadResult;
  onCopy: (text: string) => void;
}

function UploadResultItem({ result, onCopy }: UploadResultItemProps) {
  const { data: assetData } = useAssetPolling(
    result.asset?.id || '',
    result.success && result.asset?.status === 'preparing'
  );

  // Use polling data if available, otherwise use original result
  const currentAsset = assetData?.data || result.asset;
  const currentResult = { ...result, asset: currentAsset };

  const getStatusIcon = (result: UploadResult) => {
    if (!result.success) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (result.asset?.status === 'ready') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (result.asset?.status === 'errored') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (result: UploadResult) => {
    if (!result.success) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    
    switch (result.asset?.status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'preparing':
        return <Badge variant="warning">Processing</Badge>;
      case 'errored':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getStatusIcon(currentResult)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{result.url}</p>
            {currentResult.success && currentResult.asset && (
              <div className="mt-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <code className="text-xs text-muted-foreground">
                    {currentResult.asset.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCopy(currentResult.asset!.id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {currentResult.asset.playback_ids?.[0] && (
                  <div className="flex items-center space-x-2">
                    <code className="text-xs text-muted-foreground">
                      https://stream.mux.com/{currentResult.asset.playback_ids[0].id}.m3u8
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        onCopy(
                          `https://stream.mux.com/${currentResult.asset!.playback_ids![0].id}.m3u8`
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {result.error && (
              <p className="mt-1 text-xs text-destructive">{result.error}</p>
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
