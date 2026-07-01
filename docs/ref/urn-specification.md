# URN Specification

OIML SMART uses Uniform Resource Names (URNs) as persistent identifiers for OIML entities — Recommendations, requirements, tests, forms, terms, and certificates.

## URN namespace

The OIML URN namespace is `urn:oiml:`. Sub-namespaces identify the entity type:

| Namespace | Example |
| --- | --- |
| `urn:oiml:recommendation:` | `urn:oiml:recommendation:r60:2021` |
| `urn:oiml:requirement:` | `urn:oiml:requirement:r60:met:error-within-mpe` |
| `urn:oiml:test:` | `urn:oiml:test:r60:measurement-error-mdlo` |
| `urn:oiml:form:` | `urn:oiml:form:r60:measurement-error-mdlo` |
| `urn:oiml:term:` | `urn:oiml:term:r60:accuracy-class` |
| `urn:oiml:certificate:` | `urn:oiml:certificate:r60-a-de1-2024-001` |

## Why URNs

URNs are persistent, location-independent identifiers. Unlike URLs, they survive repository moves, redesigns, and changes to the publishing infrastructure. A URN can be resolved through different services over time.

## Resolution

Resolution services are maintained by BIML and the OIML SMART platform. A URN resolver returns the current canonical location of the identified entity (its metadata, its source YAML, its published PDF section, etc.).

## Cross-references

Within a SMART Recommendation, every cross-reference is encoded as a URN. The build pipeline validates that every referenced URN resolves to a declared entity — no dangling references.

## Compatibility

The OIML URN scheme is designed to be compatible with the IEC-ISO SMART identifier system where applicable, so cross-organization references are unambiguous.
