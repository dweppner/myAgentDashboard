import type { Database } from '@/lib/database.types'

export type Agent = Database['public']['Tables']['agents']['Row']

export type AgentStatus = 'active' | 'idle' | 'offline'

export interface AgentStatusSummary {
  total: number
  active: number
  idle: number
  offline: number
}
