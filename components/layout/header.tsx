'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string | undefined;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb99] bg-[#ffffffcc] px-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
