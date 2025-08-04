'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    label: string;
  };
  className?: string;
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  delta,
  className,
}: MetricCardProps): React.ReactElement {
  return (
    <Card
      className={cn(
        'bg-card shadow-card hover:shadow-card-hover relative overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
          {title}
        </h3>
        <div className="bg-accent-500/10 rounded-lg p-2">
          <Icon className="text-accent-600 dark:text-accent-400 h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-2">
          {/* Large metric number */}
          <div className="text-foreground text-4xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {/* Delta badge */}
          {delta && (
            <div className="flex items-center space-x-1">
              <div
                className={cn(
                  'inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium',
                  delta.trend === 'up' &&
                    'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400',
                  delta.trend === 'down' &&
                    'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400',
                  delta.trend === 'neutral' &&
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {delta.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {delta.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                <span>{delta.value}</span>
              </div>
              <span className="text-muted-foreground text-xs">
                {delta.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Subtle background pattern */}
      <div className="to-accent-500/5 pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent" />
    </Card>
  );
}

// Specialized metric cards for common use cases
type StatsMetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
  changeLabel: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
};

export function StatsMetricCard({
  title,
  value,
  icon,
  change,
  changeLabel,
  variant = 'default',
}: StatsMetricCardProps): React.ReactElement {
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const deltaValue = change > 0 ? `+${change}%` : `${change}%`;

  const variantStyles = {
    default: 'border-gray-200 dark:border-gray-700',
    success:
      'border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-950/50',
    warning:
      'border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-950/50',
    error:
      'border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-950/50',
  };

  return (
    <MetricCard
      title={title}
      value={value}
      icon={icon}
      delta={{
        value: deltaValue,
        trend,
        label: changeLabel,
      }}
      className={cn('border', variantStyles[variant])}
    />
  );
}

// Loading skeleton for metric cards
export function MetricCardSkeleton(): React.ReactElement {
  return (
    <Card className="bg-card shadow-card border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
        <div className="bg-muted h-9 w-9 animate-pulse rounded-lg" />
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="bg-muted h-10 w-16 animate-pulse rounded" />
          <div className="bg-muted h-5 w-24 animate-pulse rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
