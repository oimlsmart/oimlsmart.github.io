# Dimension Schemas

Each Recommendation defines its own classification dimensions in a `dimensions.yaml` file. This is what makes the SMART workflow general — the engine code is dimension-agnostic; only the data changes.

## What is a dimension?

A **dimension** is a classification axis of the instrument. Examples:

- Accuracy class (A / B / C / ...).
- Maximum load (`Max`).
- Number of verification scale intervals (`n`).
- Operating temperature range.
- Measurement principle (analog / digital).

A dimension has a name, a type (enumeration, numeric range, or boolean), and an optional unit.

## How dimensions drive specialization

The same requirement template produces different acceptance criteria for different dimensional contexts through a process called **specialization**. For example, the R 60 maximum permissible error table varies by accuracy class — the same `Requirement` declaration parameterizes its threshold by the `accuracy_class` dimension.

At runtime, when an InstrumentSample is evaluated, the engine:

1. Walks up to the sample's ClassificationGroup.
2. Reads the dimension values from the group.
3. Selects the specialized criteria that match those dimension values.
4. Evaluates the sample against the specialized criteria.

## Declaring new dimensions

Adding a dimension to a Recommendation is data-only: edit `dimensions.yaml`, add the dimension to the relevant requirement and form schemas, and the engine picks it up automatically. No engine code changes.
