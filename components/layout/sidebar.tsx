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
    Video
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Assets',
    href: '/dashboard',
    icon: Video,
  },
  {
    name: 'Upload',
    href: '/dashboard/upload',
    icon: Upload,
  },
  {
    name: 'Libraries',
    href: '/dashboard/libraries',
    icon: Library,
  },
  {
    name: 'Usage & Cost',
    href: '/dashboard/usage',
    icon: BarChart3,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: Eye,
  },
  {
    name: 'Upload Tokens',
    href: '/dashboard/tokens',
    icon: Key,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={cn('flex h-full w-64 flex-col bg-background/95 backdrop-blur-md border-r border-border/50', className)}>
      <div className="flex h-16 items-center border-b border-border/50 px-6 bg-gradient-to-r from-background to-muted/30">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Mux Control Panel
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md',
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-white/20'
                  : 'bg-muted/50 group-hover:bg-muted'
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute right-3 h-2 w-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-border/50 p-4 bg-gradient-to-r from-background to-muted/20">
        <Button
          variant="ghost"
          className="w-full justify-start group hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          onClick={handleLogout}
        >
          <div className="p-1.5 bg-muted/50 group-hover:bg-destructive/20 rounded-lg transition-colors duration-200 mr-3">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium">Sign out</span>
        </Button>
      </div>
    </div>
  );
}
