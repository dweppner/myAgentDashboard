'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatEventType, getEventTypeBadgeColor } from '@/lib/activity-utils'
import type { GlobalActivityLog } from '@/lib/global-activity-utils'
import type { Agent } from '@/types/agent'

const PAGE_SIZE = 20
const REFRESH_INTERVAL_MS = 30_000

const EVENT_TYPE_OPTIONS = [
  'all',
  'task_started',
  'task_completed',
  'pr_created',
  'issue_opened',
  'deployment',
]

interface GlobalActivityFeedProps {
  initialLogs: GlobalActivityLog[]
  agents: Agent[]
}

export function GlobalActivityFeed({ initialLogs, agents }: GlobalActivityFeedProps) {
  const [logs, setLogs] = useState<GlobalActivityLog[]>(initialLogs)
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const applyFilters = useCallback(
    (source: GlobalActivityLog[]) => {
      return source.filter((log) => {
        if (filterAgent !== 'all' && log.agent_id !== filterAgent) return false
        if (filterType !== 'all' && log.event_type !== filterType) return false
        if (filterDateFrom) {
          const from = new Date(filterDateFrom)
          if (new Date(log.created_at) < from) return false
        }
        if (filterDateTo) {
          const to = new Date(filterDateTo)
          to.setHours(23, 59, 59, 999)
          if (new Date(log.created_at) > to) return false
        }
        return true
      })
    },
    [filterAgent, filterType, filterDateFrom, filterDateTo]
  )

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/activity')
        if (!res.ok) return
        const data: GlobalActivityLog[] = await res.json()
        setLogs(data)
      } catch {
        // silently ignore refresh errors
      }
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  function resetPage() {
    setPage(1)
  }

  const filtered = applyFilters(logs)
  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Event type filter */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by event type">
          {EVENT_TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type)
                resetPage()
              }}
              aria-pressed={filterType === type}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {type === 'all' ? 'All Events' : formatEventType(type)}
            </button>
          ))}
        </div>

        {/* Agent + date filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterAgent}
            onChange={(e) => {
              setFilterAgent(e.target.value)
              resetPage()
            }}
            aria-label="Filter by agent"
            className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="all">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="date-from">
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value)
                resetPage()
              }}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="date-to">
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value)
                resetPage()
              }}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Log entries */}
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No activity found.</p>
      ) : (
        <ol className="space-y-3">
          {visible.map((log) => (
            <li
              key={log.id}
              className="flex gap-3 rounded-lg border border-border bg-card p-3 text-sm"
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      getEventTypeBadgeColor(log.event_type)
                    )}
                  >
                    {formatEventType(log.event_type)}
                  </span>
                  {log.agents && (
                    <span className="text-xs font-medium text-foreground">
                      {log.agents.name}
                    </span>
                  )}
                  <time
                    dateTime={log.created_at}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(log.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="text-foreground">{log.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full rounded-md border border-border py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Load more ({filtered.length - visible.length} remaining)
        </button>
      )}
    </div>
  )
}
