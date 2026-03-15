import { LayoutDashboard, FolderKanban, Activity } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/activity', label: 'Activity', icon: Activity },
]

/**
 * Returns true if the nav item should be highlighted as active.
 * The root `/` route only matches exactly. Other routes use prefix matching.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }
  return pathname === href || pathname.startsWith(href + '/')
}
