# Workflow Overview

The OIML SMART certification workflow moves a measuring instrument from initial application to issued certificate through eight major steps. Each step transitions the workflow from one state to the next, accumulating data and decisions along the way.

## High-level flow

```
Manufacturer ──► Issuing Authority (IA) ──► Testing Laboratory (TL)
    │                    │                          │
    │  Application       │  Test Request            │  Test Execution
    │  (family, groups,  │  (samples, scope,        │   (procedures,
    │   models, samples) │   procedures)            │    measurements)
    │                    │                          │
    │                    ◄── Test Report ────────────┘
    │                    │
    │                    │  Evaluation & Consolidation
    │                    │
    │                    ▼
    │              OIML BIML
    │              (Certificate Registration)
    │                    │
    │                    ▼
    │              Certificate Issued
    └──────────────────┘
```

Each stage produces a distinct data entity — `Application`, `TestRequest`, `TestReport`, `EvaluationReport`, and `Certificate` — that flows through the pipeline carrying progressively richer information.

## Actor Roles

| Actor | Role | Key Actions |
| --- | --- | --- |
| **Manufacturer** | Applicant for certification | Declares instrument family, submits application with models and samples, provides documentation |
| **IA** (Issuing Authority) | Certification decision-maker | Reviews application, commissions TLs, consolidates test results, issues evaluation report and certificate |
| **TL** (Testing Laboratory) | Independent test execution | Receives test request, performs tests per OIML procedures, produces test report with measurements and pass/fail |
| **OIML** (BIML) | Central secretariat | Registers certificate, publishes in OIML database, maintains the MAA system |

## End-to-End Process

1. **Declare Instrument Family** — the manufacturer defines the instrument family, classification groups, specific models, and selects representative samples for testing.
2. **Submit Application** — the manufacturer submits an application to an Issuing Authority, including instrument description, technical documentation, and samples.
3. **IA Review** — the IA reviews the application, assigns a coordinator, and either accepts, rejects, or returns it for clarification.
4. **Commission TL** — the IA commissions a Test Laboratory listed in its Declaration, specifying samples and test procedures.
5. **Test Execution** — the TL performs tests per the OIML Recommendation, capturing measurements and observations in the structured form instances.
6. **Test Report Issuance** — the TL issues an OIML Test Report with all results, pass/fail verdicts, and computation evidence.
7. **Evaluation & Consolidation** — the IA consolidates test reports from all TLs into a Type Evaluation Report, decides conformity, and prepares the certificate.
8. **Certificate Issuance** — the IA issues the OIML Certificate bearing the OIML-CS logo and unique number; BIML registers it.

Each step's outputs become the next step's inputs. Every artifact carries structured references to its predecessors, so the full evidence chain is always traceable.

Continue with the [instrument model](/docs/workflow/instrument-model.html).
