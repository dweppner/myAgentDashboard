interface TokenSummaryProps {
  totalTokensToday: number
  topConsumerName: string | null
  topConsumerTokens: number
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}k`
  return String(n)
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

export function TokenSummary({ totalTokensToday, topConsumerName, topConsumerTokens }: TokenSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatItem
        label="Tokens Today"
        value={formatTokens(totalTokensToday)}
      />
      <div className="rounded-lg border border-border bg-card p-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Top Consumer</p>
        <p className="text-xl font-bold tabular-nums text-foreground truncate">
          {topConsumerName ?? '—'}
        </p>
        {topConsumerName && (
          <p className="text-xs text-muted-foreground">
            {formatTokens(topConsumerTokens)} tokens
          </p>
        )}
      </div>
    </div>
  )
}
