'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  Activity,
  Download,
  Upload,
  Play,
  BarChart3,
  Calendar,
} from 'lucide-react';

// Mock usage data
const usageData = {
  currentMonth: {
    encoding: { used: 145, limit: 500, cost: 29.0 },
    streaming: { used: 2340, limit: 10000, cost: 46.8 },
    storage: { used: 89, limit: 1000, cost: 8.9 },
  },
  recentUsage: [
    {
      date: '2024-01-01',
      encoding: 12,
      streaming: 234,
      storage: 5.2,
      cost: 8.45,
    },
    {
      date: '2024-01-02',
      encoding: 8,
      streaming: 189,
      storage: 5.1,
      cost: 6.23,
    },
    {
      date: '2024-01-03',
      encoding: 15,
      streaming: 312,
      storage: 5.3,
      cost: 10.12,
    },
    {
      date: '2024-01-04',
      encoding: 22,
      streaming: 445,
      storage: 5.4,
      cost: 14.67,
    },
    {
      date: '2024-01-05',
      encoding: 18,
      streaming: 378,
      storage: 5.5,
      cost: 12.34,
    },
  ],
};

export default function UsagePage() {
  const totalCost =
    usageData.currentMonth.encoding.cost +
    usageData.currentMonth.streaming.cost +
    usageData.currentMonth.storage.cost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground text-4xl font-bold tracking-tight">
          Usage & Cost
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Monitor your video processing usage, streaming bandwidth, and
          associated costs
        </p>
      </div>

      {/* Cost Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Total Cost
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <DollarSign className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              ${totalCost.toFixed(2)}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+12%</span>
              </div>
              <span className="text-muted-foreground text-xs">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>

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
              ${usageData.currentMonth.encoding.cost.toFixed(2)}
            </div>
            <div className="mt-2">
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span>{usageData.currentMonth.encoding.used} min</span>
                <span>{usageData.currentMonth.encoding.limit} min</span>
              </div>
              <Progress
                value={
                  (usageData.currentMonth.encoding.used /
                    usageData.currentMonth.encoding.limit) *
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
              Streaming
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Play className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              ${usageData.currentMonth.streaming.cost.toFixed(2)}
            </div>
            <div className="mt-2">
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span>{usageData.currentMonth.streaming.used} GB</span>
                <span>{usageData.currentMonth.streaming.limit} GB</span>
              </div>
              <Progress
                value={
                  (usageData.currentMonth.streaming.used /
                    usageData.currentMonth.streaming.limit) *
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
              Storage
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Download className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              ${usageData.currentMonth.storage.cost.toFixed(2)}
            </div>
            <div className="mt-2">
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span>{usageData.currentMonth.storage.used} GB</span>
                <span>{usageData.currentMonth.storage.limit} GB</span>
              </div>
              <Progress
                value={
                  (usageData.currentMonth.storage.used /
                    usageData.currentMonth.storage.limit) *
                  100
                }
                className="h-2"
              />
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
                    {usageData.currentMonth.encoding.used}/
                    {usageData.currentMonth.encoding.limit} min
                  </Badge>
                </div>
                <Progress
                  value={
                    (usageData.currentMonth.encoding.used /
                      usageData.currentMonth.encoding.limit) *
                    100
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Video Streaming</span>
                  <Badge variant="secondary">
                    {usageData.currentMonth.streaming.used}/
                    {usageData.currentMonth.streaming.limit} GB
                  </Badge>
                </div>
                <Progress
                  value={
                    (usageData.currentMonth.streaming.used /
                      usageData.currentMonth.streaming.limit) *
                    100
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Video Storage</span>
                  <Badge variant="secondary">
                    {usageData.currentMonth.storage.used}/
                    {usageData.currentMonth.storage.limit} GB
                  </Badge>
                </div>
                <Progress
                  value={
                    (usageData.currentMonth.storage.used /
                      usageData.currentMonth.storage.limit) *
                    100
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Cost Breakdown</span>
            </CardTitle>
            <CardDescription>
              Detailed cost analysis for current month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Upload className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Encoding</span>
                </div>
                <span className="font-semibold">
                  ${usageData.currentMonth.encoding.cost.toFixed(2)}
                </span>
              </div>

              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Play className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Streaming</span>
                </div>
                <span className="font-semibold">
                  ${usageData.currentMonth.streaming.cost.toFixed(2)}
                </span>
              </div>

              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Download className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="font-semibold">
                  ${usageData.currentMonth.storage.cost.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-accent-600 text-lg font-bold">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Usage History */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Recent Usage History</CardTitle>
          <CardDescription>
            Daily usage and cost breakdown for the past 5 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Encoding (min)</TableHead>
                <TableHead>Streaming (GB)</TableHead>
                <TableHead>Storage (GB)</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.recentUsage.map((day, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>{day.encoding}</TableCell>
                  <TableCell>{day.streaming}</TableCell>
                  <TableCell>{day.storage}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${day.cost.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
