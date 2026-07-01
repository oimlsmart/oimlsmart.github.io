---
title: The OIML Certification System
description: 'The OIML-CS is the system for issuing, registering, and using OIML type examination certificates and associated type evaluation reports for measuring instruments, based on OIML International Recommendations. Defined by OIML B 18 (2025 edition).'
eyebrow: 'Certification system · B 18:2025'
---

<PageHero />



<DraftCallout />
<p>
  <img src="/oiml-logo-cs-light.svg" alt="OIML-CS" style="height: 2.5rem;" />
</p>

## What is the OIML-CS?

The OIML Certification System (OIML-CS) was established to promote global harmonisation of legal metrological requirements, avoid unnecessary re-testing, and foster mutual confidence among participating Member States. It replaces the previous OIML Basic Certificate System (1991) and the OIML Mutual Acceptance Arrangement (MAA, 2005).

The OIML-CS is a voluntary system. OIML Member States and Corresponding Members participate by signing a **Declaration** that commits them to abide by the rules of the OIML-CS and specifies their scope of acceptance.

## Key Roles

### OIML Issuing Authority (IA)

A certification body approved by the Management Committee to issue OIML certificates and associated OIML type evaluation reports. Each IA operates under Scheme A (accreditation/peer assessment) or Scheme B (self-declaration) and signs a Declaration defining their scope.

*Examples: PTB (DE1), NMi (NL1), METAS (CH1), FORCE (DK2), RISE (SE1).*

### Test Laboratory (TL)

A laboratory performing tests and examinations on measuring instrument samples during OIML type evaluation. TLs may be internal to an IA, third-party, or manufacturer laboratories. They are designated by an IA and approved by the Management Committee.

*Examples: PTB Lab, NMi Lab, FORCE Technology, METTLER TOLEDO (manufacturer TL).*

### Utilizer

A national issuing authority or national responsible body from an OIML Member State that has signed the Declaration, indicating the terms of acceptance of OIML certificates and type evaluation reports. Utilizers may specify additional national requirements.

### Associate

A national issuing authority or national responsible body from an OIML Corresponding Member that has signed the Declaration. Associates have a voice but do not have a vote in the Management Committee.

### Applicant / Manufacturer

The manufacturer or authorised representative who applies for OIML type evaluation. Upon certificate issuance, the applicant becomes the certificate owner.

## Certificate Lifecycle

1. **Application** — *Manufacturer → IA.* The manufacturer submits an application to an OIML Issuing Authority, including instrument description, technical documentation, and samples representative of production. *(PD-05 §4.1 / §5.1)*
2. **Tests & Examinations** — *TL.* A Test Laboratory listed in the IA's Declaration performs tests and examinations according to the relevant OIML Recommendation. Each TL issues an OIML Test Report with results. *(PD-05 §4.3–4.4 / §5.3–5.4)*
3. **Type Evaluation Report** — *IA.* The IA prepares the OIML Type Evaluation Report, assessing conformity of the instrument type to the OIML Recommendation. It includes all test reports and a general conclusion. It shall bear the OIML-CS logo. *(PD-05 §4.5 / §5.5)*
4. **OIML Certificate** — *IA → BIML.* If the type conforms, the IA issues an OIML Certificate bearing the OIML-CS logo and a unique certificate number (e.g. `R60-A-DE1-2024-01`). A copy is sent to BIML for registration. *(PD-05 §4.6 / §5.6)*
5. **Use & Acceptance** — *Utilizer / Associate.* OIML certificates and type evaluation reports are used in support of national or regional type approval. Utilizers and Associates accept reports according to their Declaration scope. *(PD-06 §4)*

## SMART features in the OIML-CS

- **Computation-Powered Test Report Forms.** Test report forms contain embedded computation declarations — expressions, table lookups, and pass/fail logic — that auto-calculate field values based on the instrument's classification. Test Laboratories fill in measurements; the platform computes results.
- **Classification-Driven Evaluation.** Requirements and acceptance criteria are parameterized by instrument classification (e.g. accuracy class). The evaluation workflow automatically selects the applicable criteria based on the subject's classification context.
- **Structured Type Evaluation.** Type evaluation reports are generated from structured data — each form receives a pass/fail/conditional determination, with conditions tracked separately. The overall evaluation decision is derived from individual form results.
- **Certificate Lifecycle.** OIML certificates include structured classification data, revision tracking, and comply with PD-05 format requirements. The OIML-CS logo is affixed per B 20 requirements. Certificate numbers follow the PD-05 Annex B format.

## Key Governing Documents

The OIML-CS is governed by an integrated suite of documents published by OIML. The most important are:

- **B 18** — Framework for the OIML Certification System (the foundational document).
- **B 20** — Rules for use of the OIML-CS logo and certificate numbering.
- **OD-01** — Management Committee Operations.
- **OD-02** — Test Laboratories Forum.
- **PD-01** through **PD-09** — Operational procedures (appeals, expert approval, IA/Utilizer/Associate approval, TL assessment, transitions, Declarations, Utilizer/Associate rights).
- **D 30** — Guide on the application of ISO/IEC 17025 (Testing Laboratories).
- **D 32** — Guide on the application of ISO/IEC 17065 (Issuing Authorities).

These documents are available from the [OIML publications site](https://www.oiml.org/en/publications).
