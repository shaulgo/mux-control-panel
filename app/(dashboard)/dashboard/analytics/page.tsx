'use client';

import { Badge } from '@/components/ui/badge';
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
import {
  BarChart3,
  Eye,
  Globe,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type AnalyticsSummary = {
  overview: { totalViews: number };
  topVideos: Array<{ id: string; title: string; views: number }>;
  deviceBreakdown: Array<{ device: string; views: number }>;
  geographicData: Array<{ country: string; views: number }>;
};

export default function AnalyticsPage(): React.ReactElement {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const loadData = async (selectedPeriod: string = period): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res: Response = await fetch(
        `/api/analytics/summary?period=${selectedPeriod}`,
        {
          headers: { Accept: 'application/json' },
          cache: 'no-cache',
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );
      const json: unknown = await res.json();
      if (!res.ok) {
        // If HTTP not ok, try to read an error message from the body if present
        const message =
          typeof json === 'object' &&
          json !== null &&
          'error' in json &&
          typeof (json as { error?: { message?: unknown } }).error ===
            'object' &&
          (json as { error?: { message?: unknown } }).error &&
          'message' in (json as { error?: { message?: unknown } }).error!
            ? String(
                (
                  (json as { error?: { message?: unknown } }).error as {
                    message?: unknown;
                  }
                ).message
              )
            : `HTTP ${res.status}`;
        throw new Error(message);
      }
      // Validate shape and set data
      if (
        typeof json === 'object' &&
        json !== null &&
        'ok' in json &&
        (json as { ok?: unknown }).ok &&
        'data' in json
      ) {
        setData((json as { data: AnalyticsSummary }).data);
      } else {
        throw new Error('Unexpected response shape');
      }
    } catch (e) {
      setError(
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to load analytics'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect((): void => {
    async function load(): Promise<void> {
      try {
        const res: Response = await fetch('/api/analytics/summary?period=30', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const json: unknown = await res.json();
        if (!res.ok) {
          // If HTTP not ok, try to read an error message from the body if present
          const message =
            typeof json === 'object' &&
            json !== null &&
            'error' in json &&
            typeof (json as { error?: { message?: unknown } }).error ===
              'object' &&
            (json as { error?: { message?: unknown } }).error &&
            'message' in (json as { error?: { message?: unknown } }).error!
              ? String(
                  (
                    (json as { error?: { message?: unknown } }).error as {
                      message?: unknown;
                    }
                  ).message
                )
              : `HTTP ${res.status}`;
          throw new Error(message);
        }
        // Validate shape and set data
        if (
          typeof json === 'object' &&
          json !== null &&
          'ok' in json &&
          (json as { ok?: unknown }).ok &&
          'data' in json
        ) {
          setData((json as { data: AnalyticsSummary }).data);
        } else {
          throw new Error('Unexpected response shape');
        }
      } catch (e) {
        setError(
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Failed to load analytics'
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalViews = data?.overview.totalViews ?? 0;

  const deviceComputed = useMemo(() => {
    const total =
      data?.deviceBreakdown.reduce((acc, d) => acc + d.views, 0) ?? 0;
    return (data?.deviceBreakdown ?? []).map(d => {
      const percentage = total > 0 ? Math.round((d.views / total) * 100) : 0;
      return { ...d, percentage };
    });
  }, [data]);

  const geoComputed = useMemo(() => {
    const total =
      data?.geographicData.reduce((acc, g) => acc + g.views, 0) ?? 0;
    return (data?.geographicData ?? []).map(g => {
      const percentage = total > 0 ? Math.round((g.views / total) * 100) : 0;
      return { ...g, percentage };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Loading analytics…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-destructive max-w-2xl text-lg">
            Failed to load analytics: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              Analytics
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Track video performance, viewer engagement, and audience insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="period-select"
                className="text-muted-foreground text-sm font-medium"
              >
                Period:
              </label>
              <select
                id="period-select"
                value={period}
                onChange={e => {
                  setPeriod(e.target.value);
                  loadData(e.target.value).catch(console.error);
                }}
                className="border-input bg-background focus:border-primary focus:ring-primary rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              <RefreshCw className={`mr-1 h-4 w-4`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Total Views
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Eye className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {totalViews.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>30d</span>
              </div>
              <span className="text-muted-foreground text-xs">aggregated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Videos */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Top Performing Videos</span>
            </CardTitle>
            <CardDescription>
              Most viewed videos in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topVideos ?? []).map(video => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{video.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {video.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {video.views.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.topVideos || data.topVideos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Device Breakdown</span>
            </CardTitle>
            <CardDescription>
              How viewers are watching your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceComputed.map((device, index) => {
                const Icon =
                  device.device.toLowerCase() === 'desktop'
                    ? Monitor
                    : device.device.toLowerCase() === 'mobile'
                      ? Smartphone
                      : Tablet;
                return (
                  <div
                    key={index}
                    className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="text-muted-foreground h-5 w-5" />
                      <div>
                        <div className="font-medium">{device.device}</div>
                        <div className="text-muted-foreground text-sm">
                          {device.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{device.percentage}%</div>
                      <Progress
                        value={device.percentage}
                        className="mt-1 h-2 w-16"
                      />
                    </div>
                  </div>
                );
              })}
              {deviceComputed.length === 0 && (
                <div className="text-muted-foreground text-sm">No data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Geographic Distribution</span>
          </CardTitle>
          <CardDescription>Where your viewers are located</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {geoComputed.map((country, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {country.country}
                  </TableCell>
                  <TableCell>{country.views.toLocaleString()}</TableCell>
                  <TableCell>{country.percentage}%</TableCell>
                  <TableCell>
                    <Progress value={country.percentage} className="h-2 w-24" />
                  </TableCell>
                </TableRow>
              ))}
              {geoComputed.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
