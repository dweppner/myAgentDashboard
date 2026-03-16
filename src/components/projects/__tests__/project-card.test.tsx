import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '../project-card'
import type { Project } from '@/types/project'

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'uuid-1',
  project_id: 'test-project',
  name: 'Test Project',
  repo: 'owner/test-project',
  stack: 'nextjs',
  status: 'active',
  hosting: 'vercel',
  production_url: 'https://test.vercel.app',
  staging_url: 'https://staging.test.vercel.app',
  slack_channel_id: 'C12345',
  open_issues_count: 5,
  p0_count: 1,
  p1_count: 2,
  p2_count: 1,
  p3_count: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-15T12:00:00Z',
  ...overrides,
})

describe('ProjectCard', () => {
  it('renders project name', () => {
    render(<ProjectCard project={makeProject()} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('renders stack badge', () => {
    render(<ProjectCard project={makeProject()} />)
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('renders active status badge', () => {
    render(<ProjectCard project={makeProject({ status: 'active' })} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders inactive status badge', () => {
    render(<ProjectCard project={makeProject({ status: 'inactive' })} />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders open issue count', () => {
    render(<ProjectCard project={makeProject({ open_issues_count: 5 })} />)
    expect(screen.getByText(/5 open/i)).toBeInTheDocument()
  })

  it('renders P0 count when non-zero', () => {
    render(<ProjectCard project={makeProject({ p0_count: 2, p1_count: 0, p2_count: 0, p3_count: 0 })} />)
    expect(screen.getByText(/P0: 2/)).toBeInTheDocument()
  })

  it('renders repo link', () => {
    render(<ProjectCard project={makeProject()} />)
    const repoLink = screen.getByRole('link', { name: /owner\/test-project/i })
    expect(repoLink).toHaveAttribute('href', 'https://github.com/owner/test-project')
  })

  it('renders production URL link when present', () => {
    render(<ProjectCard project={makeProject({ production_url: 'https://prod.example.com' })} />)
    const link = screen.getByRole('link', { name: /production/i })
    expect(link).toHaveAttribute('href', 'https://prod.example.com')
  })

  it('does not render production link when null', () => {
    render(<ProjectCard project={makeProject({ production_url: null })} />)
    expect(screen.queryByRole('link', { name: /production/i })).not.toBeInTheDocument()
  })

  it('renders last updated timestamp', () => {
    render(<ProjectCard project={makeProject({ updated_at: '2026-03-15T12:00:00Z' })} />)
    expect(screen.getByText(/updated/i)).toBeInTheDocument()
  })
})
