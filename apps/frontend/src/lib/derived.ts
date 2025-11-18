export function monthsBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso)
  const b = new Date(toIso)
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

export function yearsBetween(fromIso: string, toIso: string): number {
  const m = monthsBetween(fromIso, toIso)
  return Math.max(0, Math.floor(m / 12))
}

export function computePermitSeniorityMonths(permitDateIso?: string, nowIso: string = new Date().toISOString()): number {
  if (!permitDateIso) return 0
  return Math.max(0, monthsBetween(permitDateIso, nowIso))
}

export function computeVehicleAgeYears(firstRegistrationIso?: string, nowIso: string = new Date().toISOString()): number {
  if (!firstRegistrationIso) return 0
  return Math.max(0, yearsBetween(firstRegistrationIso, nowIso))
}

export function computeClaimsRecencyMonths(claimDatesIso: string[], nowIso: string = new Date().toISOString()): number[] {
  return claimDatesIso.map((d) => Math.max(0, monthsBetween(d, nowIso)))
}

