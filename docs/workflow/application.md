# Application

The application is the first step of the certification workflow. It is the manufacturer's formal request to an Issuing Authority to evaluate an instrument type.

## Application contents

An application contains:

- The **InstrumentModelFamily** being submitted (with classification groups, models, and sample serial numbers).
- The **manufacturer declaration** — confirmation that the instruments conform to the manufacturer's specifications and are representative of production.
- **Technical documentation** — drawings, specifications, operating manuals.
- **Photographs** of the samples.
- The **requested scope** — which Recommendation, which accuracy classes.

## Review by the IA

The IA reviews the application for:

- **Completeness** — are all required fields and documents present?
- **Eligibility** — does the manufacturer meet the OIML-CS participation requirements?
- **Sample adequacy** — are the samples representative of production?

The IA may accept the application, return it for clarification, or reject it. Once accepted, the workflow moves to [Test Commissioning](/docs/workflow/test-commissioning.html).

## State machine

An application moves through states: `draft → submitted → under_review → accepted → in_test → evaluated → certified` (or `rejected`, `withdrawn` at appropriate points). The full state machine is documented in [State Machines](/docs/workflow/state-machines.html).
