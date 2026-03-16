import type { Project, ProjectSummary, SortKey } from '@/types/project'

const STACK_LABELS: Record<string, string> = {
  nextjs: 'Next.js',
  ios: 'iOS',
  react: 'React',
  'react-native': 'React Native',
}

export function getProjectStatusColor(status: string): string {
  if (status === 'active') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

export function getStackLabel(stack: string): string {
  if (!stack) return 'Unknown'
  return STACK_LABELS[stack] ?? stack.charAt(0).toUpperCase() + stack.slice(1)
}

export function getPriorityBadgeColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'p0':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'p1':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'p2':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'p3':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

export function getProjectSummary(projects: Project[]): ProjectSummary {
  const summary: ProjectSummary = {
    total: projects.length,
    active: 0,
    inactive: 0,
    totalOpenIssues: 0,
    totalP0: 0,
  }
  for (const project of projects) {
    if (project.status === 'active') summary.active++
    else summary.inactive++
    summary.totalOpenIssues += project.open_issues_count
    summary.totalP0 += project.p0_count
  }
  return summary
}

export function sortProjects(projects: Project[], key: SortKey): Project[] {
  const copy = [...projects]
  switch (key) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'status':
      return copy.sort((a, b) => {
        if (a.status === b.status) return 0
        return a.status === 'active' ? -1 : 1
      })
    case 'most-issues':
      return copy.sort((a, b) => b.open_issues_count - a.open_issues_count)
    case 'most-critical':
      return copy.sort((a, b) => b.p0_count - a.p0_count)
    default:
      return copy
  }
}

export function filterProjects(
  projects: Project[],
  statusFilter: string,
  stackFilter: string
): Project[] {
  return projects.filter((project) => {
    const statusMatch = statusFilter === 'all' || project.status === statusFilter
    const stackMatch = stackFilter === 'all' || project.stack === stackFilter
    return statusMatch && stackMatch
  })
}
