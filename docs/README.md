# Spot On Maps - SaaS for Google Maps Business Management
<!-- GENERATED_AT:2025-12-01T12:45:20.684Z -->

A production-ready SaaS backend for helping businesses register on Google Maps, monitor verification status, and track competitor activity.

## 🎯 Features

- **OAuth2 Authentication**: Secure Google account authorization
- **Token Management**: Encrypted storage with automatic refresh
- **Business Profile API**: Google Business Profile integration
- **Multi-tenant**: Complete data isolation per tenant
- **Cloud Ready**: Deploy to Google Cloud Run with Cloud Tasks
- **Comprehensive Docs**: Detailed guides for setup, testing, and deployment

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Mike-SamaSama/spoton-maps.git
cd spoton-maps
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Google OAuth credentials
```

### 3. Start Server

```bash
npm run dev
```

Visit http://localhost:3000 and click "Authorize with Google"

## 📁 Project Structure

```
spoton-maps/
├── server.js                 # Main Express API
├── refresh-runner.js         # Token refresh scheduler
├── lib/
│   ├── crypto.js            # AES-256-GCM encryption
│   ├── storage.js           # Multi-backend token storage
│   ├── refresh.js           # Token refresh logic
│   ├── gbp.js               # Google Business Profile wrapper
│   ├── kms.js               # Cloud KMS wrapper
│   ├── cloudtasks.js        # Cloud Tasks enqueuer
│   └── prisma.js            # Prisma client wrapper
├── workers/
│   ├── refresh-worker.js    # Cloud Run worker for token refresh
│   └── competitor-scan-worker.js  # Cloud Run worker (TODO)
├── views/
│   ├── index.ejs            # Homepage
│   └── authorized.ejs       # OAuth callback
├── prisma/
│   ├── schema.prisma        # Data models
│   └── seed.js              # Database seeding
├── deployment/
│   ├── cloud_sql_setup.md   # PostgreSQL setup
│   └── cloud_tasks_setup.md # Cloud Tasks setup
└── docs/
    ├── START_HERE.md        # Entry point guide
    ├── CHECKLIST.md         # Step-by-step setup
    ├── ARCHITECTURE.md      # Deep dive documentation
    ├── TESTING.md           # Testing procedures
    ├── QUICK_REFERENCE.md   # Cheat sheet
    ├── VISUAL_GUIDE.md      # Architecture diagrams
    └── SUMMARY.md           # Project summary
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Homepage |
| GET | `/health` | Health check |
| GET | `/auth/start` | Start OAuth flow |
| GET | `/auth/callback` | OAuth callback |
| GET | `/accounts?token=X` | List Google Business accounts |
| POST | `/create-location` | Create new business location |
| POST | `/refresh/:id` | Manually refresh token |
| POST | `/enqueue-refresh` | Queue token refresh to Cloud Tasks |

## 🗄️ Database Schema

```
Tenant
  ├── Token (encrypted tokens)
  ├── Location (business locations)
  │   ├── Competitor
  │   │   └── Snapshot
  └── Competitor
      └── Snapshot
```

## 🔐 Security

- **AES-256-GCM encryption** for all tokens at rest
- **OAuth scope limiting** for minimal Google API permissions
- **Per-tenant data isolation** in database
- **Cloud KMS integration** for production encryption
- **OIDC token verification** for Cloud Tasks workers

## 📖 Documentation

- **[START_HERE.md](docs/START_HERE.md)** — Entry point and quick start
- **[CHECKLIST.md](docs/CHECKLIST.md)** — Step-by-step setup guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Deep dive into components
- **[TESTING.md](docs/TESTING.md)** — Comprehensive testing procedures
- **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** — Developer cheat sheet
- **[VISUAL_GUIDE.md](docs/VISUAL_GUIDE.md)** — ASCII diagrams
- **[SUMMARY.md](docs/SUMMARY.md)** — Project overview

## 🚢 Deployment

### Local Development

```bash
npm run dev              # Start main server
npm run refresh         # Start refresh scheduler
npm run migrate         # Run Prisma migrations
npm run seed            # Seed database
```

### Production (Google Cloud)

See deployment guides:
- `deployment/cloud_sql_setup.md` — Set up PostgreSQL
- `deployment/cloud_tasks_setup.md` — Set up Cloud Tasks and KMS

Deploy API and workers to Cloud Run.

## 🧪 Testing

See `docs/TESTING.md` for comprehensive testing procedures including:
- OAuth flow testing
- Token refresh testing
- Encryption verification
- Multi-tenant isolation
- End-to-end testing

## 📦 Dependencies

**Core:**
- express
- ejs
- dotenv
- node-fetch
- uuid
- node-cron
- pg

**Optional (for production):**
- @prisma/client
- @google-cloud/kms
- @google-cloud/tasks

## 📝 Environment Variables

See `.env.example` for complete list. Key variables:

```
GOOGLE_CLIENT_ID              # OAuth client ID
GOOGLE_CLIENT_SECRET          # OAuth client secret
GOOGLE_REDIRECT_URI           # OAuth callback URL
PORT                          # Server port (default: 3000)
STORAGE_BACKEND              # Storage backend: file|postgres|prisma
ENCRYPTION_KEY               # 32-byte hex key for AES-256-GCM
DATABASE_URL                 # PostgreSQL connection string
SCHEDULE_CRON                # Token refresh schedule (default: 0 3 * * *)
```

## 🔄 Token Refresh Flow

1. **Scheduled**: Daily cron job (configurable via `SCHEDULE_CRON`)
2. **Manual**: `POST /refresh/:id` endpoint
3. **Enqueued**: `POST /enqueue-refresh` → Cloud Tasks → Worker

## 🛠️ Configuration

### Storage Backend

Set `STORAGE_BACKEND` to:
- `file` — Local file system (development)
- `postgres` — Raw PostgreSQL (production)
- `prisma` — Prisma ORM (recommended for production)

### Encryption

- **Development**: Local AES-256-GCM (set `ENCRYPTION_KEY`)
- **Production**: Cloud KMS (set `USE_CLOUD_KMS=true` and configure KMS env vars)

### Scheduling

Default: `0 3 * * *` (Daily at 03:00 UTC)

Edit `SCHEDULE_CRON` in `.env` using cron syntax.

## 📊 Success Metrics

- ✅ OAuth flow completes successfully
- ✅ Tokens are encrypted and decrypted correctly
- ✅ Daily cron refresh executes without errors
- ✅ Data is isolated per tenant in database
- ✅ All API endpoints return expected responses
- ✅ Manual and Cloud Tasks refresh both work

## 🎯 Next Steps

1. **Setup**: Follow CHECKLIST.md for step-by-step guide
2. **Testing**: Run tests from TESTING.md
3. **Development**: Build competitor discovery features
4. **Deployment**: Follow deployment guides for production

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please review existing patterns in the codebase and follow the architecture outlined in ARCHITECTURE.md.

---

**Start here:** [docs/START_HERE.md](docs/START_HERE.md)
