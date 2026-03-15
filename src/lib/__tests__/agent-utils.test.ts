import { describe, it, expect } from 'vitest'
import {
  getStatusColor,
  getStatusDotColor,
  getStatusLabel,
  truncateTask,
  getAgentStatusSummary,
} from '../agent-utils'
import type { Agent } from '@/types/agent'

describe('getStatusColor', () => {
  it('returns green classes for active', () => {
    const color = getStatusColor('active')
    expect(color).toContain('green')
  })

  it('returns yellow classes for idle', () => {
    const color = getStatusColor('idle')
    expect(color).toContain('yellow')
  })

  it('returns gray classes for offline', () => {
    const color = getStatusColor('offline')
    expect(color).toContain('gray')
  })

  it('returns gray classes for unknown status', () => {
    const color = getStatusColor('anything-else')
    expect(color).toContain('gray')
  })
})

describe('getStatusDotColor', () => {
  it('returns green for active', () => {
    expect(getStatusDotColor('active')).toContain('green')
  })

  it('returns yellow for idle', () => {
    expect(getStatusDotColor('idle')).toContain('yellow')
  })

  it('returns gray for offline', () => {
    expect(getStatusDotColor('offline')).toContain('gray')
  })
})

describe('getStatusLabel', () => {
  it('returns Active for active', () => {
    expect(getStatusLabel('active')).toBe('Active')
  })

  it('returns Idle for idle', () => {
    expect(getStatusLabel('idle')).toBe('Idle')
  })

  it('returns Offline for offline', () => {
    expect(getStatusLabel('offline')).toBe('Offline')
  })

  it('returns capitalized label for unknown status', () => {
    expect(getStatusLabel('busy')).toBe('Busy')
  })
})

describe('truncateTask', () => {
  it('returns task as-is when within max length', () => {
    expect(truncateTask('short task', 50)).toBe('short task')
  })

  it('truncates and appends ellipsis when over max length', () => {
    const longTask = 'a'.repeat(100)
    const result = truncateTask(longTask, 50)
    expect(result).toBe('a'.repeat(50) + '...')
  })

  it('returns empty string for null task', () => {
    expect(truncateTask(null, 50)).toBe('')
  })

  it('returns empty string for undefined task', () => {
    expect(truncateTask(undefined, 50)).toBe('')
  })

  it('does not truncate at exactly max length', () => {
    const exactTask = 'a'.repeat(50)
    expect(truncateTask(exactTask, 50)).toBe(exactTask)
  })
})

describe('getAgentStatusSummary', () => {
  const makeAgent = (status: string): Agent =>
    ({
      id: '1',
      name: 'Test',
      type: 'openclaw',
      role: 'tester',
      description: '',
      systems: [],
      interaction_guide: '',
      avatar_url: null,
      status,
      current_task: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) as Agent

  it('counts agents by status correctly', () => {
    const agents = [
      makeAgent('active'),
      makeAgent('active'),
      makeAgent('idle'),
      makeAgent('offline'),
    ]
    const summary = getAgentStatusSummary(agents)
    expect(summary.active).toBe(2)
    expect(summary.idle).toBe(1)
    expect(summary.offline).toBe(1)
    expect(summary.total).toBe(4)
  })

  it('returns zeros for empty agent list', () => {
    const summary = getAgentStatusSummary([])
    expect(summary.active).toBe(0)
    expect(summary.idle).toBe(0)
    expect(summary.offline).toBe(0)
    expect(summary.total).toBe(0)
  })

  it('handles agents with unknown statuses in total count', () => {
    const agents = [makeAgent('active'), makeAgent('busy')]
    const summary = getAgentStatusSummary(agents)
    expect(summary.total).toBe(2)
    expect(summary.active).toBe(1)
  })
})
