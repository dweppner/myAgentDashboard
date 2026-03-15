import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  getStatusColor,
  getStatusDotColor,
  getStatusLabel,
  getTypeLabel,
} from '@/lib/agent-utils'
import type { Agent } from '@/types/agent'

interface AgentProfileHeaderProps {
  agent: Agent
  prevAgent: Agent | null
  nextAgent: Agent | null
}

export function AgentProfileHeader({ agent, prevAgent, nextAgent }: AgentProfileHeaderProps) {
  const statusColor = getStatusColor(agent.status)
  const dotColor = getStatusDotColor(agent.status)
  const statusLabel = getStatusLabel(agent.status)
  const typeLabel = getTypeLabel(agent.type)

  return (
    <div className="space-y-6">
      {/* Navigation row */}
      <nav className="flex items-center justify-between flex-wrap gap-2" aria-label="Agent navigation">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to dashboard"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          {prevAgent && (
            <Link
              href={`/agents/${prevAgent.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Prev agent: ${prevAgent.name}`}
            >
              ← {prevAgent.name}
            </Link>
          )}
          {nextAgent && (
            <Link
              href={`/agents/${nextAgent.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Next agent: ${nextAgent.name}`}
            >
              {nextAgent.name} →
            </Link>
          )}
        </div>
      </nav>

      {/* Profile header card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {/* Avatar + name + badges */}
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-shrink-0 size-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {agent.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.avatar_url}
                alt={agent.name}
                className="size-16 object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground select-none">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {typeLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{agent.role}</p>
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
          </div>
        </div>

        {/* About section */}
        <div className="space-y-4 pt-2 border-t border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
          </div>

          {agent.systems.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Systems</h2>
              <div className="flex flex-wrap gap-2">
                {agent.systems.map((system) => (
                  <span
                    key={system}
                    className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium border border-border bg-muted text-muted-foreground"
                  >
                    {system}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">How to interact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{agent.interaction_guide}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
