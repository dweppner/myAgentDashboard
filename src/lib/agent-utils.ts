import type { Agent, AgentStatusSummary } from '@/types/agent'

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'idle':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

export function getStatusDotColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'idle':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'idle':
      return 'Idle'
    case 'offline':
      return 'Offline'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function truncateTask(
  task: string | null | undefined,
  maxLength: number
): string {
  if (!task) return ''
  if (task.length <= maxLength) return task
  return task.slice(0, maxLength) + '...'
}

export function getAgentStatusSummary(agents: Agent[]): AgentStatusSummary {
  const summary: AgentStatusSummary = { total: agents.length, active: 0, idle: 0, offline: 0 }
  for (const agent of agents) {
    if (agent.status === 'active') summary.active++
    else if (agent.status === 'idle') summary.idle++
    else if (agent.status === 'offline') summary.offline++
  }
  return summary
}
