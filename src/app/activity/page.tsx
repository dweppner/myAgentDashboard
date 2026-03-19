import { createClient } from '@/lib/supabase/server'
import { GlobalActivityFeed } from '@/components/activity/global-activity-feed'
import type { GlobalActivityLog } from '@/lib/global-activity-utils'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const supabase = await createClient()

  const [logsResult, agentsResult] = await Promise.all([
    supabase
      .from('agent_activity_logs')
      .select('*, agents(id, name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('agents').select('id, name').order('name'),
  ])

  if (logsResult.error) {
    console.error('Failed to fetch activity logs:', logsResult.error.message)
  }
  if (agentsResult.error) {
    console.error('Failed to fetch agents:', agentsResult.error.message)
  }

  // The Supabase SDK does not infer the nested join shape, so we cast to the
  // extended type that includes the `agents` join field.
  const logs = (logsResult.data ?? []) as GlobalActivityLog[]
  const agents = agentsResult.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chronological stream of all agent actions across all projects.
        </p>
      </div>
      <GlobalActivityFeed initialLogs={logs} agents={agents} />
    </div>
  )
}
