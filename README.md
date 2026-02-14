# VenBook - Banquet & Event Management SaaS

> Modern venue booking platform for Ethiopian hotels

## 🔑 Demo Accounts

| Role | Email | Password | URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@venbook.com` | `password123` | /auth/admin/sign-in |
| **Hotel Owner (Addis)** | `owner@hotel-10-addisababa.com` | `password123` | /auth/owner/sign-in |
| **Hotel Owner (Hawassa)** | `owner@hotel-1-hawassa.com` | `password123` | /auth/owner/sign-in |
| **Staff (Sales)** | `staff2@hotel-1-hawassa.com` | `password123` | /auth/owner/sign-in |
| **Customer** | `client1@example.com` | `password123` | /auth/customer/sign-in |

---

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-blue)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5-green)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (LTS)
- **pnpm** 8+ (recommended) or npm
- **PostgreSQL** 15+
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/venbook.git
cd venbook

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and Clerk keys

# Setup database
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed initial data (optional)

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📋 Table of Contents

- [Tech Stack](#️-tech-stack)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [MCP Server Configuration](#-mcp-server-configuration)
- [Development Workflow](#-development-workflow)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🛠️ Tech Stack

### Core

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[tRPC](https://trpc.io/)** - End-to-end type-safe APIs
- **[Prisma](https://www.prisma.io/)** - Database ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Database
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled components
- **[Lucide Icons](https://lucide.dev/)** - Icon library

### Development Tools

- **[Playwright](https://playwright.dev/)** - E2E testing
- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 📖 Documentation

Detailed project documentation is available in the [`docs/`](file:///home/dev/src/venbook/docs) folder:

- **[Requirement Analysis](file:///home/dev/src/venbook/docs/REQUIREMENT_ANALYSIS.md)**: Logic behind the MVP, tax compliance, and multi-tenancy rules.
- **[User Journeys](file:///home/dev/src/venbook/docs/USER_JOURNEYS.md)**: Step-by-step paths for both Staff and Self-Service Customers.
- **[MVP Specification](file:///home/dev/src/venbook/docs/venbook-mvp-spec.md)**: Complete technical spec for Phase 1.
- **[Customer Portal Addendum](file:///home/dev/src/venbook/docs/venbook-customer-portal-addendum.md)**: Deep dive into the B2C booking marketplace.

---

## 📁 Project Structure

```
venbook/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public routes (no auth)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Homepage
│   │   ├── venues/             # Venue listing & details
│   │   └── book/               # Booking wizard
│   │
│   ├── (dashboard)/            # Protected routes (staff)
│   │   ├── layout.tsx
│   │   ├── dashboard/          # Dashboard
│   │   ├── calendar/           # Calendar view
│   │   ├── bookings/           # Booking management
│   │   ├── customers/          # Customer management
│   │   ├── invoices/           # Invoice management
│   │   └── settings/           # Settings
│   │
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts    # tRPC handler
│
├── components/                  # React components
│   ├── ui/                     # Base UI components (shadcn)
│   ├── booking/                # Booking-related components
│   ├── venue/                  # Venue-related components
│   └── layouts/                # Layout components
│
├── server/                      # Backend code
│   ├── api/
│   │   ├── routers/            # tRPC routers
│   │   │   ├── booking.ts
│   │   │   ├── venue.ts
│   │   │   ├── customer.ts
│   │   │   └── invoice.ts
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── trpc.ts             # tRPC setup
│   │   └── root.ts             # Root router
│   │
│   └── services/               # Business logic
│       ├── booking.service.ts
│       ├── tax.service.ts
│       └── conflict.service.ts
│
├── lib/                         # Shared utilities
│   ├── prisma.ts               # Prisma client
│   ├── utils.ts                # Helper functions
│   └── validations.ts          # Shared validations
│
├── hooks/                       # Custom React hooks
│   ├── useBooking.ts
│   └── useVenue.ts
│
├── stores/                      # Zustand stores
│   └── booking-wizard.ts
│
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data
│
├── public/                      # Static files
│   ├── images/
│   └── fonts/
│
├── __tests__/                   # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .cursorrules                 # AI assistant guidelines
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Environment Setup

### Required Environment Variables

Create `.env.local` in project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/venbook"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Cloudflare R2 (for file uploads)
CLOUDFLARE_R2_ACCESS_KEY="..."
CLOUDFLARE_R2_SECRET_KEY="..."
CLOUDFLARE_R2_BUCKET="venbook-uploads"
CLOUDFLARE_R2_ENDPOINT="https://..."

# Optional: Email (Resend)
RESEND_API_KEY="re_..."

# Optional: SMS (Twilio)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
```

### Database Setup

```bash
# Start PostgreSQL (Docker)
docker run --name venbook-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=venbook \
  -p 5432:5432 \
  -d postgres:15

# Or use docker-compose
docker-compose up -d postgres

# Push schema to database
pnpm db:push

# Or create migration
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

---

## 🤖 MCP Server Configuration

### What are MCP Servers?

MCP (Model Context Protocol) servers allow AI assistants to access external tools and data sources. For VenBook, we use MCP servers to help AI understand our database schema, query data, and navigate the codebase.

### Available MCP Servers

#### 1. Prisma MCP Server (Database Schema)

**Purpose:** Understand database schema, generate queries, inspect relationships

```json
// ~/.config/Claude/claude_desktop_config.json (macOS)
// %APPDATA%\Claude\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "prisma": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-prisma",
        "postgresql://user:password@localhost:5432/venbook"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/venbook"
      }
    }
  }
}
```

**Usage Examples:**
- "Show me all tables in the database"
- "What's the relationship between Booking and Invoice?"
- "Generate a Prisma query to find all confirmed bookings in March"

#### 2. PostgreSQL MCP Server (Direct Database Access)

**Purpose:** Execute SQL queries, analyze data, debug issues

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:password@localhost:5432/venbook"
      ]
    }
  }
}
```

**Usage Examples:**
- "How many bookings do we have per venue?"
- "Show me all TENTATIVE bookings older than 7 days"
- "Find customers who have made more than 5 bookings"

#### 3. Filesystem MCP Server (Code Navigation)

**Purpose:** Read/write files, understand project structure

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/absolute/path/to/venbook"
      ]
    }
  }
}
```

**Usage Examples:**
- "Show me the booking router implementation"
- "What components are in the /components/booking folder?"
- "Read the tax calculation logic"

#### 4. Git MCP Server (Version Control)

**Purpose:** Check history, review changes, understand evolution

```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "/absolute/path/to/venbook"
      ]
    }
  }
}
```

**Usage Examples:**
- "What changed in the last commit?"
- "Show me the history of the booking.ts file"
- "Who last modified the conflict detection logic?"

### Complete MCP Configuration

Create `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "prisma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-prisma"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/venbook"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@localhost:5432/venbook"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/yourname/projects/venbook"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/Users/yourname/projects/venbook"]
    }
  }
}
```

**Important Notes:**
- Replace `/Users/yourname/projects/venbook` with your actual project path
- Replace database credentials with your actual credentials
- Restart Claude Desktop after configuration changes
- MCP servers are optional but highly recommended for AI-assisted development

### Verifying MCP Setup

After configuring MCP servers:

1. Restart Claude Desktop
2. Look for the 🔌 icon in the bottom-right corner
3. Click it to see connected MCP servers
4. Try: "Using the Prisma MCP server, show me the Booking model"

---

## 💻 Development Workflow

### NPM Scripts

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm dev:turbo        # Start with Turbopack (faster)

# Database
pnpm db:push          # Push schema changes (dev)
pnpm db:migrate       # Create migration (prod)
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset database (DESTRUCTIVE)

# Type Checking
pnpm type-check       # Check TypeScript errors

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Watch mode
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Coverage report

# Build
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm check            # Run all checks (type, lint, test)
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/booking-wizard
# Make changes
git add .
git commit -m "feat: add booking wizard"
git push origin feature/booking-wizard
# Open PR on GitHub

# Commit message format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructure
# test: add tests
# chore: maintenance
```

### Database Migrations

```bash
# Development (no migration files)
pnpm db:push

# Production (create migration)
pnpm db:migrate

# Example: Add new field to Booking
# 1. Edit prisma/schema.prisma
# 2. Run: pnpm db:migrate
# 3. Name migration: "add_dietary_requests_to_booking"
# 4. Commit migration files
```

### Multi-Tenancy Reminders

**CRITICAL:** Every query MUST filter by `hotelId` (except Hotel model itself)

```typescript
// ✅ GOOD: hotelId enforced
const bookings = await prisma.booking.findMany({
  where: { hotelId: ctx.hotelId, status: 'CONFIRMED' }
});

// ❌ BAD: Missing hotelId (returns ALL hotels' bookings)
const bookings = await prisma.booking.findMany({
  where: { status: 'CONFIRMED' }
});
```

The Prisma middleware (in `lib/prisma.ts`) helps enforce this, but always double-check.

---

## 📖 API Documentation

### tRPC Routers

All API routes are defined in `server/api/routers/`

#### Booking Router

```typescript
// Available procedures
api.booking.list.useQuery({ status?: string })
api.booking.getById.useQuery({ id: string })
api.booking.create.useMutation(CreateBookingInput)
api.booking.update.useMutation({ id: string, data: UpdateBookingInput })
api.booking.delete.useMutation({ id: string })
api.booking.checkConflict.useQuery({ venueId, startTime, endTime })
```

#### Venue Router

```typescript
api.venue.list.useQuery()
api.venue.getBySlug.useQuery({ slug: string })
api.venue.create.useMutation(CreateVenueInput)
api.venue.update.useMutation({ id: string, data: UpdateVenueInput })
```

#### Invoice Router

```typescript
api.invoice.getById.useQuery({ id: string })
api.invoice.create.useMutation(CreateInvoiceInput)
api.invoice.recordPayment.useMutation({ invoiceId, payment: PaymentInput })
```

```bash
# Example command
ls -la
```

### Example Usage

```typescript
'use client';

export function BookingList() {
  // Query
  const { data, isLoading } = api.booking.list.useQuery({
    status: 'CONFIRMED'
  });
  
  // Mutation
  const createBooking = api.booking.create.useMutation({
    onSuccess: (data) => {
      toast.success('Booking created');
      router.push(`/bookings/${data.id}`);
    }
  });
  
  return (
    <div>
      {data?.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Example Test:**

```typescript
// __tests__/services/tax.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInvoice } from '@/server/services/tax.service';

describe('Tax Calculation', () => {
  it('calculates STANDARD tax correctly', () => {
    const result = calculateInvoice(
      [{ amount: 10000, description: 'Venue', quantity: 1, unitPrice: 10000 }],
      15, // VAT
      10, // Service charge
      'STANDARD'
    );
    
    expect(result.subtotal).toBe(10000);
    expect(result.serviceCharge).toBe(1000);
    expect(result.vatAmount).toBe(1500);
    expect(result.total).toBe(12500);
  });
});
```

### Integration Tests (tRPC)

```typescript
// __tests__/api/booking.test.ts
import { appRouter } from '@/server/api/root';

describe('Booking Router', () => {
  it('creates booking successfully', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const booking = await caller.booking.create({
      venueId: 'venue-1',
      customerId: 'customer-1',
      startTime: new Date('2026-03-15T09:00:00'),
      endTime: new Date('2026-03-15T17:00:00'),
      guaranteedPax: 100,
      eventName: 'Annual Meeting',
    });
    
    expect(booking.status).toBe('TENTATIVE');
  });
});
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Open Playwright UI
pnpm playwright test --ui
```

**Example E2E Test:**

```typescript
// __tests__/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test('customer can book a venue', async ({ page }) => {
  await page.goto('/venues');
  
  // Click first venue
  await page.click('[data-testid="venue-card"]:first-child');
  
  // Click book button
  await page.click('button:has-text("Book Now")');
  
  // Fill booking form
  await page.fill('[name="eventName"]', 'Test Event');
  await page.fill('[name="guaranteedPax"]', '100');
  
  // Submit
  await page.click('button:has-text("Continue")');
  
  // Should redirect to booking page
  await expect(page).toHaveURL(/\/bookings\/[a-z0-9]+/);
});
```

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables (Production)

```bash
# Required in production
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_APP_URL="https://venbook.et"

# Optional
CLOUDFLARE_R2_ACCESS_KEY="..."
CLOUDFLARE_R2_SECRET_KEY="..."
RESEND_API_KEY="..."
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration:**
- Framework: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

#### Railway (Database + Backend)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["pnpm", "start"]
```

```bash
# Build Docker image
docker build -t venbook .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="..." venbook
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Run tests (`pnpm test`)
6. Create a Pull Request

### Code Style

- Follow the `.cursorrules` guidelines
- Use TypeScript strict mode
- Write tests for new features
- Document complex logic
- Follow SOLID principles

### Pull Request Guidelines

**Title Format:**
```
feat: add booking conflict detection
fix: invoice tax calculation
docs: update API documentation
```

**Description Template:**
```markdown
## What
Brief description of changes

## Why
Reason for the change

## How
Technical approach

## Testing
How to test this change

## Screenshots (if applicable)
```

---

## 📞 Support

- **Documentation:** [docs.venbook.et](https://docs.venbook.et)
- **Issues:** [GitHub Issues](https://github.com/yourusername/venbook/issues)
- **Email:** support@venbook.et

---

## 📄 License

Proprietary - Copyright (c) 2026 VenBook

---

## 🙏 Acknowledgments

- [T3 Stack](https://create.t3.gg/) - Amazing foundation
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- Ethiopian hotel industry for inspiration

---

**Built with ❤️ for Ethiopian hospitality**
