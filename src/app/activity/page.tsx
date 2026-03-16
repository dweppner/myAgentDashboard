import { createClient } from '@/lib/supabase/server'
import { GlobalActivityFeed } from '@/components/activity/global-activity-feed'
import type { GlobalActivityLog } from '@/lib/global-activity-utils'
import type { Agent } from '@/types/agent'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const supabase = await createClient()

  const [logsResult, agentsResult] = await Promise.all([
    supabase
      .from('agent_activity_logs')
      .select('*, agents(id, name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('agents').select('*').order('name'),
  ])

  if (logsResult.error) {
    console.error('Failed to fetch activity logs:', logsResult.error.message)
  }

  if (agentsResult.error) {
    console.error('Failed to fetch agents:', agentsResult.error.message)
  }

  const logs = (logsResult.data ?? []) as GlobalActivityLog[]
  const agents = (agentsResult.data ?? []) as Agent[]

  return <GlobalActivityFeed initialLogs={logs} agents={agents} />
}
