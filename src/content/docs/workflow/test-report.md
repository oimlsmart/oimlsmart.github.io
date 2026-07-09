# Test Report

The Test Laboratory captures test results as a structured **TestReport**, populated with **FormInstances** for each ConformanceTest performed.

## What's in a TestReport

- References to the originating **TestRequest**.
- The **InstrumentSample(s)** tested.
- A set of **FormInstances**, one per ConformanceTest performed.
- The TL's **observations** — free-text notes about anomalies, deviations, or noteworthy behaviour.
- The TL's **overall conclusion** per test (pass / fail / conditional).
- The TL's **signature** and date.

## Form-driven data entry

For each ConformanceTest in the TestRequest, the TL instantiates the corresponding **Form schema**. The form's fields guide the TL through the measurements and observations required. Where the field is calculated, the engine fills it in automatically.

See [Forms](/docs/arch/forms) for the form lifecycle and [Form Data Binding](/docs/workflow/form-data-binding) for how fields resolve their values.

## Pass/fail computation

Each FormInstance is evaluated against its `pass_if` expression (in [OCL](/docs/arch/expression-language)) to produce a pass / fail / conditional verdict. The verdict is computed by the engine — not entered by the TL — to eliminate transcription errors.

## Submission

When all FormInstances are populated and the TL signs off, the TestReport is submitted to the IA. The IA then begins [Evaluation & Certificate](/docs/workflow/evaluation-certificate).
