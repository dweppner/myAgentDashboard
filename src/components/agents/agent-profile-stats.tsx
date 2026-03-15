import type { AgentStats } from '@/lib/activity-utils'

interface AgentProfileStatsProps {
  stats: AgentStats
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${parseFloat((count / 1_000_000).toFixed(1))}M`
  if (count >= 1_000) return `${parseFloat((count / 1_000).toFixed(1))}k`
  return String(count)
}

interface StatCardProps {
  value: string | number
  label: string
  sublabel?: string
}

function StatCard({ value, label, sublabel }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center space-y-1">
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground/60">{sublabel}</p>}
    </div>
  )
}

export function AgentProfileStats({ stats }: AgentProfileStatsProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-3">Stats</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          value={stats.tasks_completed_7d}
          label="Tasks Completed"
          sublabel="Last 7 days"
        />
        <StatCard
          value={stats.tasks_completed_30d}
          label="Tasks Completed"
          sublabel="Last 30 days"
        />
        <StatCard
          value={stats.current_streak}
          label="Day Streak"
          sublabel="Consecutive days active"
        />
        <StatCard
          value={formatTokens(stats.total_tokens)}
          label="Total Tokens"
          sublabel="All time"
        />
      </div>
    </div>
  )
}
