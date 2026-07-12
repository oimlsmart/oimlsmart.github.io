import {
  useApplication,
  useModelFamily,
  useModelGroup,
  useMeasuringInstrument,
  useInstrumentSample,
  useTestRequest,
  useOrganization,
  useEvaluationReport,
} from './entity-composables'
import { STANDARDS } from '../data/standards'

const SEED_KEY = 'oiml-sample-seeded-v1'

export function useSampleData() {
  const isSeeded = () => localStorage.getItem(SEED_KEY) === 'true'
  const markSeeded = () => localStorage.setItem(SEED_KEY, 'true')

  async function seedIfNeeded(): Promise<void> {
    if (isSeeded()) return
    await seed()
    markSeeded()
  }

  async function reseed(): Promise<void> {
    localStorage.removeItem(SEED_KEY)
    await seed()
    markSeeded()
  }

  return { isSeeded, seedIfNeeded, reseed }
}

async function seed(): Promise<void> {
  const std = STANDARDS[0]
  const now = new Date().toISOString()

  const orgApi = useOrganization()
  await orgApi.create({
    id: 'sample-ia',
    name: 'OIML Issuing Authority (demo)',
    kind: 'issuing-authority',
    standardId: std.id,
    created: now, modified: now,
  })
  await orgApi.create({
    id: 'sample-lab-a',
    name: 'Precision Metrology Lab A (demo)',
    kind: 'test-laboratory',
    standardId: std.id,
    capabilities: ['class-c', 'class-b', 'humidity-ch', 'temperature-mdlo', 'creep-dr'],
    created: now, modified: now,
  })

  const familyApi = useModelFamily()
  await familyApi.create({
    id: 'sample-family',
    familyName: 'ACME LC Series (demo)',
    familyCode: 'ACME-LC',
    technology: 'analogue-passive',
    standardId: std.id,
    description: 'Demo family for the OIML SMART pilot.',
    created: now, modified: now,
  })

  const groupApi = useModelGroup()
  const groups = [
    { id: 'sample-group-c6', groupLabel: 'C6', accuracyClass: 'C', n_LC: 6000, Y: 18000, Z: 6000 },
    { id: 'sample-group-c3', groupLabel: 'C3', accuracyClass: 'C', n_LC: 3000, Y: 12000, Z: 4000 },
    { id: 'sample-group-b10', groupLabel: 'B10', accuracyClass: 'B', n_LC: 10000, Y: 25000, Z: 10000 },
  ]
  for (const g of groups) {
    await groupApi.create({
      ...g, familyId: 'sample-family', standardId: std.id,
      created: now, modified: now,
    })
  }

  const modelApi = useMeasuringInstrument()
  const models = [
    { id: 'sample-model-c6-50', model: 'ACME-C6-50', emax: 50, accuracyClass: 'C', modelGroupId: 'sample-group-c6', modelFamilyId: 'sample-family' },
    { id: 'sample-model-c6-300', model: 'ACME-C6-300', emax: 300, accuracyClass: 'C', modelGroupId: 'sample-group-c6', modelFamilyId: 'sample-family' },
    { id: 'sample-model-c3-100', model: 'ACME-C3-100', emax: 100, accuracyClass: 'C', modelGroupId: 'sample-group-c3', modelFamilyId: 'sample-family' },
    { id: 'sample-model-c3-500', model: 'ACME-C3-500', emax: 500, accuracyClass: 'C', modelGroupId: 'sample-group-c3', modelFamilyId: 'sample-family' },
    { id: 'sample-model-b10-1000', model: 'ACME-B10-1000', emax: 1000, accuracyClass: 'B', modelGroupId: 'sample-group-b10', modelFamilyId: 'sample-family' },
  ]
  for (const m of models) {
    await modelApi.create({
      ...m, standardId: std.id, manufacturerId: 'sample-mfg',
      created: now, modified: now,
    })
  }

  const sampleApi = useInstrumentSample()
  await sampleApi.create({
    id: 'sample-s1', modelId: 'sample-model-c6-50', familyId: 'sample-family',
    serialNumber: 'LC-SN-001', status: 'available', standardId: std.id,
    created: now, modified: now,
  })
  await sampleApi.create({
    id: 'sample-s2', modelId: 'sample-model-c3-100', familyId: 'sample-family',
    serialNumber: 'LC-SN-002', status: 'available', standardId: std.id,
    created: now, modified: now,
  })

  const appApi = useApplication()
  await appApi.create({
    id: 'sample-app-1',
    applicationNumber: 'APP-2026-001',
    status: 'ACCEPTED',
    standardId: std.id,
    modelFamilyId: 'sample-family',
    dateOfApplication: now.slice(0, 10),
    created: now, modified: now,
  })

  const trApi = useTestRequest()
  await trApi.create({
    id: 'sample-tr-1',
    requestNumber: 'TR-2026-001',
    standardId: std.id,
    applicationId: 'sample-app-1',
    assignedLaboratoryId: 'sample-lab-a',
    requestingAuthorityId: 'sample-ia',
    status: 'ISSUED',
    scheme: 'B',
    testConditions: { ambient: '20°C ± 2°C' },
    issuedBy: 'ia-staff',
    issuedDate: now.slice(0, 10),
    created: now, modified: now,
  })

  const erApi = useEvaluationReport()
  await erApi.create({
    id: 'sample-eval-1',
    reportNumber: 'EVAL-2026-001',
    standardId: std.id,
    applicationId: 'sample-app-1',
    authorityId: 'sample-ia',
    testReportIds: [],
    overallDecision: 'PENDING',
    status: 'UNDER_REVIEW',
    reviewNotes: '',
    reviewerName: '',
    conditions: [],
    synopsis: { fulfilsAllRequirements: false },
    summary: [],
    examinationFormInstances: [],
    reportFormInstances: [],
    formDeterminations: [],
    created: now, modified: now,
  })
}
