'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Eye,
  Key,
  Library,
  LogOut,
  Upload,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Assets',
    href: '/dashboard',
    icon: Video,
    shortcut: 'g a',
  },
  {
    name: 'Upload',
    href: '/dashboard/upload',
    icon: Upload,
    shortcut: 'g u',
  },
  {
    name: 'Libraries',
    href: '/dashboard/libraries',
    icon: Library,
    shortcut: 'g l',
  },
  {
    name: 'Usage & Cost',
    href: '/dashboard/usage',
    icon: BarChart3,
    shortcut: 'g c',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: Eye,
    shortcut: 'g n',
  },
  {
    name: 'Upload Tokens',
    href: '/dashboard/tokens',
    icon: Key,
    shortcut: 'g t',
  },
];

type SidebarProps = {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function Sidebar({ className }: SidebarProps): React.ReactElement {
  const pathname = usePathname();

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div
      className={cn(
        'bg-background/95 border-border/50 flex h-full w-64 flex-col border-r backdrop-blur-md',
        className
      )}
    >
      <div className="border-border/50 from-background to-muted/30 flex h-16 items-center border-b bg-gradient-to-r px-6">
        <Link href="/dashboard" className="group flex items-center space-x-3">
          <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors duration-200">
            <Video className="text-primary h-5 w-5" />
          </div>
          <span className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
            Mux Control Panel
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md',
                isActive
                  ? 'from-primary to-primary/80 text-primary-foreground shadow-primary/25 bg-gradient-to-r shadow-lg'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <div
                className={cn(
                  'rounded-lg p-1.5 transition-colors duration-200',
                  isActive ? 'bg-white/20' : 'bg-muted/50 group-hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute right-3 h-2 w-2 animate-pulse rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-border/50 from-background to-muted/20 border-t bg-gradient-to-r p-4">
        <Button
          variant="ghost"
          className="group hover:bg-destructive/10 hover:text-destructive w-full justify-start transition-all duration-200"
          onClick={handleLogout}
        >
          <div className="bg-muted/50 group-hover:bg-destructive/20 mr-3 rounded-lg p-1.5 transition-colors duration-200">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium">Sign out</span>
        </Button>
      </div>
    </div>
  );
}
