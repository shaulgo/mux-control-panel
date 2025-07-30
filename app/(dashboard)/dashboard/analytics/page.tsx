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
  Clock,
  Eye,
  Globe,
  Monitor,
  Play,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from 'lucide-react';

// Mock analytics data
const analyticsData = {
  overview: {
    totalViews: 12543,
    uniqueViewers: 8921,
    totalPlayTime: 45678, // in minutes
    avgViewDuration: 342, // in seconds
  },
  topVideos: [
    {
      id: 'HxV1UxVR...',
      title: 'Product Demo Video',
      views: 2341,
      duration: '5:23',
      engagement: 85,
    },
    {
      id: 'KmP2QwEr...',
      title: 'Tutorial: Getting Started',
      views: 1876,
      duration: '8:45',
      engagement: 78,
    },
    {
      id: 'LnQ3RtYu...',
      title: 'Customer Success Story',
      views: 1654,
      duration: '3:12',
      engagement: 92,
    },
    {
      id: 'MoR4SvZx...',
      title: 'Feature Walkthrough',
      views: 1432,
      duration: '6:34',
      engagement: 71,
    },
    {
      id: 'NpS5TwAb...',
      title: 'Company Overview',
      views: 1287,
      duration: '4:56',
      engagement: 68,
    },
  ],
  deviceBreakdown: [
    { device: 'Desktop', percentage: 45, count: 5644 },
    { device: 'Mobile', percentage: 38, count: 4766 },
    { device: 'Tablet', percentage: 17, count: 2133 },
  ],
  geographicData: [
    { country: 'United States', views: 4521, percentage: 36 },
    { country: 'United Kingdom', views: 2134, percentage: 17 },
    { country: 'Canada', views: 1876, percentage: 15 },
    { country: 'Germany', views: 1543, percentage: 12 },
    { country: 'Australia', views: 1234, percentage: 10 },
    { country: 'Others', views: 1235, percentage: 10 },
  ],
};

export default function AnalyticsPage() {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground text-4xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Track video performance, viewer engagement, and audience insights
        </p>
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
              {analyticsData.overview.totalViews.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+18%</span>
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
              Unique Viewers
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Users className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {analyticsData.overview.uniqueViewers.toLocaleString()}
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
              Total Play Time
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Play className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {formatPlayTime(analyticsData.overview.totalPlayTime)}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+25%</span>
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
              Avg. View Duration
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Clock className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {formatDuration(analyticsData.overview.avgViewDuration)}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+8%</span>
              </div>
              <span className="text-muted-foreground text-xs">
                vs last month
              </span>
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
              Most viewed videos in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.topVideos.map(video => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{video.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {video.id} • {video.duration}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {video.views.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={video.engagement}
                          className="h-2 w-16"
                        />
                        <span className="text-muted-foreground text-sm">
                          {video.engagement}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
              {analyticsData.deviceBreakdown.map((device, index) => {
                const Icon =
                  device.device === 'Desktop'
                    ? Monitor
                    : device.device === 'Mobile'
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
                          {device.count.toLocaleString()} views
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
              {analyticsData.geographicData.map((country, index) => (
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
