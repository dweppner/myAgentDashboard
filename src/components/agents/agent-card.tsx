'use client'

import { cn } from '@/lib/utils'
import { getStatusColor, getStatusDotColor, getStatusLabel, truncateTask } from '@/lib/agent-utils'
import type { Agent } from '@/types/agent'

const TYPE_LABELS: Record<string, string> = {
  openclaw: 'OpenClaw',
  'claude-code': 'Claude Code',
}

const TASK_MAX_LENGTH = 60

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusColor = getStatusColor(agent.status)
  const dotColor = getStatusDotColor(agent.status)
  const statusLabel = getStatusLabel(agent.status)
  const taskDisplay = truncateTask(agent.current_task, TASK_MAX_LENGTH)
  const typeLabel = TYPE_LABELS[agent.type] ?? agent.type
  const lastActive = new Date(agent.updated_at).toLocaleString()

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
      {/* Header: avatar + name + type badge */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {agent.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.avatar_url} alt={agent.name} className="size-10 object-cover" />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground select-none">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{agent.name}</p>
          <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
        </div>
        <span
          className={cn(
            'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            'bg-secondary text-secondary-foreground'
          )}
        >
          {typeLabel}
        </span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={cn('inline-block size-2 rounded-full flex-shrink-0', dotColor)}
          aria-hidden="true"
        />
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            statusColor
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Current task */}
      <div className="min-h-[2rem]">
        {taskDisplay ? (
          <p
            className="text-xs text-muted-foreground leading-relaxed"
            title={agent.current_task ?? undefined}
          >
            <span className="font-medium text-foreground">Working on: </span>
            {taskDisplay}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">No active task</p>
        )}
      </div>

      {/* Last active */}
      <p className="text-xs text-muted-foreground/50 mt-auto">
        Last active: {lastActive}
      </p>
    </div>
  )
}
