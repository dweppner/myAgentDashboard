import { describe, it, expect } from 'vitest'
import { NAV_ITEMS, isNavItemActive } from '../nav-items'

describe('NAV_ITEMS', () => {
  it('has exactly 3 nav items', () => {
    expect(NAV_ITEMS).toHaveLength(3)
  })

  it('includes Dashboard at root path', () => {
    const dashboard = NAV_ITEMS.find((item) => item.href === '/')
    expect(dashboard).toBeDefined()
    expect(dashboard?.label).toBe('Dashboard')
  })

  it('includes Projects at /projects', () => {
    const projects = NAV_ITEMS.find((item) => item.href === '/projects')
    expect(projects).toBeDefined()
    expect(projects?.label).toBe('Projects')
  })

  it('includes Activity at /activity', () => {
    const activity = NAV_ITEMS.find((item) => item.href === '/activity')
    expect(activity).toBeDefined()
    expect(activity?.label).toBe('Activity')
  })

  it('each item has required fields: href, label, icon', () => {
    for (const item of NAV_ITEMS) {
      expect(item.href).toBeTruthy()
      expect(item.label).toBeTruthy()
      expect(item.icon).toBeTruthy()
    }
  })
})

describe('isNavItemActive', () => {
  it('returns true for dashboard at root path', () => {
    expect(isNavItemActive('/', '/')).toBe(true)
  })

  it('returns false for dashboard when on /projects', () => {
    expect(isNavItemActive('/projects', '/')).toBe(false)
  })

  it('returns true for /projects when on /projects', () => {
    expect(isNavItemActive('/projects', '/projects')).toBe(true)
  })

  it('returns true for /projects when on /projects/123 (prefix match for non-root)', () => {
    expect(isNavItemActive('/projects/123', '/projects')).toBe(true)
  })

  it('returns false for /activity when on /projects', () => {
    expect(isNavItemActive('/projects', '/activity')).toBe(false)
  })

  it('returns true for /activity when on /activity', () => {
    expect(isNavItemActive('/activity', '/activity')).toBe(true)
  })

  it('does not match root / as active for /projects', () => {
    expect(isNavItemActive('/projects', '/')).toBe(false)
  })
})
