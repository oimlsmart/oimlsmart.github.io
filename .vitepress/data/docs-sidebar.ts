export interface DocsPage {
  slug: string
  title: string
  shortTitle: string
  description: string
}

export interface DocsSection {
  key: string
  label: string
  description: string
  pages: DocsPage[]
}

export const sections: DocsSection[] = [
  {
    key: 'guides',
    label: 'Developer Guides',
    description:
      'Narrative, learn-by-doing walkthroughs for authoring a SMART Recommendation.',
    pages: [
      { slug: 'getting-started', title: 'Getting Started', shortTitle: 'Getting Started', description: 'Build your first SMART Standard from scratch.' },
      { slug: 'architecture', title: 'Platform Architecture', shortTitle: 'Architecture', description: 'The three-layer pipeline: source data → generated modules → runtime.' },
      { slug: 'directory-structure', title: 'Directory Structure', shortTitle: 'Directory Layout', description: 'How to organize files for a new OIML standard.' },
      { slug: 'identity-dimensions', title: 'Identity & Dimensions', shortTitle: 'Identity & Dimensions', description: 'Tell the platform what your standard is, and how the instrument varies.' },
      { slug: 'provision-data-model', title: 'Provision Data Model', shortTitle: 'Provisions', description: 'How requirements, conformance tests, and forms are declared in YAML.' },
      { slug: 'specialization', title: 'Specialization & Parameterization', shortTitle: 'Specialization', description: 'Template → specialized: how provisions vary per dimension.' },
      { slug: 'requirements', title: 'Requirements Model', shortTitle: 'Requirements', description: 'Machine-readable requirements with structured acceptance criteria.' },
      { slug: 'conformance-tests', title: 'Conformance Tests', shortTitle: 'Conformance', description: 'Test procedures linked to requirements via cross-references.' },
      { slug: 'test-report-forms', title: 'Test Report Forms', shortTitle: 'TRF Schemas', description: 'Form schemas with field declarations and calculation wiring.' },
      { slug: 'calculation-engine', title: 'Calculation Engine', shortTitle: 'Calculations', description: 'Table lookups, numeric expressions, and pass/fail logic.' },
      { slug: 'terminology', title: 'Terminology & Cross-References', shortTitle: 'Terminology', description: 'Defined terms and the cross-reference dependency system.' },
      { slug: 'evaluation-workflow', title: 'Evaluation Workflow', shortTitle: 'Evaluation', description: 'Dimensions, workflow steps, state machines, certificates.' },
      { slug: 'ontology', title: 'Ontology Architecture', shortTitle: 'Ontology', description: 'Three-layer OWL ontology: SMART Core → OIML Core → Domain.' },
    ],
  },
  {
    key: 'arch',
    label: 'Architecture',
    description:
      'How the system is built — the six-layer entity model, design principles, and cross-cutting primitives.',
    pages: [
      { slug: 'overview', title: 'Architecture Overview', shortTitle: 'Overview', description: 'The six-layer entity chain, data flow, file organization.' },
      { slug: 'design-principles', title: 'Design Principles', shortTitle: 'Design Principles', description: 'The six principles that shape every decision.' },
      { slug: 'standards', title: 'Supported Standards', shortTitle: 'Standards', description: 'Which OIML recommendations are implemented.' },
      { slug: 'requirements-tests', title: 'Requirements & Conformance Tests', shortTitle: 'Req. & Tests', description: 'Layers 1–2: normative provisions and test procedures.' },
      { slug: 'forms', title: 'Forms', shortTitle: 'Forms', description: 'Layer 3: structured data capture with measurement kinds.' },
      { slug: 'instances-evaluation', title: 'Instances & Evaluation', shortTitle: 'Evaluation', description: 'Layers 4–5: runtime evaluation pipeline and traceability.' },
      { slug: 'computation-engine', title: 'Computation Engine', shortTitle: 'Computation', description: 'The Calculation primitive: reusable typed computations.' },
      { slug: 'expression-language', title: 'Expression Language', shortTitle: 'Expressions', description: 'AsciiMath for arithmetic, OCL for boolean conditions.' },
      { slug: 'tables-lookups', title: 'Tables & Lookups', shortTitle: 'Tables', description: 'The Table primitive: tiered, scalar, and range lookups.' },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    description: 'How certification works — the end-to-end process.',
    pages: [
      { slug: 'overview', title: 'Workflow Overview', shortTitle: 'Overview', description: 'The certification lifecycle, step by step.' },
      { slug: 'instrument-model', title: 'Instrument Model', shortTitle: 'Instruments', description: 'Family → Group → Model → Sample hierarchy.' },
      { slug: 'dimension-schemas', title: 'Dimension Schemas', shortTitle: 'Dimensions', description: 'How dimensions.yaml makes the workflow general.' },
      { slug: 'application', title: 'Application', shortTitle: 'Application', description: 'Manufacturer declaration and IA review.' },
      { slug: 'test-commissioning', title: 'Test Commissioning', shortTitle: 'Commissioning', description: 'IA commissions TL, selects samples and tests.' },
      { slug: 'test-report', title: 'Test Report', shortTitle: 'Test Report', description: 'TL captures results with shared context.' },
      { slug: 'form-data-binding', title: 'Form Data Binding', shortTitle: 'Data Binding', description: 'How form fields bind to entity context.' },
      { slug: 'evaluation-certificate', title: 'Evaluation & Certificate', shortTitle: 'Certificate', description: 'IA consolidation, certificate generation.' },
      { slug: 'state-machines', title: 'State Machines', shortTitle: 'States', description: 'All five entity lifecycle state machines.' },
      { slug: 'adding-a-standard', title: 'Adding a Standard', shortTitle: 'Add Standard', description: 'Developer guide: YAML-only workflow.' },
    ],
  },
  {
    key: 'specifications',
    label: 'Formal Specifications',
    description:
      'The SMART_REQS documents — the normative specification set for the SMART platform.',
    pages: [
      { slug: 'system-architecture', title: '01 — System Architecture', shortTitle: '01 Architecture', description: 'Top-level architecture of the SMART platform.' },
      { slug: 'requirement-and-conformance-model', title: '02 — Requirement & Conformance Model', shortTitle: '02 Req & Conf', description: 'Formal model for requirements and conformance tests.' },
      { slug: 'form-and-measurement-model', title: '03 — Form & Measurement Model', shortTitle: '03 Forms', description: 'Form schemas, fields, and measurement kinds.' },
      { slug: 'ocl-expression-language', title: '04 — OCL Expression Language', shortTitle: '04 OCL', description: 'OCL constraint language reference.' },
      { slug: 'evaluation-and-condition-model', title: '05 — Evaluation & Condition Model', shortTitle: '05 Evaluation', description: 'Evaluation pipeline and condition model.' },
      { slug: 'yaml-schema-specification', title: '06 — YAML Schema Specification', shortTitle: '06 YAML Schema', description: 'Formal YAML schemas for all entity types.' },
      { slug: 'calculation-primitive', title: '07 — Calculation Primitive', shortTitle: '07 Calculation', description: 'The Calculation primitive formal spec.' },
      { slug: 'expression-language-asciimath-ocl', title: '08 — Expression Language', shortTitle: '08 Expressions', description: 'AsciiMath + OCL expression grammar.' },
      { slug: 'table-primitive', title: '09 — Table Primitive', shortTitle: '09 Tables', description: 'The Table primitive formal spec.' },
      { slug: 'certification-workflow-model', title: '10 — Certification Workflow Model', shortTitle: '10 Workflow', description: 'Workflow entity model and state machines.' },
      { slug: 'variable-symbol-model', title: '11 — Variable & Symbol Model', shortTitle: '11 Variables', description: 'Variables, symbols, and binding model.' },
    ],
  },
  {
    key: 'ref',
    label: 'Reference',
    description: 'Quick-reference material — schemas, types, syntax, identifiers.',
    pages: [
      { slug: 'yaml-schema', title: 'YAML Schema', shortTitle: 'YAML Schema', description: 'Formal schemas for rc.yaml, cc.yaml, form.yaml, etc.' },
      { slug: 'type-definitions', title: 'Type Definitions', shortTitle: 'Types', description: 'Complete TypeScript type definitions.' },
      { slug: 'ocl-reference', title: 'OCL Reference', shortTitle: 'OCL', description: 'Complete OCL syntax quick reference.' },
      { slug: 'urn-specification', title: 'URN Specification', shortTitle: 'URN', description: 'OIML URN namespace and identifier patterns.' },
    ],
  },
]

export const docsSidebar = sections.map(section => ({
  text: section.label,
  collapsed: false,
  items: section.pages.map(page => ({
    text: page.shortTitle,
    link: `/docs/${section.key}/${page.slug}`,
  })),
}))
