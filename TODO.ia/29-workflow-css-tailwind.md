---
status: done
---

# 29 — Migrate workflow component scoped CSS to Tailwind utilities

10 of 11 workflow components converted from scoped CSS to Tailwind utility
classes. Only DispatchWizard retains scoped CSS (uses CSS variables, not raw
hex, and has data-attribute selectors that are natural as CSS).

## What changed

Converted components (scoped CSS → 0):
- ApplicationsList, ApplicationDetail
- CertificateList
- EvaluationList, EvaluationDetail
- LabInbox
- ModelFamilyList, SampleInventory
- SampleDataSeeder
- TestRequestList, TestRequestDetail

Raw hex colors (#1a1a1a, #999, #e0e0e0, #f0f0f0, #004996) replaced with
semantic Tailwind utilities (text-ink, text-ink-muted, border-rule,
bg-paper-raised, text-accent).

font-family:system-ui → font-sans utility class.

Remaining hex colors are semantic status indicators (green/red/amber for
pass/fail/pending badges) — same pattern used in the public site.
