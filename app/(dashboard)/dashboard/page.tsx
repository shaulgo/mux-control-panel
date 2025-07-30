'use client';

import { AssetDrawer } from '@/components/assets/asset-drawer';
import { AssetsTable } from '@/components/assets/assets-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAssets, useDeleteAsset } from '@/hooks/use-assets';
import type { MuxAsset } from '@/lib/mux/types';
import {
    Grid,
    List,
    Search,
    Upload
} from 'lucide-react';
import { useState } from 'react';

export default function AssetsPage() {
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MuxAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: assetsData, isLoading, error } = useAssets({ search });
  const deleteAssetMutation = useDeleteAsset();

  const handleViewAsset = (asset: MuxAsset) => {
    setSelectedAsset(asset);
    setDrawerOpen(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAssetMutation.mutateAsync(assetId);
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const assets = assetsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Assets
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your video assets and view their details
          </p>
        </div>
        <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
          <Upload className="mr-2 h-5 w-5" />
          Upload Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Assets</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{assets.length}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              <span className="text-green-600 dark:text-green-400">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Ready Assets</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Grid className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {assets.filter(asset => asset.status === 'ready').length}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <span className="text-green-600 dark:text-green-400">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Processing</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Search className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {assets.filter(asset => asset.status === 'preparing').length}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              <span className="text-blue-600 dark:text-blue-400">2</span> in queue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assets List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-background to-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Assets</CardTitle>
              <CardDescription className="text-base">
                {assets.length} asset{assets.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="flex h-32 items-center justify-center text-destructive">
              <div className="text-center">
                <div className="text-lg font-medium">Failed to load assets</div>
                <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <AssetsTable
                assets={assets}
                onViewAsset={handleViewAsset}
                onDeleteAsset={handleDeleteAsset}
                isLoading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Drawer */}
      <AssetDrawer
        asset={selectedAsset}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
