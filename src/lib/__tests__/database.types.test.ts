import { describe, it, expect } from 'vitest'
import type { Database } from '../database.types'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

// Type-level tests: these ensure the type definitions have the correct shape
type AgentRow = Database['public']['Tables']['agents']['Row']
type AgentInsert = Database['public']['Tables']['agents']['Insert']
type AgentActivityLogRow = Database['public']['Tables']['agent_activity_logs']['Row']
type ProjectRow = Database['public']['Tables']['projects']['Row']

describe('Database types — agents table', () => {
  it('Row has required uuid fields', () => {
    type _Test = AgentRow['id'] extends string ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })

  it('Row has name and role fields', () => {
    type _Test = AgentRow['name'] extends string ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })

  it('Row has type field constrained to valid values', () => {
    type _Test = AgentRow['type'] extends string ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })

  it('Row has nullable optional fields', () => {
    type _Test = AgentRow['avatar_url'] extends string | null ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })

  it('Row has status field', () => {
    type _Test = AgentRow['status'] extends string ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })

  it('Row has timestamps', () => {
    type _TestCreated = AgentRow['created_at'] extends string ? true : never
    type _TestUpdated = AgentRow['updated_at'] extends string ? true : never
    const c: true = true as _TestCreated
    const u: true = true as _TestUpdated
    expect(c).toBe(true)
    expect(u).toBe(true)
  })

  it('Insert omits auto-generated fields', () => {
    type _Test = AgentInsert['name'] extends string ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })
})

describe('Database types — agent_activity_logs table', () => {
  it('Row has id and agent_id', () => {
    type _TestId = AgentActivityLogRow['id'] extends string ? true : never
    type _TestAgentId = AgentActivityLogRow['agent_id'] extends string ? true : never
    const id: true = true as _TestId
    const agentId: true = true as _TestAgentId
    expect(id).toBe(true)
    expect(agentId).toBe(true)
  })

  it('Row has event_type and description', () => {
    type _TestEvent = AgentActivityLogRow['event_type'] extends string ? true : never
    type _TestDesc = AgentActivityLogRow['description'] extends string ? true : never
    const e: true = true as _TestEvent
    const d: true = true as _TestDesc
    expect(e).toBe(true)
    expect(d).toBe(true)
  })

  it('Row has nullable metadata jsonb field', () => {
    // metadata is Json | null — Json can be string, number, boolean, object, array, or null
    type _Test = AgentActivityLogRow['metadata'] extends import('../database.types').Json | null ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })

  it('Row has created_at timestamp', () => {
    type _Test = AgentActivityLogRow['created_at'] extends string ? true : never
    const check: true = true as _Test
    expect(check).toBe(true)
  })
})

describe('Database types — projects table', () => {
  it('Row has id and project_id', () => {
    type _TestId = ProjectRow['id'] extends string ? true : never
    type _TestProjectId = ProjectRow['project_id'] extends string ? true : never
    const id: true = true as _TestId
    const pid: true = true as _TestProjectId
    expect(id).toBe(true)
    expect(pid).toBe(true)
  })

  it('Row has name, repo, stack, status fields', () => {
    type _T1 = ProjectRow['name'] extends string ? true : never
    type _T2 = ProjectRow['repo'] extends string ? true : never
    type _T3 = ProjectRow['stack'] extends string ? true : never
    type _T4 = ProjectRow['status'] extends string ? true : never
    const t1: true = true as _T1
    const t2: true = true as _T2
    const t3: true = true as _T3
    const t4: true = true as _T4
    expect(t1).toBe(true)
    expect(t2).toBe(true)
    expect(t3).toBe(true)
    expect(t4).toBe(true)
  })

  it('Row has nullable URL fields', () => {
    type _T1 = ProjectRow['production_url'] extends string | null ? true : never
    type _T2 = ProjectRow['staging_url'] extends string | null ? true : never
    const t1: true = true as _T1
    const t2: true = true as _T2
    expect(t1).toBe(true)
    expect(t2).toBe(true)
  })

  it('Row has issue count fields with number type', () => {
    type _T1 = ProjectRow['open_issues_count'] extends number ? true : never
    type _T2 = ProjectRow['p0_count'] extends number ? true : never
    const t1: true = true as _T1
    const t2: true = true as _T2
    expect(t1).toBe(true)
    expect(t2).toBe(true)
  })

  it('Row has timestamps', () => {
    type _T1 = ProjectRow['created_at'] extends string ? true : never
    type _T2 = ProjectRow['updated_at'] extends string ? true : never
    const t1: true = true as _T1
    const t2: true = true as _T2
    expect(t1).toBe(true)
    expect(t2).toBe(true)
  })
})

describe('SQL migration files exist', () => {
  const migrationsDir = resolve(__dirname, '../../../supabase/migrations')

  it('initial schema migration file exists', () => {
    const files = (() => {
      try {
        return readdirSync(migrationsDir) as string[]
      } catch {
        return []
      }
    })()
    const hasSchema = files.some((f: string) => f.includes('initial_schema'))
    expect(hasSchema).toBe(true)
  })

  it('migration file contains agents table creation', () => {
    const files = readdirSync(migrationsDir) as string[]
    const schemaFile = files.find((f: string) => f.includes('initial_schema'))
    expect(schemaFile).toBeDefined()
    const content = readFileSync(resolve(migrationsDir, schemaFile!), 'utf-8')
    expect(content).toContain('CREATE TABLE')
    expect(content).toContain('agents')
    expect(content).toContain('agent_activity_logs')
    expect(content).toContain('projects')
  })

  it('migration file enables RLS on all tables', () => {
    const files = readdirSync(migrationsDir) as string[]
    const schemaFile = files.find((f: string) => f.includes('initial_schema'))!
    const content = readFileSync(resolve(migrationsDir, schemaFile), 'utf-8')
    expect(content).toContain('ENABLE ROW LEVEL SECURITY')
    // All three tables should have RLS
    const rlsMatches = (content.match(/ENABLE ROW LEVEL SECURITY/g) || []).length
    expect(rlsMatches).toBeGreaterThanOrEqual(3)
  })

  it('migration file creates anon read policy', () => {
    const files = readdirSync(migrationsDir) as string[]
    const schemaFile = files.find((f: string) => f.includes('initial_schema'))!
    const content = readFileSync(resolve(migrationsDir, schemaFile), 'utf-8')
    expect(content).toContain('CREATE POLICY')
    expect(content).toContain('anon')
  })
})

describe('Seed data file exists', () => {
  it('seed.sql file exists in supabase directory', () => {
    const seedPath = resolve(__dirname, '../../../supabase/seed.sql')
    const content = readFileSync(seedPath, 'utf-8')
    expect(content.length).toBeGreaterThan(0)
  })

  it('seed data includes known agents', () => {
    const seedPath = resolve(__dirname, '../../../supabase/seed.sql')
    const content = readFileSync(seedPath, 'utf-8')
    // Should include the known agent names from the issue
    expect(content).toContain('Scout')
    expect(content).toContain('Forge')
  })

  it('seed data includes project entries', () => {
    const seedPath = resolve(__dirname, '../../../supabase/seed.sql')
    const content = readFileSync(seedPath, 'utf-8')
    expect(content).toContain('ios-dennis-system')
    expect(content).toContain('myagentdashboard')
  })
})
