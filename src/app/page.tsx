import { AppShell } from "@/components/AppShell";
import { createClient } from '@/lib/supabase/server'
import { AgentGrid } from '@/components/agents/agent-grid'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .order('name')

  if (error) {
    console.error('Failed to fetch agents:', error.message)
  }

  return (
    <AppShell pageTitle="Dashboard">
      <AgentGrid initialAgents={agents ?? []} />
    </AppShell>
  )
}
