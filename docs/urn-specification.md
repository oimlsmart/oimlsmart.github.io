# URN Specification

<div class="page-hero">
  <span class="eyebrow">Reference · Identifiers</span>
  <h1>OIML URN specification</h1>
  <p class="lede">
    OIML SMART uses Uniform Resource Names (URNs) as persistent, location-
    independent identifiers for every entity — Recommendations, requirements,
    tests, forms, terms, certificates.
  </p>
</div>



<div class="callout draft-notice">
<strong>DRAFT — Pilot programme</strong>
<p>
This page documents the OIML SMART pilot programme. Every requirement,
test, form, ontology entity, and specification described here is a
<strong>draft</strong> and may change without notice as the pilot
evolves. OIML Member States and Corresponding Members seeking engagement
should contact OIML through official channels. Not for external
distribution.
</p>
</div>
## URN namespace

The OIML URN namespace is `urn:oiml:`. Sub-namespaces identify the entity type:

| Namespace | Example |
|---|---|
| `urn:oiml:recommendation:` | `urn:oiml:recommendation:r60:2021` |
| `urn:oiml:requirement:` | `urn:oiml:requirement:r60:mpe` |
| `urn:oiml:test:` | `urn:oiml:test:r60:measurement-error-mdlo` |
| `urn:oiml:form:` | `urn:oiml:form:r60:measurement-error-mdlo` |
| `urn:oiml:calc:` | `urn:oiml:calc:r60:load-error` |
| `urn:oiml:table:` | `urn:oiml:table:r60:mpe-table` |
| `urn:oiml:term:` | `urn:oiml:term:r60:load-cell` |
| `urn:oiml:certificate:` | `urn:oiml:certificate:r60-a-de1-2024-001` |
| `urn:oiml:document:` | `urn:oiml:document:b18` |

## Why URNs

URNs are persistent, location-independent identifiers. Unlike URLs, they survive repository moves, redesigns, and changes to the publishing infrastructure. A URN can be resolved through different services over time.

## Resolution

Resolution services are maintained by BIML and the OIML SMART platform. A URN resolver returns the current canonical location of the identified entity (its metadata, its source YAML, its published PDF section, etc.).

## Cross-references

Within a SMART Recommendation, every cross-reference is encoded as a URN. The build pipeline validates that every referenced URN resolves to a declared entity — no dangling references.

## Compatibility

The OIML URN scheme is designed to be compatible with the IEC-ISO SMART identifier system where applicable, so cross-organization references are unambiguous.
