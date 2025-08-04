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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Clock,
  Copy,
  Library,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Trash2,
  Video,
} from 'lucide-react';
import React, { useState } from 'react';

// Mock data for libraries
const mockLibraries = [
  {
    id: 'lib_1',
    name: 'Production Videos',
    description: 'Main production video content',
    assetCount: 45,
    createdAt: '2024-01-15',
    status: 'active',
    type: 'video',
  },
  {
    id: 'lib_2',
    name: 'Marketing Content',
    description: 'Marketing and promotional videos',
    assetCount: 23,
    createdAt: '2024-02-01',
    status: 'active',
    type: 'video',
  },
  {
    id: 'lib_3',
    name: 'Training Materials',
    description: 'Internal training and educational content',
    assetCount: 12,
    createdAt: '2024-01-20',
    status: 'active',
    type: 'video',
  },
];

export default function LibrariesPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [libraries] = useState(mockLibraries);

  const filteredLibraries = libraries.filter(
    library =>
      library.name.toLowerCase().includes(search.toLowerCase()) ||
      library.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Libraries
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Organize your video assets into collections for better management
            and access control
          </p>
        </div>

        <Button
          size="lg"
          className="bg-accent-500 hover:bg-accent-600 border-0 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Library
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Total Libraries
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Library className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {libraries.length}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <span>+2</span>
              </div>
              <span className="text-muted-foreground text-xs">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Total Assets
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Video className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {libraries.reduce((sum, lib) => sum + lib.assetCount, 0)}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <span>+15</span>
              </div>
              <span className="text-muted-foreground text-xs">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Active Libraries
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Clock className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {libraries.filter(lib => lib.status === 'active').length}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="inline-flex items-center space-x-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <span>100%</span>
              </div>
              <span className="text-muted-foreground text-xs">uptime</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search libraries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Libraries Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Libraries</CardTitle>
          <CardDescription>
            {filteredLibraries.length} librar
            {filteredLibraries.length !== 1 ? 'ies' : 'y'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLibraries.map(library => (
                <TableRow key={library.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="bg-accent-500/10 rounded-lg p-2">
                        <Library className="text-accent-600 h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{library.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {library.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm">{library.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {library.assetCount} assets
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className="bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-800"
                    >
                      {library.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(library.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
