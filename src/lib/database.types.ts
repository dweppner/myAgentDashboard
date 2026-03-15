export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AgentType = 'openclaw' | 'claude-code'
export type AgentStatus = 'active' | 'idle' | 'offline'
export type ProjectStatus = 'active' | 'inactive'

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          type: AgentType
          role: string
          description: string
          systems: string[]
          interaction_guide: string
          avatar_url: string | null
          status: AgentStatus
          current_task: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: AgentType
          role: string
          description: string
          systems?: string[]
          interaction_guide?: string
          avatar_url?: string | null
          status?: AgentStatus
          current_task?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: AgentType
          role?: string
          description?: string
          systems?: string[]
          interaction_guide?: string
          avatar_url?: string | null
          status?: AgentStatus
          current_task?: string | null
          updated_at?: string
        }
      }
      agent_activity_logs: {
        Row: {
          id: string
          agent_id: string
          event_type: string
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          event_type: string
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          event_type?: string
          description?: string
          metadata?: Json | null
        }
      }
      projects: {
        Row: {
          id: string
          project_id: string
          name: string
          repo: string
          stack: string
          status: ProjectStatus
          hosting: string
          production_url: string | null
          staging_url: string | null
          slack_channel_id: string
          open_issues_count: number
          p0_count: number
          p1_count: number
          p2_count: number
          p3_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          repo: string
          stack: string
          status?: ProjectStatus
          hosting: string
          production_url?: string | null
          staging_url?: string | null
          slack_channel_id: string
          open_issues_count?: number
          p0_count?: number
          p1_count?: number
          p2_count?: number
          p3_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          repo?: string
          stack?: string
          status?: ProjectStatus
          hosting?: string
          production_url?: string | null
          staging_url?: string | null
          slack_channel_id?: string
          open_issues_count?: number
          p0_count?: number
          p1_count?: number
          p2_count?: number
          p3_count?: number
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
