'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getProjectSummary, sortProjects, filterProjects } from '@/lib/project-utils'
import { ProjectCard } from './project-card'
import type { Project, SortKey } from '@/types/project'

interface ProjectGridProps {
  projects: Project[]
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'status', label: 'Status' },
  { value: 'name', label: 'Name' },
  { value: 'most-issues', label: 'Most Issues' },
  { value: 'most-critical', label: 'Most Critical' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [stackFilter, setStackFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('status')

  const summary = getProjectSummary(projects)
  const filtered = filterProjects(projects, statusFilter, stackFilter)
  const sorted = sortProjects(filtered, sortKey)

  const uniqueStacks = Array.from(new Set(projects.map((p) => p.stack))).sort()

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {summary.total} total · {summary.active} active · {summary.inactive} inactive
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {summary.totalOpenIssues > 0 && (
            <span className="text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">{summary.totalOpenIssues}</span> open issues
            </span>
          )}
          {summary.totalP0 > 0 && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              P0: {summary.totalP0}
            </span>
          )}
        </div>
      </div>

      {/* Filter + Sort controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter buttons */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
          <span>Sort</span>
          <select
            aria-label="Sort by"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Stack filter */}
      {uniqueStacks.length > 1 && (
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Stack</span>
          <select
            aria-label="Filter by stack"
            value={stackFilter}
            onChange={(e) => setStackFilter(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All</option>
            {uniqueStacks.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No projects found.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
