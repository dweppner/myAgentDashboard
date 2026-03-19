import type { ActivityLog } from '@/lib/activity-utils'

export interface GlobalActivityLog extends ActivityLog {
  agents: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}
