---
title: 'State Machines'
shortTitle: 'States'
---

Every workflow entity has a lifecycle state machine. The transitions are declared (in Primmel), not coded — adding a new state or transition is a data-only change.

## The five state machines

1. **Application** — `draft → submitted → under_review → accepted → in_test → evaluated → certified` (or `rejected` / `withdrawn`).
2. **TestRequest** — `draft → issued → acknowledged → in_progress → completed` (or `cancelled`).
3. **TestReport** — `draft → populated → signed → submitted → accepted` (or `returned_for_revision`).
4. **EvaluationReport** — `draft → consolidated → reviewed → decided` (or `deferred`).
5. **Certificate** — `issued → registered → active → expired / superseded / suspended / withdrawn`.

## Guards and side effects

Each transition may declare:

- **Guards** — OCL preconditions that must hold before the transition fires.
- **Side effects** — declarations of what should happen (e.g. notify the manufacturer, register with BIML, archive the dataset).

The engine enforces guards at runtime; side effects are dispatched by the application's event handler.

## Why this matters

State machines are what make the workflow auditable. At any moment, the system can answer "what state is this application in, who put it there, when, and why?" — and the answer is grounded in declared transition rules, not ad-hoc code.
