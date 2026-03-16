import { describe, it, expect } from 'vitest'
import {
  getProjectStatusColor,
  getStackLabel,
  getPriorityBadgeColor,
  getProjectSummary,
  sortProjects,
  filterProjects,
} from '@/lib/project-utils'
import type { Project } from '@/types/project'

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'uuid-1',
  project_id: 'test-project',
  name: 'Test Project',
  repo: 'owner/test-project',
  stack: 'nextjs',
  status: 'active',
  hosting: 'vercel',
  production_url: null,
  staging_url: null,
  slack_channel_id: 'C12345',
  open_issues_count: 0,
  p0_count: 0,
  p1_count: 0,
  p2_count: 0,
  p3_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('getProjectStatusColor', () => {
  it('returns green classes for active status', () => {
    const result = getProjectStatusColor('active')
    expect(result).toContain('green')
  })

  it('returns gray classes for inactive status', () => {
    const result = getProjectStatusColor('inactive')
    expect(result).toContain('gray')
  })

  it('returns gray classes for unknown status', () => {
    const result = getProjectStatusColor('unknown')
    expect(result).toContain('gray')
  })
})

describe('getStackLabel', () => {
  it('returns Next.js for nextjs', () => {
    expect(getStackLabel('nextjs')).toBe('Next.js')
  })

  it('returns iOS for ios', () => {
    expect(getStackLabel('ios')).toBe('iOS')
  })

  it('returns React for react', () => {
    expect(getStackLabel('react')).toBe('React')
  })

  it('returns React Native for react-native', () => {
    expect(getStackLabel('react-native')).toBe('React Native')
  })

  it('capitalizes unknown stack names', () => {
    expect(getStackLabel('golang')).toBe('Golang')
  })

  it('returns Unknown for empty stack', () => {
    expect(getStackLabel('')).toBe('Unknown')
  })
})

describe('getPriorityBadgeColor', () => {
  it('returns red for p0', () => {
    const result = getPriorityBadgeColor('p0')
    expect(result).toContain('red')
  })

  it('returns orange for p1', () => {
    const result = getPriorityBadgeColor('p1')
    expect(result).toContain('orange')
  })

  it('returns yellow for p2', () => {
    const result = getPriorityBadgeColor('p2')
    expect(result).toContain('yellow')
  })

  it('returns blue for p3', () => {
    const result = getPriorityBadgeColor('p3')
    expect(result).toContain('blue')
  })
})

describe('getProjectSummary', () => {
  it('counts active and inactive projects', () => {
    const projects = [
      makeProject({ status: 'active' }),
      makeProject({ status: 'active', id: 'uuid-2' }),
      makeProject({ status: 'inactive', id: 'uuid-3' }),
    ]
    const summary = getProjectSummary(projects)
    expect(summary.total).toBe(3)
    expect(summary.active).toBe(2)
    expect(summary.inactive).toBe(1)
  })

  it('sums total open issues across all projects', () => {
    const projects = [
      makeProject({ open_issues_count: 5 }),
      makeProject({ open_issues_count: 3, id: 'uuid-2' }),
    ]
    const summary = getProjectSummary(projects)
    expect(summary.totalOpenIssues).toBe(8)
  })

  it('sums P0 count across all projects', () => {
    const projects = [
      makeProject({ p0_count: 2 }),
      makeProject({ p0_count: 1, id: 'uuid-2' }),
    ]
    const summary = getProjectSummary(projects)
    expect(summary.totalP0).toBe(3)
  })

  it('returns zero counts for empty array', () => {
    const summary = getProjectSummary([])
    expect(summary.total).toBe(0)
    expect(summary.active).toBe(0)
    expect(summary.inactive).toBe(0)
    expect(summary.totalOpenIssues).toBe(0)
    expect(summary.totalP0).toBe(0)
  })
})

describe('sortProjects', () => {
  const active = makeProject({ id: '1', name: 'Banana', status: 'active', open_issues_count: 3, p0_count: 1, updated_at: '2026-01-02T00:00:00Z' })
  const inactive = makeProject({ id: '2', name: 'Apple', status: 'inactive', open_issues_count: 10, p0_count: 0, updated_at: '2026-01-01T00:00:00Z' })
  const active2 = makeProject({ id: '3', name: 'Cherry', status: 'active', open_issues_count: 1, p0_count: 2, updated_at: '2026-01-03T00:00:00Z' })

  it('sorts by name ascending', () => {
    const result = sortProjects([active, inactive, active2], 'name')
    expect(result[0].name).toBe('Apple')
    expect(result[1].name).toBe('Banana')
    expect(result[2].name).toBe('Cherry')
  })

  it('sorts by status (active first)', () => {
    const result = sortProjects([inactive, active, active2], 'status')
    expect(result[0].status).toBe('active')
    expect(result[2].status).toBe('inactive')
  })

  it('sorts by most issues descending', () => {
    const result = sortProjects([active, inactive, active2], 'most-issues')
    expect(result[0].open_issues_count).toBe(10)
    expect(result[2].open_issues_count).toBe(1)
  })

  it('sorts by most critical (p0) descending', () => {
    const result = sortProjects([active, inactive, active2], 'most-critical')
    expect(result[0].p0_count).toBe(2)
    expect(result[1].p0_count).toBe(1)
    expect(result[2].p0_count).toBe(0)
  })

  it('does not mutate the original array', () => {
    const input = [active, inactive, active2]
    const original = [...input]
    sortProjects(input, 'name')
    expect(input[0].id).toBe(original[0].id)
  })
})

describe('filterProjects', () => {
  const active = makeProject({ id: '1', status: 'active', stack: 'nextjs' })
  const inactive = makeProject({ id: '2', status: 'inactive', stack: 'ios' })
  const active2 = makeProject({ id: '3', status: 'active', stack: 'ios' })

  it('filters by status active', () => {
    const result = filterProjects([active, inactive, active2], 'active', 'all')
    expect(result).toHaveLength(2)
    expect(result.every((p) => p.status === 'active')).toBe(true)
  })

  it('filters by status inactive', () => {
    const result = filterProjects([active, inactive, active2], 'inactive', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('inactive')
  })

  it('filters by stack', () => {
    const result = filterProjects([active, inactive, active2], 'all', 'ios')
    expect(result).toHaveLength(2)
    expect(result.every((p) => p.stack === 'ios')).toBe(true)
  })

  it('combines status and stack filters', () => {
    const result = filterProjects([active, inactive, active2], 'active', 'ios')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('returns all when both filters are all', () => {
    const result = filterProjects([active, inactive, active2], 'all', 'all')
    expect(result).toHaveLength(3)
  })
})
