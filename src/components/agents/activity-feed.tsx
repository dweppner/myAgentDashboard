'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatEventType, getEventTypeBadgeColor } from '@/lib/activity-utils'
import type { ActivityLog } from '@/lib/activity-utils'

const PAGE_SIZE = 20

const EVENT_TYPE_OPTIONS = [
  'all',
  'task_started',
  'task_completed',
  'pr_created',
  'issue_opened',
  'deployment',
]

interface ActivityFeedProps {
  logs: ActivityLog[]
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [page, setPage] = useState(1)

  const filtered =
    filterType === 'all' ? logs : logs.filter((l) => l.event_type === filterType)

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  function handleFilterChange(type: string) {
    setFilterType(type)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by event type">
        {EVENT_TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            aria-pressed={filterType === type}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filterType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {type === 'all' ? 'All' : formatEventType(type)}
          </button>
        ))}
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
