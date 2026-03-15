-- Initial schema for Agent Dashboard
-- Creates agents, agent_activity_logs, and projects tables with RLS

-- ============================================================
-- agents table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  type             text NOT NULL CHECK (type IN ('openclaw', 'claude-code')),
  role             text NOT NULL,
  description      text NOT NULL DEFAULT '',
  systems          text[] NOT NULL DEFAULT '{}',
  interaction_guide text NOT NULL DEFAULT '',
  avatar_url       text,
  status           text NOT NULL DEFAULT 'offline' CHECK (status IN ('active', 'idle', 'offline')),
  current_task     text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_agents"
  ON public.agents
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes are performed by backend workers using the service_role key only.
-- The anon and authenticated roles are intentionally read-only.
CREATE POLICY "service_role_write_agents"
  ON public.agents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- agent_activity_logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  description text NOT NULL DEFAULT '',
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_activity_logs_agent_id ON public.agent_activity_logs(agent_id);
CREATE INDEX idx_agent_activity_logs_created_at ON public.agent_activity_logs(created_at DESC);

ALTER TABLE public.agent_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_agent_activity_logs"
  ON public.agent_activity_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_agent_activity_logs"
  ON public.agent_activity_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- projects table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         text NOT NULL UNIQUE,
  name               text NOT NULL,
  repo               text NOT NULL,
  stack              text NOT NULL,
  status             text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  hosting            text NOT NULL DEFAULT '',
  production_url     text,
  staging_url        text,
  slack_channel_id   text NOT NULL DEFAULT '',
  open_issues_count  int NOT NULL DEFAULT 0 CHECK (open_issues_count >= 0),
  p0_count           int NOT NULL DEFAULT 0 CHECK (p0_count >= 0),
  p1_count           int NOT NULL DEFAULT 0 CHECK (p1_count >= 0),
  p2_count           int NOT NULL DEFAULT 0 CHECK (p2_count >= 0),
  p3_count           int NOT NULL DEFAULT 0 CHECK (p3_count >= 0),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_projects"
  ON public.projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_projects"
  ON public.projects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
