import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TokenSummary } from '../token-summary'

describe('TokenSummary', () => {
  it('renders without crashing', () => {
    render(
      <TokenSummary totalTokensToday={0} topConsumerName={null} topConsumerTokens={0} />
    )
    expect(screen.getByText(/tokens today/i)).toBeInTheDocument()
  })

  it('displays formatted total tokens today', () => {
    render(
      <TokenSummary totalTokensToday={12345} topConsumerName="Forge" topConsumerTokens={10000} />
    )
    expect(screen.getByText(/12\.3k/i)).toBeInTheDocument()
  })

  it('displays top consumer name when provided', () => {
    render(
      <TokenSummary totalTokensToday={5000} topConsumerName="Scout" topConsumerTokens={4000} />
    )
    expect(screen.getByText(/Scout/)).toBeInTheDocument()
  })

  it('shows a dash or fallback when no top consumer', () => {
    render(
      <TokenSummary totalTokensToday={0} topConsumerName={null} topConsumerTokens={0} />
    )
    expect(screen.getByText(/—|none|no agent/i)).toBeInTheDocument()
  })

  it('displays zero tokens as 0', () => {
    render(
      <TokenSummary totalTokensToday={0} topConsumerName={null} topConsumerTokens={0} />
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('formats large numbers with M suffix', () => {
    render(
      <TokenSummary
        totalTokensToday={2_500_000}
        topConsumerName="Forge"
        topConsumerTokens={1_000_000}
      />
    )
    expect(screen.getByText(/2\.5M/i)).toBeInTheDocument()
  })
})
