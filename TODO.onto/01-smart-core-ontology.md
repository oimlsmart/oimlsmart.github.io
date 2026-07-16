# 01 — Ship the IEC-ISO SMART core ontology

## Why
`oiml.ttl` declares `owl:imports <https://w3id.org/standards/smart/ontologies/core/>` and references 10 `smart:` classes via `rdfs:subClassOf`. The current site has zero `smart:` entities — they show as broken external stubs and the "IEC-ISO SMART" ontology card is missing from the landing page entirely.

## The 10 referenced SMART classes
Extracted from `oiml.ttl`:

```
smart:Activity
smart:Entity
smart:ExternalConstraint
smart:Organization
smart:Provision
smart:ProvisionSet
smart:PublicationDocument
smart:PublicationDocumentType
smart:Requirement
smart:TermEntry
```

## Deliverable

Create `public/ontologies/smart.ttl` defining:

1. The ontology declaration:
   ```turtle
   <https://w3id.org/standards/smart/ontologies/core/> a owl:Ontology ;
     dcterms:title "IEC-ISO SMART Core Ontology"@en ;
     dcterms:description "..."@en ;
     owl:versionInfo "2.0.0" .
   ```

2. Each of the 10 classes as `owl:Class` with:
   - `rdfs:label` (English)
   - `skos:definition` (English)
   - `rdfs:subClassOf` parent (e.g. `smart:PublicationDocument rdfs:subClassOf smart:Entity`)
   - The hierarchy we can infer:
     - `smart:Entity` — root
     - `smart:PublicationDocument rdfs:subClassOf smart:Entity`
     - `smart:PublicationDocumentType rdfs:subClassOf smart:Entity`
     - `smart:TermEntry rdfs:subClassOf smart:Entity`
     - `smart:Organization rdfs:subClassOf smart:Entity`
     - `smart:Activity rdfs:subClassOf smart:Entity`
     - `smart:ExternalConstraint rdfs:subClassOf smart:Entity`
     - `smart:Provision rdfs:subClassOf smart:Entity`
     - `smart:ProvisionSet rdfs:subClassOf smart:Entity`
     - `smart:Requirement rdfs:subClassOf smart:Provision`

3. `@prefix smart: <https://w3id.org/standards/smart/ontologies/core/> .` and the standard RDF/OWL/SKOS/dcterms prefixes.

## Source authority
The definitions should match the IEC-ISO SMART model published by the IEC/ISO SMART project. The reference information model lives in `sdu-smart/reference-docs/smartsdu-information-model-share-*/information_model/ontologies/core-ontology.ttl` (used by isq-smart). Since we may not have that path locally, derive definitions from the OIML TTL files' `skos:definition` annotations plus the standard ISO/IEC Directives Part 2 vocabulary.

## Acceptance
- File `public/ontologies/smart.ttl` exists.
- After running the generator (TODO #2), the `/ontology/` page shows a third ontology card "IEC-ISO SMART Core Ontology" alongside OIML and OIML R 60.
- All 10 `smart:` qnames resolve to internal entity pages (not external stubs).
