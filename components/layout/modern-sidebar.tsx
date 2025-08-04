'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  ChevronLeft,
  Eye,
  Key,
  Library,
  LogOut,
  Upload,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export function ModernSidebar({
  className,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Check for 'g' followed by navigation shortcuts
      if (e.key === 'g') {
        const handleSecondKey = (secondE: KeyboardEvent): void => {
          const shortcut = navigation.find(
            item => item.shortcut === `g ${secondE.key}`
          );
          if (shortcut) {
            secondE.preventDefault();
            router.push(shortcut.href);
          }
          document.removeEventListener('keydown', handleSecondKey);
        };

        document.addEventListener('keydown', handleSecondKey);

        // Remove listener after 2 seconds if no second key is pressed
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleCollapse = (): void => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-56'; // 64px collapsed, 224px expanded

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-[#e5e7eb99] bg-[#ffffffcc] shadow-sm backdrop-blur-sm transition-all duration-300 ease-out',
        sidebarWidth,
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#e5e7eb99] px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="group flex items-center space-x-3">
            <div className="from-accent-500 to-accent-600 rounded-lg bg-gradient-to-br p-2 shadow-sm">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-foreground text-lg font-semibold tracking-tight">
              Mux Control Panel
            </span>
          </Link>
        )}

        {isCollapsed && (
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center"
          >
            <div className="from-accent-500 to-accent-600 rounded-lg bg-gradient-to-br p-2 shadow-sm">
              <Video className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCollapse}
          className="hover:bg-muted h-8 w-8"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isCollapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'hover:bg-accent-50 hover:text-accent-700 focus-visible:ring-accent-500 focus-visible:ring-2 focus-visible:outline-none',
                isActive
                  ? 'bg-accent-50 text-accent-700 border-accent border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <div
                className={cn(
                  'flex items-center justify-center',
                  isCollapsed ? 'w-full' : 'mr-3'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>

              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  <kbd className="bg-muted text-muted-foreground hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none group-hover:inline-flex">
                    {item.shortcut}
                  </kbd>
                </>
              )}

              {isActive && (
                <div className="bg-accent-500 absolute right-2 h-2 w-2 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#e5e7eb99] p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full justify-start',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Sign out' : undefined}
        >
          <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
          {!isCollapsed && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  );
}
