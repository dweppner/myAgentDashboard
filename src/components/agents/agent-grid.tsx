'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAgentStatusSummary } from '@/lib/agent-utils'
import { AgentCard } from './agent-card'
import type { Agent } from '@/types/agent'

interface AgentGridProps {
  initialAgents: Agent[]
}

export function AgentGrid({ initialAgents }: AgentGridProps) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('agents-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setAgents((prev) =>
              prev.map((a) =>
                a.id === (payload.new as Agent).id ? (payload.new as Agent) : a
              )
            )
          } else if (payload.eventType === 'INSERT') {
            setAgents((prev) => [...prev, payload.new as Agent])
          } else if (payload.eventType === 'DELETE') {
            setAgents((prev) => prev.filter((a) => a.id !== (payload.old as Agent).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const summary = getAgentStatusSummary(agents)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {summary.total} total
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <StatusPill color="green" label="Active" count={summary.active} />
          <StatusPill color="yellow" label="Idle" count={summary.idle} />
          <StatusPill color="gray" label="Offline" count={summary.offline} />
        </div>
      </div>

      {/* Grid */}
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No agents found.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Agents will appear here once they are registered.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatusPill({
  color,
  label,
  count,
}: {
  color: 'green' | 'yellow' | 'gray'
  label: string
  count: number
}) {
  const dotClass =
    color === 'green'
      ? 'bg-green-500'
      : color === 'yellow'
        ? 'bg-yellow-500'
        : 'bg-gray-400'

  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`inline-block size-2 rounded-full ${dotClass}`} aria-hidden="true" />
      <span className="font-medium tabular-nums">{count}</span>
      <span>{label}</span>
    </span>
  )
}
