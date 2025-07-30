'use client';

import { AssetDrawer } from '@/components/assets/asset-drawer';
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
import { useAssets, useDeleteAsset } from '@/hooks/use-assets';
import type { MuxAsset } from '@/lib/mux/types';
import { Grid, List, Search, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AssetsPage() {
  const router = useRouter();
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
    <div className="animate-fade-in space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-gradient text-4xl font-bold">Assets</h1>
          <p className="text-muted-foreground text-lg">
            Manage your video assets and view their details
          </p>
        </div>
        <Button className="btn-gradient shadow-lg transition-all duration-300 hover:shadow-xl">
          <Upload className="mr-2 h-4 w-4" />
          Upload Asset
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stats-card animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Assets
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-3xl font-bold">
              {assets.length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              <span className="text-green-600 dark:text-green-400">+12%</span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card
          className="stats-card animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Ready Assets
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
              <Grid className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-3xl font-bold">
              {assets.filter(asset => asset.status === 'ready').length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              <span className="text-green-600 dark:text-green-400">+8%</span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card
          className="stats-card animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Processing
            </CardTitle>
            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
              <Search className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-3xl font-bold">
              {assets.filter(asset => asset.status === 'preparing').length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              <span className="text-blue-600 dark:text-blue-400">2</span> in
              queue
            </p>
          </CardContent>
        </Card>
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
              className="w-80 pl-10"
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
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            {assets.length} asset{assets.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive flex h-32 items-center justify-center">
              Failed to load assets
            </div>
          ) : (
            <AssetsTable
              assets={assets}
              onViewAsset={handleViewAsset}
              onDeleteAsset={handleDeleteAsset}
              isLoading={isLoading}
            />
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
