'use client';

import { AssetDrawer } from '@/components/assets/asset-drawer';
import { AssetsGrid } from '@/components/assets/assets-grid';
import { AssetsTable } from '@/components/assets/assets-table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDeleteAsset, useInfiniteAssets } from '@/hooks/use-assets';
import type { AppAssetWithMetadata } from '@/lib/mux/types';
import { assetId } from '@/lib/mux/types';
import { Grid, List, Search, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function AssetsPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] =
    useState<AppAssetWithMetadata | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Metadata editor removed
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const {
    data: assetsPages,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAssets({ search });
  const deleteAssetMutation = useDeleteAsset();
  const router = useRouter();

  const handleViewAsset = (asset: AppAssetWithMetadata): void => {
    setSelectedAsset(asset);
    setDrawerOpen(true);
  };

  const handleEditMetadata = (): void => {};

  const handleDeleteAsset = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAssetMutation.mutateAsync(assetId(id));
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const assets = useMemo(() => {
    const pages = assetsPages?.pages ?? [];
    return pages.flatMap((page: { data: AppAssetWithMetadata[] }) => page.data);
  }, [assetsPages]);

  const isInitialLoading = status === 'pending' && !assetsPages;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-blue-600">Assets</h1>
            <div className="rounded-lg bg-blue-100 px-3 py-1">
              <span className="text-sm font-medium text-blue-600">
                {assets.length} total{' '}
                {(() => {
                  const processingCount = assets.filter(
                    (asset: AppAssetWithMetadata) =>
                      asset.status === 'preparing'
                  ).length;
                  return processingCount > 0
                    ? `(${processingCount} processing)`
                    : '';
                })()}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your video assets and view their details
          </p>
        </div>
        <Button
          className="bg-blue-500 text-white shadow-lg transition-all duration-300 hover:bg-blue-600 hover:shadow-xl"
          onClick={() => router.push('/dashboard/upload')}
          aria-label="Upload Asset"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Asset
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-80 border-[#e5e7eb99] bg-[#ffffffcc] pl-10 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={
              viewMode === 'grid'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-[#e5e7eb99] hover:bg-gray-50'
            }
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
            className={
              viewMode === 'table'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-[#e5e7eb99] hover:bg-gray-50'
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assets List */}
      <Card className="border border-[#e5e7eb99] bg-[#ffffffcc] shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Assets</CardTitle>
          <CardDescription>
            {assets.length} asset{assets.length !== 1 ? 's' : ''} loaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive flex h-32 items-center justify-center">
              Failed to load assets
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <AssetsGrid
                  assets={assets}
                  onViewAsset={handleViewAsset}
                  onDeleteAsset={handleDeleteAsset}
                  isLoading={isInitialLoading}
                />
              ) : (
                <AssetsTable
                  assets={assets}
                  onViewAsset={handleViewAsset}
                  onDeleteAsset={handleDeleteAsset}
                  isLoading={isInitialLoading}
                />
              )}
              <div ref={sentinelRef} className="h-10" />
              {isFetchingNextPage && (
                <div className="text-muted-foreground py-2 text-center text-sm">
                  Loading more...
                </div>
              )}
              {!hasNextPage && assets.length > 0 && (
                <div className="text-muted-foreground py-2 text-center text-xs">
                  You have reached the end.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Asset Drawer */}
      <AssetDrawer
        asset={selectedAsset}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEditMetadata={handleEditMetadata}
      />

      {/* Metadata Editor removed */}
    </div>
  );
}
