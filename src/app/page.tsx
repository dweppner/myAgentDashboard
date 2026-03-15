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
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AgentGrid initialAgents={agents ?? []} />
      </div>
    </main>
  )
}
