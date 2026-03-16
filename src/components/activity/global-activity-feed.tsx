'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatEventType, getEventTypeBadgeColor } from '@/lib/activity-utils'
import {
  filterGlobalLogs,
  type GlobalActivityLog,
  type DateRangeFilter,
} from '@/lib/global-activity-utils'
import type { Agent } from '@/types/agent'

const PAGE_SIZE = 20

const EVENT_TYPE_OPTIONS = [
  'all',
  'task_started',
  'task_completed',
  'pr_created',
  'issue_opened',
  'deployment',
]

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

interface GlobalActivityFeedProps {
  initialLogs: GlobalActivityLog[]
  agents: Agent[]
}

export function GlobalActivityFeed({ initialLogs, agents }: GlobalActivityFeedProps) {
  const [agentFilter, setAgentFilter] = useState('all')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all')
  const [page, setPage] = useState(1)
  const router = useRouter()

  // Auto-refresh every 30 seconds to pick up new activity
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30_000)
    return () => clearInterval(interval)
  }, [router])

  const filtered = filterGlobalLogs(initialLogs, {
    agentId: agentFilter,
    eventType: eventTypeFilter,
    dateRange: dateRangeFilter,
  })

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  function handleAgentChange(agentId: string) {
    setAgentFilter(agentId)
    setPage(1)
  }

  function handleEventTypeChange(type: string) {
    setEventTypeFilter(type)
    setPage(1)
  }

  function handleDateRangeChange(range: DateRangeFilter) {
    setDateRangeFilter(range)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        {/* Agent filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="agent-filter" className="text-xs font-medium text-muted-foreground w-14 shrink-0">
            Agent
          </label>
          <select
            id="agent-filter"
            value={agentFilter}
            onChange={(e) => handleAgentChange(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="all">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event type filter */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 pt-1">Event</span>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by event type">
            {EVENT_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() => handleEventTypeChange(type)}
                aria-pressed={eventTypeFilter === type}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  eventTypeFilter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {type === 'all' ? 'All' : formatEventType(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Date range filter */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 pt-1">Period</span>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by date range">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDateRangeChange(opt.value)}
                aria-pressed={dateRangeFilter === opt.value}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  dateRangeFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
      </p>

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
                    <Link
                      href={`/agents/${log.agents.id}`}
                      className="text-xs font-medium text-foreground hover:underline"
                    >
                      {log.agents.name}
                    </Link>
                  )}
                  <time dateTime={log.created_at} className="text-xs text-muted-foreground">
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
