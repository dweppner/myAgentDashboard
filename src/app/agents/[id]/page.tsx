import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateAgentStats, getAdjacentAgents } from '@/lib/activity-utils'
import { buildTokenChartProps, TokenUsageChart } from '@/components/agents/token-usage-chart'
import { AgentProfileHeader } from '@/components/agents/agent-profile-header'
import { AgentProfileStats } from '@/components/agents/agent-profile-stats'
import { ActivityFeed } from '@/components/agents/activity-feed'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [agentResult, allAgentsResult, logsResult] = await Promise.all([
    supabase.from('agents').select('*').eq('id', id).single(),
    supabase.from('agents').select('*').order('name'),
    supabase
      .from('agent_activity_logs')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const agentData = agentResult.data
  if (agentResult.error || !agentData) {
    notFound()
  }

  const agent = agentData
  const allAgents = allAgentsResult.data ?? []
  const logs = logsResult.data ?? []

  const stats = calculateAgentStats(logs)
  const { prev, next } = getAdjacentAgents(allAgents, id)
  const tokenChartProps = buildTokenChartProps(logs)

  return (
    <div className="space-y-8 max-w-3xl">
      <AgentProfileHeader agent={agent} prevAgent={prev} nextAgent={next} />
      <AgentProfileStats stats={stats} />
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Token Usage</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <TokenUsageChart {...tokenChartProps} />
        </div>
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Activity</h2>
        <ActivityFeed logs={logs} />
      </div>
    </div>
  )
}
