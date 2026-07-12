export interface Lab {
  capabilities?: string[]
  [key: string]: unknown
}

export function filterTestLaboratories<L extends Lab & { kind?: string }>(
  orgs: L[],
): L[] {
  return orgs.filter(o => o.kind === 'test-laboratory')
}
