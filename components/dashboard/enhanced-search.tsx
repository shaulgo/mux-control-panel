'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type EnhancedSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function EnhancedSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: EnhancedSearchProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Focus search when "/" is pressed (and not in an input)
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div className={cn('group relative', className)}>
      {/* Search Icon */}
      <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
        <Search
          className={cn(
            'h-4 w-4 transition-colors duration-200',
            isFocused ? 'text-accent-600' : 'text-muted-foreground'
          )}
        />
      </div>

      {/* Search Input */}
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'h-10 w-full pr-16 pl-10',
          'bg-background border-border',
          'focus:border-accent-500 focus:ring-accent-500/20 focus:ring-2',
          'transition-all duration-200',
          'placeholder:text-muted-foreground',
          isFocused && 'shadow-sm'
        )}
      />

      {/* Keyboard Shortcut Hint */}
      {!isFocused && !value && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <kbd className="bg-muted text-muted-foreground hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 transition-opacity select-none group-hover:opacity-100 sm:inline-flex">
            /
          </kbd>
        </div>
      )}

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="hover:bg-muted absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-1 transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="text-muted-foreground h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Specialized search for assets
type AssetSearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultsCount?: number;
  isLoading?: boolean;
};

export function AssetSearch({
  value,
  onChange,
  resultsCount,
  isLoading,
}: AssetSearchProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <EnhancedSearch
        value={value}
        onChange={onChange}
        placeholder="Search assets by name, ID, or status..."
        className="w-full max-w-md"
      />

      {/* Search Results Info */}
      {(value || isLoading) && (
        <div className="text-muted-foreground text-xs">
          {isLoading ? (
            <span className="flex items-center gap-1">
              <div className="border-muted-foreground h-3 w-3 animate-spin rounded-full border border-t-transparent" />
              Searching...
            </span>
          ) : (
            <span>
              {resultsCount !== undefined && (
                <>
                  {resultsCount} result{resultsCount !== 1 ? 's' : ''}
                  {value && ` for "${value}"`}
                </>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
