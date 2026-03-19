import { createClient } from '@/lib/supabase/server'
import { AgentGrid } from '@/components/agents/agent-grid'
import { TokenSummary } from '@/components/home/token-summary'
import { computeTodayTokenSummary } from '@/lib/token-utils'
import { extractTokensFromMetadata } from '@/lib/activity-utils'
import type { Database } from '@/lib/database.types'

type AgentRow = Database['public']['Tables']['agents']['Row']
type ActivityLogRow = Database['public']['Tables']['agent_activity_logs']['Row']

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: agents, error: agentsError } = (await supabase
    .from('agents')
    .select('*')
    .order('name')) as { data: AgentRow[] | null; error: { message: string } | null }

  const { data: todayLogs } = (await supabase
    .from('agent_activity_logs')
    .select('*')
    .gte('created_at', todayStart.toISOString())) as { data: ActivityLogRow[] | null; error: unknown }

  if (agentsError) {
    console.error('Failed to fetch agents:', agentsError.message)
  }

  // Aggregate today's tokens per agent
  const tokensByAgent = new Map<string, number>()
  for (const log of todayLogs ?? []) {
    const tokens = extractTokensFromMetadata(log.metadata)
    tokensByAgent.set(log.agent_id, (tokensByAgent.get(log.agent_id) ?? 0) + tokens)
  }

  const agentTokenInput = (agents ?? []).map((a) => ({
    name: a.name,
    tokens: tokensByAgent.get(a.id) ?? 0,
  }))

  const tokenSummary = computeTodayTokenSummary(agentTokenInput)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Today&apos;s Token Usage</h2>
        <TokenSummary
          totalTokensToday={tokenSummary.totalTokens}
          topConsumerName={tokenSummary.topConsumerName}
          topConsumerTokens={tokenSummary.topConsumerTokens}
        />
      </div>
      <AgentGrid initialAgents={agents ?? []} />
    </div>
  )
}
