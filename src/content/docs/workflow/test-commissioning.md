# Test Commissioning

After accepting an application, the IA commissions a Test Laboratory to perform the actual testing.

## The commissioning step

The IA creates a **TestRequest** that specifies:

- The **InstrumentSamples** to be tested (with serial numbers).
- The **ConformanceTests** to be performed (selected from the Recommendation's test catalog based on the instrument's classification).
- The **scope** — which accuracy classes, which load ranges, which environmental conditions.
- Any **special instructions** from the IA or manufacturer.

The TestRequest is sent to a TL listed in the IA's Declaration. The TL acknowledges receipt and schedules the test campaign.

## TL selection criteria

The IA selects a TL based on:

- The TL's **scope of accreditation** (which Recommations, which accuracy classes).
- The TL's **availability** and capacity.
- The TL's **independence** from the manufacturer (per OIML-CS rules).

A single application may be split across multiple TLs (e.g. one for environmental tests, another for electrical tests).

## What happens next

The TL performs the tests according to the [Test Report](/docs/workflow/test-report.html) workflow.
