'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsage } from '@/hooks/use-usage';
import {
  Activity,
  Calendar,
  Loader2,
  Play,
  RefreshCw,
  Upload,
} from 'lucide-react';

// Utility function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

import React from 'react';

export default function UsagePage(): React.ReactElement {
  const { data: usageData, isLoading, error, refetch } = useUsage();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading usage data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load usage data</p>
          <p className="text-muted-foreground text-sm">Unknown error</p>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No usage data available.</p>
        </div>
      </div>
    );
  }

  const data = usageData;

  // Costs and storage are not shown until Mux Exports are ingested

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Usage
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Monitor your encoding and watch time. Precise costs require Mux
            Exports ingestion (coming soon).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            void refetch();
          }}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Encoding
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Upload className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {data.currentMonth.encoding.used} min
            </div>
            <div className="mt-2">
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span>{data.currentMonth.encoding.used} min</span>
                <span>{data.currentMonth.encoding.limit} min</span>
              </div>
              <Progress
                value={
                  (data.currentMonth.encoding.used /
                    data.currentMonth.encoding.limit) *
                  100
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Watch Time
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Play className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {formatNumber(data.currentMonth.streaming.used)} min
            </div>
            <div className="mt-2">
              <div className="text-muted-foreground mb-1 text-xs">
                <span>
                  {formatNumber(data.currentMonth.streaming.used)} min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Month Usage */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Current Month Usage</span>
            </CardTitle>
            <CardDescription>
              Your usage for the current billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Video Encoding</span>
                  <Badge variant="secondary">
                    {data.currentMonth.encoding.used}/
                    {data.currentMonth.encoding.limit} min
                  </Badge>
                </div>
                <Progress
                  value={
                    (data.currentMonth.encoding.used /
                      data.currentMonth.encoding.limit) *
                    100
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Watch time</span>
                  <Badge variant="secondary">
                    {formatNumber(data.currentMonth.streaming.used)} min
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No cost breakdown until Exports are ingested */}
      </div>

      {/* Recent Usage History */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
          <CardDescription>Daily usage for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Encoding (min)</TableHead>
                <TableHead>Watch time (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentUsage.map(day => (
                <TableRow key={day.date}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>{day.encoding}</TableCell>
                  <TableCell>{day.streaming}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
