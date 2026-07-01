# Evaluation & Certificate

After TestReports are submitted, the Issuing Authority consolidates them into a Type Evaluation Report and — if the type conforms — issues an OIML Certificate.

## Consolidation

The IA creates an **EvaluationReport** that:

- Lists all TestReports received from TLs.
- Includes one **FormDetermination** per requirement criterion — pass / fail / conditional, computed by the engine from the underlying FormInstances.
- Carries the IA's **overall conformity decision**: the type conforms, conditionally conforms, or does not conform to the Recommendation.
- Notes any **conditions** — additional national requirements, deviations, or limitations on the certificate scope.

The overall decision is *derived* from the individual FormDeterminations, not entered manually. This eliminates subjective judgement from the consolidation step.

## Certificate issuance

If the IA decides the type conforms, an **OIML Certificate** is issued:

- A unique certificate number following PD-05 Annex B format (e.g. `R60-A-DE1-2024-001`).
- The certificate bears the **OIML-CS logo** per B 20 requirements.
- Structured classification data (accuracy class, model, family).
- Reference to the underlying EvaluationReport.
- Validity period and any conditions.

A copy is sent to BIML for registration in the OIML database.

## Utilization

Once registered, the certificate and its EvaluationReport can be used by OIML-CS Utilizers and Associates in support of national or regional type approvals, per their Declaration scope.

See the [OIML-CS page](/oiml-cs.html) for the certification system context.
