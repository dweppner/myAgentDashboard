'use client'

import { useState } from 'react'
import { aggregateTokensByDay, estimateTokenCost, formatCost, type DailyTokens } from '@/lib/token-utils'
import type { Database } from '@/lib/database.types'

type ActivityLog = Database['public']['Tables']['agent_activity_logs']['Row']

type Period = '7d' | '30d'

interface TokenUsageChartProps {
  /** Pre-aggregated 7-day data */
  data7d: DailyTokens[]
  /** Pre-aggregated 30-day data */
  data30d: DailyTokens[]
  costPerMillion?: number
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}k`
  return String(n)
}

function BarChart({ data }: { data: DailyTokens[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1)
  const chartHeight = 80
  const barWidth = 8
  const gap = 4
  const totalWidth = data.length * (barWidth + gap) - gap

  return (
    <svg
      width={totalWidth}
      height={chartHeight}
      viewBox={`0 0 ${totalWidth} ${chartHeight}`}
      aria-hidden="true"
      className="w-full"
      style={{ maxWidth: totalWidth }}
    >
      {data.map((d, i) => {
        const barHeight = Math.max((d.total / maxTotal) * chartHeight, d.total > 0 ? 2 : 0)
        const inputHeight = d.total > 0
          ? Math.round((d.tokens_input / d.total) * barHeight)
          : 0
        const outputHeight = barHeight - inputHeight
        const x = i * (barWidth + gap)

        return (
          <g key={d.date}>
            {/* output tokens (top portion) */}
            {outputHeight > 0 && (
              <rect
                x={x}
                y={chartHeight - barHeight}
                width={barWidth}
                height={outputHeight}
                className="fill-primary/40"
                rx={1}
              />
            )}
            {/* input tokens (bottom portion) */}
            {inputHeight > 0 && (
              <rect
                x={x}
                y={chartHeight - inputHeight}
                width={barWidth}
                height={inputHeight}
                className="fill-primary"
                rx={1}
              />
            )}
            {/* empty state bar */}
            {d.total === 0 && (
              <rect
                x={x}
                y={chartHeight - 2}
                width={barWidth}
                height={2}
                className="fill-muted"
                rx={1}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function TokenUsageChart({ data7d, data30d, costPerMillion = 3 }: TokenUsageChartProps) {
  const [period, setPeriod] = useState<Period>('7d')

  const data = period === '7d' ? data7d : data30d
  const totalTokens = data.reduce((sum, d) => sum + d.total, 0)
  const cost = estimateTokenCost(totalTokens, costPerMillion)

  return (
    <figure className="space-y-3" aria-label="Token usage chart">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold tabular-nums text-foreground">
            {formatTokens(totalTokens)}
          </p>
          <p className="text-xs text-muted-foreground">{formatCost(cost)} est.</p>
        </div>

        <div className="flex gap-1" role="group" aria-label="Period selector">
          {(['7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={[
                'px-2 py-1 text-xs rounded font-medium transition-colors',
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden">
        <BarChart data={data} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-primary" />
          Input
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-primary/40" />
          Output
        </span>
      </div>
    </figure>
  )
}

/** Server-side helper to pre-aggregate logs for the chart props */
export function buildTokenChartProps(logs: ActivityLog[], costPerMillion = 3) {
  return {
    data7d: aggregateTokensByDay(logs, 7),
    data30d: aggregateTokensByDay(logs, 30),
    costPerMillion,
  }
}
