# Next.js Web Project — Claude Code Guidelines

## Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (auth, database, storage, realtime)
- **Hosting:** Vercel (staging + production)
- **Testing:** Vitest (unit), Playwright (e2e)
- **Package Manager:** pnpm (preferred) or npm

## Development Workflow

### Branch Strategy
- `main` — production, auto-deploys to Vercel production
- `develop` — staging, auto-deploys to Vercel preview
- `issue-{number}-{slug}` — feature/fix branches from `develop`

### For Each GitHub Issue
1. Create branch from `develop`: `issue-{number}-{slug}`
2. Read the issue body thoroughly for requirements
3. **Write tests first** (TDD):
   - Unit tests with Vitest for utils, hooks, server actions
   - E2E tests with Playwright for user-facing flows
4. Implement the minimum code to pass tests
5. Run: `pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build`
6. Open PR to `develop` with:
   - Summary of changes
   - Test results
   - Vercel preview URL (auto-generated)
7. Post to project Slack channel

### Code Style
- App Router: use `app/` directory with route groups
- Server Components by default, `'use client'` only when needed
- Server Actions for mutations (forms, data writes)
- Use Zod for all input validation
- Prefer immutable patterns — never mutate state directly
- Small files: 200-400 lines, 800 max
- Functions under 50 lines

### Supabase Integration
- Use `@supabase/ssr` for server-side auth
- Create Supabase client per-request in Server Components
- Use `createBrowserClient()` in Client Components
- Never expose service_role key to client
- Row Level Security (RLS) must be enabled on all tables
- Use Supabase Auth with middleware for route protection
- Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

### Testing Requirements
- Minimum 80% code coverage
- Vitest for unit/integration tests
- Playwright for critical user flows (auth, core features)
- Mock Supabase with MSW or custom test utilities
- Run `pnpm run test:coverage` to verify coverage

### Deployment
- **Staging:** Auto-deploys to Vercel preview on PR to `develop`
- **Production:** Requires Dennis's Slack approval before merging `develop` → `main`
- When staging is verified, post to Slack:
  "Staging verified for PR #{number}. Preview: {url}. Reply 'approve deploy' to deploy to production."
- On approval, merge `develop` → `main` (triggers Vercel production deploy)
- Post deployment confirmation to Slack with production URL
