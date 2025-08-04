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
  CheckCircle,
  Clock,
  Copy,
  Key,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

// Mock data for upload tokens
const mockTokens = [
  {
    id: 'token_1',
    name: 'Production Upload Token',
    token: 'mux_upload_prod_abc123...',
    status: 'active',
    createdAt: '2024-01-15',
    expiresAt: '2024-07-15',
    usageCount: 45,
    maxUploads: 100,
    cors: ['https://myapp.com', 'https://staging.myapp.com'],
  },
  {
    id: 'token_2',
    name: 'Development Token',
    token: 'mux_upload_dev_xyz789...',
    status: 'active',
    createdAt: '2024-02-01',
    expiresAt: '2024-08-01',
    usageCount: 12,
    maxUploads: 50,
    cors: ['http://localhost:3000'],
  },
  {
    id: 'token_3',
    name: 'Marketing Campaign Token',
    token: 'mux_upload_mkt_def456...',
    status: 'expired',
    createdAt: '2023-12-01',
    expiresAt: '2024-01-01',
    usageCount: 23,
    maxUploads: 25,
    cors: ['https://campaign.myapp.com'],
  },
];

export default function TokensPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [tokens] = useState(mockTokens);

  const filteredTokens = tokens.filter(
    token =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.token.toLowerCase().includes(search.toLowerCase())
  );

  const activeTokens = tokens.filter(token => token.status === 'active').length;
  const totalUploads = tokens.reduce((sum, token) => sum + token.usageCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Upload Tokens
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Manage secure upload tokens for direct video uploads to your Mux
            account
          </p>
        </div>

        <Button
          size="lg"
          className="bg-accent-500 hover:bg-accent-600 border-0 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Token
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Active Tokens
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Key className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {activeTokens}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <span>+1</span>
              </div>
              <span className="text-muted-foreground text-xs">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Total Uploads
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <Shield className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {totalUploads}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <span>+12</span>
              </div>
              <span className="text-muted-foreground text-xs">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide">
              Security Status
            </h3>
            <div className="bg-accent-500/10 rounded-lg p-2">
              <CheckCircle className="text-accent-600 dark:text-accent-400 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-foreground text-4xl font-bold tracking-tight">
              Secure
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className="bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium">
                <span>All tokens</span>
              </div>
              <span className="text-muted-foreground text-xs">
                CORS protected
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search tokens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tokens Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Upload Tokens</CardTitle>
          <CardDescription>
            {filteredTokens.length} token
            {filteredTokens.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTokens.map(token => (
                <TableRow key={token.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="bg-accent-500/10 rounded-lg p-2">
                        <Key className="text-accent-600 h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {token.cors.length} CORS domain
                          {token.cors.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted rounded px-2 py-1 text-sm">
                        {token.token}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        token.status === 'active' ? 'default' : 'destructive'
                      }
                      className={
                        token.status === 'active'
                          ? 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-800'
                          : ''
                      }
                    >
                      {token.status === 'active' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {token.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {token.usageCount}/{token.maxUploads}
                      </div>
                      <div className="bg-muted h-2 w-24 rounded-full">
                        <div
                          className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(token.usageCount / token.maxUploads) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(token.expiresAt).toLocaleDateString()}
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
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Token
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" />
                          Extend Expiry
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke
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
