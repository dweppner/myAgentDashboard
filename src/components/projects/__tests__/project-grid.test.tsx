import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectGrid } from '../project-grid'
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

const projects: Project[] = [
  makeProject({ id: '1', name: 'Alpha', status: 'active', stack: 'nextjs', open_issues_count: 3, p0_count: 1 }),
  makeProject({ id: '2', name: 'Beta', status: 'inactive', stack: 'ios', open_issues_count: 0, p0_count: 0 }),
  makeProject({ id: '3', name: 'Gamma', status: 'active', stack: 'ios', open_issues_count: 5, p0_count: 2 }),
]

describe('ProjectGrid', () => {
  it('renders all projects by default', () => {
    render(<ProjectGrid projects={projects} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('renders summary bar with total count', () => {
    render(<ProjectGrid projects={projects} />)
    expect(screen.getByText(/3 total/)).toBeInTheDocument()
  })

  it('shows P0 alert in summary when P0 issues exist', () => {
    render(<ProjectGrid projects={projects} />)
    expect(screen.getAllByText(/p0/i).length).toBeGreaterThan(0)
  })

  it('renders empty state when no projects', () => {
    render(<ProjectGrid projects={[]} />)
    expect(screen.getByText(/no projects/i)).toBeInTheDocument()
  })

  it('filters by active status', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid projects={projects} />)
    const activeFilter = screen.getByRole('button', { name: 'Active' })
    await user.click(activeFilter)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('filters by inactive status', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid projects={projects} />)
    const inactiveFilter = screen.getByRole('button', { name: /inactive/i })
    await user.click(inactiveFilter)
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  it('sorts by name', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid projects={projects} />)
    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    await user.selectOptions(sortSelect, 'name')
    const cards = screen.getAllByRole('heading', { level: 3 })
    expect(cards[0].textContent).toBe('Alpha')
    expect(cards[1].textContent).toBe('Beta')
    expect(cards[2].textContent).toBe('Gamma')
  })
})
