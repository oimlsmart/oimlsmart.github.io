export function formatEmax(emax: number | undefined): string {
  if (!emax) return '—'
  return emax >= 1000 ? `${emax / 1000} t` : `${emax} kg`
}
