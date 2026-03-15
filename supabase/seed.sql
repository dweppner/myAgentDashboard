-- Seed data for Agent Dashboard
-- Agents and projects from the Dennis Agent System

-- ============================================================
-- Agents
-- ============================================================
INSERT INTO public.agents (name, type, role, description, systems, interaction_guide, status)
VALUES
  (
    'Scout',
    'openclaw',
    'Research & Discovery',
    'Researches GitHub issues, discovers patterns, and gathers intelligence to inform implementation plans.',
    ARRAY['GitHub', 'Exa', 'Web Search'],
    'Assign issues or ask Scout to research a topic. Scout returns findings as structured summaries.',
    'idle'
  ),
  (
    'PM',
    'openclaw',
    'Product Manager',
    'Manages the product backlog, writes and refines GitHub issues, and prioritizes work across projects.',
    ARRAY['GitHub', 'Slack', 'projects.json'],
    'Ask PM to create, update, or prioritize issues. PM keeps the backlog healthy and actionable.',
    'idle'
  ),
  (
    'Coach',
    'openclaw',
    'Quality & Review',
    'Reviews code quality, tests coverage, and architectural decisions. Coaches the team on best practices.',
    ARRAY['GitHub PRs', 'Vitest', 'ESLint'],
    'Tag Coach on PRs or ask for a code review. Coach provides CRITICAL/HIGH/MEDIUM severity feedback.',
    'idle'
  ),
  (
    'Forge',
    'openclaw',
    'Identity & Soul',
    'Maintains agent identity, manages the SOUL.md and IDENTITY.md files, and ensures agents stay aligned with Dennis''s vision.',
    ARRAY['AgentsSync', 'SOUL.md', 'IDENTITY.md'],
    'Ask Forge to update agent identity files or reflect on mission alignment.',
    'idle'
  ),
  (
    'Claude Code Builder',
    'claude-code',
    'Code Builder',
    'Implements GitHub issues using TDD: writes failing tests first, then implements, then reviews and opens PRs.',
    ARRAY['GitHub', 'Vitest', 'Playwright', 'Supabase', 'Vercel'],
    'Assign GitHub issues to weppneragents-droid. Claude Code Builder picks them up automatically and opens PRs.',
    'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Projects (from projects.json)
-- ============================================================
INSERT INTO public.projects (project_id, name, repo, stack, status, hosting, production_url, staging_url, slack_channel_id)
VALUES
  (
    'ios-dennis-system',
    'iOS Dennis System',
    'dweppner/ios-dennis-system',
    'ios',
    'active',
    'testflight',
    NULL,
    NULL,
    'C0AMH5YRB5E'
  ),
  (
    'myagentdashboard',
    'Agent Dashboard',
    'dweppner/myAgentDashboard',
    'nextjs',
    'active',
    'vercel',
    'https://my-agent-dashboard-sepia.vercel.app',
    NULL,
    'C0ALGJLPF8T'
  )
ON CONFLICT (project_id) DO UPDATE SET
  name = EXCLUDED.name,
  repo = EXCLUDED.repo,
  stack = EXCLUDED.stack,
  status = EXCLUDED.status,
  hosting = EXCLUDED.hosting,
  production_url = EXCLUDED.production_url,
  staging_url = EXCLUDED.staging_url,
  slack_channel_id = EXCLUDED.slack_channel_id,
  updated_at = now();
