'use client'

import { cn } from '@/lib/utils'
import { getProjectStatusColor, getStackLabel, getPriorityBadgeColor } from '@/lib/project-utils'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColor = getProjectStatusColor(project.status)
  const stackLabel = getStackLabel(project.stack)
  const lastUpdated = new Date(project.updated_at).toLocaleString()

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
      {/* Header: name + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{project.name}</h3>
          <a
            href={`https://github.com/${project.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground truncate block mt-0.5"
          >
            {project.repo}
          </a>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              statusColor
            )}
          >
            {project.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
            {stackLabel}
          </span>
        </div>
      </div>

      {/* Issue breakdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">
          {project.open_issues_count} open
        </span>
        {project.p0_count > 0 && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              getPriorityBadgeColor('p0')
            )}
          >
            P0: {project.p0_count}
          </span>
        )}
        {project.p1_count > 0 && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              getPriorityBadgeColor('p1')
            )}
          >
            P1: {project.p1_count}
          </span>
        )}
        {project.p2_count > 0 && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              getPriorityBadgeColor('p2')
            )}
          >
            P2: {project.p2_count}
          </span>
        )}
        {project.p3_count > 0 && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              getPriorityBadgeColor('p3')
            )}
          >
            P3: {project.p3_count}
          </span>
        )}
      </div>

      {/* Hosting / URLs */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="capitalize">{project.hosting}</span>
        {project.production_url && (
          <a
            href={project.production_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Production ↗
          </a>
        )}
        {project.staging_url && (
          <a
            href={project.staging_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Staging ↗
          </a>
        )}
      </div>

      {/* Last updated */}
      <p className="text-xs text-muted-foreground/50 mt-auto">Updated: {lastUpdated}</p>
    </div>
  )
}
