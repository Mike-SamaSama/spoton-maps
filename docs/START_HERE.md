# 🗺️ START HERE - Spot On Maps

Welcome to **Spot On Maps**, a SaaS platform for Google Maps business registration, verification monitoring, and competitor analysis.

## What Is This?

Spot On Maps helps multi-location enterprises:
- **Register** businesses on Google Maps at scale
- **Monitor** verification status and credentials
- **Track** competitors in real-time
- **Automate** token refresh and API interactions

## 📚 Quick Start (5 minutes)

1. **Clone/copy the repo**
   ```bash
   cd spoton-maps
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   # Edit with your Google OAuth credentials
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

4. **Open browser** → http://localhost:3000

5. **Click "Authorize with Google"** to test OAuth flow

## 📖 Documentation Map

| Document | Time | Purpose |
|----------|------|---------|
| **START_HERE.md** (this file) | 10 min | Entry point, quick start |
| **CHECKLIST.md** | 90 min | Step-by-step setup with time estimates |
| **ARCHITECTURE.md** | 60 min | Deep dive into how everything works |
| **QUICK_REFERENCE.md** | 15 min | Cheat sheet for development |
| **TESTING.md** | 120 min | Complete testing procedures |
| **VISUAL_GUIDE.md** | 20 min | ASCII diagrams of flows and architecture |
| **SUMMARY.md** | 30 min | Project overview and status |

## 🎯 What You Get

**Core Features:**
- ✅ OAuth2 authentication with Google
- ✅ Encrypted token storage (AES-256-GCM)
- ✅ Automatic token refresh (daily cron)
- ✅ Multi-tenant data isolation (Prisma)
- ✅ Cloud Tasks integration (production)
- ✅ Google Business Profile API wrapper
- ✅ Comprehensive documentation & examples

**Tech Stack:**
- Node.js 18+, Express.js
- PostgreSQL + Prisma ORM
- Google OAuth2 & APIs
- Cloud Run, Cloud KMS, Cloud Tasks (optional)

## ⏱️ Weekly Learning Path

**Day 1 (2 hours):**
- Read START_HERE.md (this file)
- Read CHECKLIST.md
- Complete local setup

**Day 2 (1.5 hours):**
- Read ARCHITECTURE.md
- Review code in `lib/` and `server.js`
- Understand OAuth flow

**Day 3 (1 hour):**
- Read VISUAL_GUIDE.md
- Review data models in `prisma/schema.prisma`
- Understand token encryption/refresh

**Day 4-5 (3 hours):**
- Follow TESTING.md procedures
- Test all endpoints
- Verify encryption works
- Test multi-tenant isolation

**Week 2+:**
- Implement competitor discovery
- Build onboarding UI
- Create admin dashboard
- Deploy to production

## 📁 File Inventory by Category

### Core Backend
- `server.js` — Main Express API with OAuth
- `refresh-runner.js` — Scheduled token refresh

### Libraries (`lib/`)
- `crypto.js` — AES-256-GCM encryption
- `storage.js` — Multi-backend token storage (file/SQL/Prisma)
- `refresh.js` — Token refresh logic
- `gbp.js` — Google Business Profile API wrapper
- `kms.js` — Cloud KMS encryption (production)
- `cloudtasks.js` — Cloud Tasks enqueuer (production)
- `prisma.js` — Prisma client wrapper

### Workers
- `workers/refresh-worker.js` — Cloud Run worker for token refresh
- `workers/competitor-scan-worker.js` — Cloud Run worker for competitor discovery (TODO)

### Database
- `prisma/schema.prisma` — Data models (Tenant, Token, Location, Competitor, Snapshot)
- `prisma/seed.js` — Database seeding

### Views
- `views/index.ejs` — Homepage with OAuth button
- `views/authorized.ejs` — OAuth callback page

### Config & Scripts
- `package.json` — Dependencies and scripts
- `.env.example` — Environment variables template
- `scripts/migrate-prisma.js` — Migration runner

### Deployment
- `deployment/cloud_sql_setup.md` — PostgreSQL setup guide
- `deployment/cloud_tasks_setup.md` — Cloud Tasks setup guide

## 🏗️ Architecture Overview

**OAuth Flow:**
User → /auth/start → Google OAuth → /auth/callback → Token saved (encrypted)

**Token Storage:**
File system (dev) → PostgreSQL (production) → Prisma ORM (recommended)

**Token Refresh:**
Daily cron job → Refresh all tokens → Update storage → Log results

**Cloud Tasks (Production):**
API → Enqueue task → Cloud Tasks → Cloud Run worker → Token refresh

**Multi-tenant:**
All data scoped by `tenantId` → Complete data isolation per tenant

## 🔐 Security Features

- ✅ AES-256-GCM encryption for all tokens
- ✅ Secure refresh token storage (never sent to frontend)
- ✅ OAuth scope limiting (minimal permissions)
- ✅ Per-tenant data isolation (Prisma)
- ✅ Cloud KMS integration (production)
- ✅ OIDC token verification for Cloud Tasks (production)

## 🔧 Tech Stack Highlights

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript server runtime |
| Framework | Express.js | Web API framework |
| Database | PostgreSQL | Relational data storage |
| ORM | Prisma | Type-safe database access |
| Auth | Google OAuth2 | User authentication |
| API Wrapper | node-fetch | HTTP requests to Google APIs |
| Encryption | crypto (Node.js) | AES-256-GCM encryption |
| Cloud KMS | @google-cloud/kms | Production key management |
| Cloud Tasks | @google-cloud/tasks | Distributed job queue |
| Scheduling | node-cron | Scheduled token refresh |

## 🚀 Next 5 Minutes

1. Copy this repo to your machine
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Google OAuth credentials
4. Run `npm run dev`
5. Visit http://localhost:3000 and click "Authorize with Google"

## ❓ FAQ

**Q: Do I need to set up Google Cloud to run this?**
A: No! Local setup works fine with file storage and node-cron. GCP is optional for production deployment.

**Q: How do I get Google OAuth credentials?**
A: See CHECKLIST.md Phase 2 for step-by-step instructions.

**Q: Can I use this with my existing database?**
A: Yes! The code supports file, PostgreSQL, and Prisma backends. See `lib/storage.js`.

**Q: How does token encryption work?**
A: AES-256-GCM with 12-byte random IV. Tokens are encrypted at rest and in transit. See `lib/crypto.js`.

**Q: Can I deploy this to production?**
A: Yes! See `deployment/cloud_sql_setup.md` and `deployment/cloud_tasks_setup.md` for GCP deployment.

**Q: What's the competitor discovery feature?**
A: Planned! Uses Google Places API for geospatial search. Worker stub exists in `workers/competitor-scan-worker.js`.

**Q: How do I test everything works?**
A: Follow TESTING.md for comprehensive test procedures covering all endpoints and features.

## 📞 Support & Resources

- GitHub Issues: Report bugs and feature requests
- Architecture Deep Dive: Read ARCHITECTURE.md
- Testing Guide: Read TESTING.md
- Visual Diagrams: Read VISUAL_GUIDE.md

## ✨ What's Next

After completing the setup and testing:

1. **Implement competitor discovery** using Places API
2. **Build onboarding UI** for business registration
3. **Create admin dashboard** for tenant management
4. **Add billing integration** with Stripe
5. **Deploy to production** on Cloud Run

## 🎓 Success Criteria

You'll know everything is working when:
- ✅ Server starts without errors
- ✅ OAuth flow completes (get Token ID)
- ✅ Tokens are saved and encrypted
- ✅ Daily cron refresh works
- ✅ All endpoints return expected responses
- ✅ Data is properly isolated per tenant

---

**Ready to dive deeper?** → Open **CHECKLIST.md** for step-by-step setup instructions.

**Want to understand the architecture?** → Open **ARCHITECTURE.md** for detailed explanations.

**Need a quick reference?** → Open **QUICK_REFERENCE.md** for cheat sheets and code snippets.
