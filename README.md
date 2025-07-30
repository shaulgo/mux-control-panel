# Mux Control Panel

A production-ready admin dashboard for managing Mux.com video assets, built with Next.js 15, React 19, and TypeScript.

## Features

- 🎥 **Asset Management** - View, search, and manage video assets
- 📤 **Bulk Upload** - Create multiple assets from URLs
- 📚 **Libraries** - Organize assets into collections
- 📊 **Usage Dashboard** - Monitor storage and delivery costs
- 📈 **Analytics** - View-level metrics and QoE data
- 🔑 **Upload Tokens** - Generate signed upload URLs
- 🌙 **Dark Mode** - System preference with manual toggle
- 📱 **Responsive** - Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 15.4 (App Router)
- **React**: 19.1
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS 4.0 + shadcn/ui
- **Database**: Prisma ORM + Neon Postgres
- **State Management**: TanStack Query 5.83
- **Authentication**: Iron Session + Argon2
- **Video**: Mux SDK + Player
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel + Neon

## Local Development

### Prerequisites

- Node.js 18+
- Yarn Classic 1.22
- Mux account with API credentials
- Neon database (free tier)

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd mux-control-panel
   yarn install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
   DIRECT_URL="postgresql://username:password@hostname:port/database?sslmode=require"

   # Mux Configuration
   MUX_TOKEN_ID="your_mux_token_id"
   MUX_TOKEN_SECRET="your_mux_token_secret"
   MUX_ENV_KEY="env_xxx"
   MUX_WEBHOOK_SECRET="your_webhook_secret"

   # Admin Authentication
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD_HASH="$argon2id$v=19$m=65536,t=3,p=4$..."

   # Session Secret (generate with: openssl rand -base64 32)
   SESSION_SECRET="your-session-secret-key-here"
   ```

3. **Generate admin password hash**

   ```bash
   node -e "
   const argon2 = require('argon2');
   argon2.hash('your-password').then(hash => console.log(hash));
   "
   ```

4. **Database setup**

   ```bash
   yarn db:generate
   yarn db:migrate
   yarn db:seed
   ```

5. **Start development server**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and login with your admin credentials.

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn test` - Run tests
- `yarn type-check` - TypeScript type checking
- `yarn db:migrate` - Run database migrations
- `yarn db:seed` - Seed database with sample data
- `yarn db:studio` - Open Prisma Studio

## Deploy to Vercel

### 1. Prepare your repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

### 2. Create Vercel project

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `yarn build`
   - **Output Directory**: `.next`

### 3. Environment variables

Add all environment variables from `.env.example` in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable from your `.env.local`
3. Make sure to use production values for:
   - `DATABASE_URL` (Neon production database)
   - `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` (production Mux credentials)
   - `ADMIN_PASSWORD_HASH` (secure password hash)
   - `SESSION_SECRET` (cryptographically secure random string)

### 4. Database setup

Run migrations on your production database:

```bash
# Using Vercel CLI
vercel env pull .env.production
yarn db:deploy
```

### 5. Deploy

Push to your main branch or click "Deploy" in Vercel dashboard.

## Mux Setup

### 1. Create Mux account

Sign up at [mux.com](https://mux.com) and create a new environment.

### 2. Get API credentials

1. Go to Settings → Access Tokens
2. Create a new token with Video and Data permissions
3. Copy the Token ID and Secret

### 3. Environment key

1. Go to Settings → Environments
2. Copy your Environment Key (starts with `env_`)

### 4. Webhook setup (optional)

1. Go to Settings → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/mux`
3. Copy the webhook secret

## Database Schema

```mermaid
erDiagram
    Library ||--o{ LibraryAsset : contains
    LibraryAsset {
        string libraryId PK
        string assetId PK
        int position
        datetime createdAt
    }
    Library {
        string id PK
        string name
        string slug UK
        string description
        datetime createdAt
        datetime updatedAt
    }
    DailyUsage {
        date day PK
        bigint streamedMinutes
        float storageGb
        datetime createdAt
        datetime updatedAt
    }
    UploadToken {
        string id PK
        string token UK
        string url
        datetime expiresAt
        boolean used
        datetime usedAt
        datetime createdAt
    }
    AssetMetadata {
        string assetId PK
        string title
        string description
        string[] tags
        float duration
        string aspectRatio
        datetime createdAt
        datetime updatedAt
    }
    Session {
        string id PK
        string userId
        datetime expiresAt
        datetime createdAt
    }
```

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**

```bash
yarn type-check
# Fix any TypeScript errors before deploying
```

**Database connection issues**

- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Vercel
- Check Neon connection limits

**Mux API errors**

- Verify `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`
- Check token permissions (Video + Data required)
- Ensure rate limiting is not exceeded

**Authentication issues**

- Verify `ADMIN_PASSWORD_HASH` is correctly generated
- Ensure `SESSION_SECRET` is set and secure
- Check `ADMIN_EMAIL` matches login attempt

### Performance

**Slow asset loading**

- Enable Mux MP4 support for faster playback
- Use appropriate thumbnail sizes
- Implement pagination for large asset lists

**High database usage**

- Monitor Neon usage dashboard
- Optimize queries in development
- Consider upgrading Neon plan if needed

### Security

**Production checklist**

- [ ] Use strong `SESSION_SECRET` (32+ random bytes)
- [ ] Secure `ADMIN_PASSWORD_HASH` with Argon2
- [ ] Enable HTTPS in production
- [ ] Verify webhook signatures
- [ ] Monitor access logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `yarn test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
