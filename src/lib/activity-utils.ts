import type { Database } from './database.types'
import type { Agent } from '@/types/agent'

export type ActivityLog = Database['public']['Tables']['agent_activity_logs']['Row']

export interface AgentStats {
  tasks_completed_7d: number
  tasks_completed_30d: number
  total_tokens: number
  current_streak: number
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  task_started: 'Task Started',
  task_completed: 'Task Completed',
  pr_created: 'PR Created',
  issue_opened: 'Issue Opened',
  deployment: 'Deployment',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  task_completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  task_started: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  pr_created: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  deployment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  issue_opened: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
}

export function formatEventType(type: string): string {
  if (type in EVENT_TYPE_LABELS) return EVENT_TYPE_LABELS[type]
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getEventTypeBadgeColor(type: string): string {
  return EVENT_TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

export function extractTokensFromMetadata(metadata: unknown): number {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return 0
  const m = metadata as Record<string, unknown>
  const input = typeof m.tokens_input === 'number' ? m.tokens_input : 0
  const output = typeof m.tokens_output === 'number' ? m.tokens_output : 0
  return input + output
}

export function calculateAgentStats(logs: ActivityLog[]): AgentStats {
  if (logs.length === 0) {
    return { tasks_completed_7d: 0, tasks_completed_30d: 0, total_tokens: 0, current_streak: 0 }
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let tasks_completed_7d = 0
  let tasks_completed_30d = 0
  let total_tokens = 0

  for (const log of logs) {
    const createdAt = new Date(log.created_at)
    if (log.event_type === 'task_completed') {
      if (createdAt >= sevenDaysAgo) tasks_completed_7d++
      if (createdAt >= thirtyDaysAgo) tasks_completed_30d++
    }
    total_tokens += extractTokensFromMetadata(log.metadata)
  }

  const current_streak = calculateStreak(logs)

  return { tasks_completed_7d, tasks_completed_30d, total_tokens, current_streak }
}

function calculateStreak(logs: ActivityLog[]): number {
  const activeDays = new Set(
    logs.map((log) => log.created_at.split('T')[0])
  )

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (!activeDays.has(todayStr) && !activeDays.has(yesterdayStr)) return 0

  let streak = 0
  const cursor = new Date(now)

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0]
    if (activeDays.has(dateStr)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function getAdjacentAgents(
  agents: Agent[],
  currentId: string
): { prev: Agent | null; next: Agent | null } {
  const idx = agents.findIndex((a) => a.id === currentId)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? agents[idx - 1] : null,
    next: idx < agents.length - 1 ? agents[idx + 1] : null,
  }
}
