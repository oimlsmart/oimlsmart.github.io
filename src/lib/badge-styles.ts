export function overallDecisionBadgeClass(d: string | undefined): string {
  if (d === 'APPROVED') return 'bg-[#10b981] text-white'
  if (d === 'REJECTED') return 'bg-[#ef4444] text-white'
  if (d === 'CONDITIONALLY_APPROVED') return 'bg-[#f59e0b] text-white'
  return 'bg-rule text-ink-soft'
}

export function modelDecisionBadgeClass(d: string | undefined): string {
  if (d === 'PASS') return 'bg-[#dcfce7] text-[#166534]'
  if (d === 'FAIL') return 'bg-[#fee2e2] text-[#991b1b]'
  if (d === 'INCOMPLETE') return 'bg-[#fef3c7] text-[#92400e]'
  return 'bg-paper-raised text-ink-soft'
}

export function applicationStatusBadgeClass(status: string): string {
  if (status === 'ACCEPTED') return 'bg-[#dcfce7] text-[#166534]'
  if (status === 'SUBMITTED') return 'bg-[#fef3c7] text-[#92400e]'
  return 'bg-paper-raised text-ink-soft'
}

export function testRequestStatusBadgeClass(status: string): string {
  if (status === 'ISSUED') return 'bg-[#fef3c7] text-[#92400e]'
  if (status === 'COMPLETED') return 'bg-[#dcfce7] text-[#166534]'
  return 'bg-paper-soft text-ink-soft'
}
