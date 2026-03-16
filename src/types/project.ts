import type { Database } from '@/lib/database.types'

export type Project = Database['public']['Tables']['projects']['Row']

export type ProjectStatus = 'active' | 'inactive'

export interface ProjectSummary {
  total: number
  active: number
  inactive: number
  totalOpenIssues: number
  totalP0: number
}

export type SortKey = 'name' | 'status' | 'most-issues' | 'most-critical'
