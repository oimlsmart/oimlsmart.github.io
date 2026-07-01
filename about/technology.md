
<div class="page-hero">
  <span class="eyebrow">About · 04</span>
  <h1>Technology stack</h1>
  <p class="lede">
    OIML SMART builds on a mature open-source toolchain. Every layer is
    auditable, version-controlled, and built on open standards.
  </p>
</div>



<DraftCallout />
## Modelling Language: Primmel

The information model behind each SMART Recommendation is authored in **[Primmel](https://www.primmel.org/)**, Ribose's next-generation executable standards modelling language.

Primmel is the successor to **MMEL** (the Multi-Modal Modelling Language), which was developed jointly by Ribose and BSI for the BSI SMART programme. Primmel was adopted as the basis of OIML SMART and has since been released as a public language for standards organizations to model their own standards.

Primmel provides a JSON-like syntax for describing:

- The **data model** of a standard (entities, attributes, relationships).
- The **process model** (lifecycle states, transitions, guards).
- **Compliance rules** (typed expressions and constraints).
- **Measurement kinds** (units, dimensions, quantities).
- **Mappings** to other formats and ontologies.

The Primmel specification is published at [primmel.org/spec/](https://www.primmel.org/spec/). The original MMEL specification lives at [github.com/primmel/mmel](https://github.com/primmel/mmel).

## Metanorma

[**Metanorma**](https://www.metanorma.org/) is the authoring and publishing toolchain used for OIML Recommendations. Subject matter experts write the human-readable document in AsciiDoc; Metanorma renders it to PDF, HTML, and other formats.

SMART adds a parallel machine-readable track: the same subject matter is captured as YAML/Primmel, validated against schemas, and converted to TypeScript modules that the application loads at runtime.

## Relaton

[**Relaton**](https://www.relaton.org/) is the bibliographic framework used for OIML document citations, cross-references, and the document library. Every OIML document has a structured Relaton entry; every cross-reference in a SMART Recommendation resolves to a Relaton identifier.

## LutaML

[**LutaML**](https://www.lutaml.org/) is the universal data modelling toolkit that provides the abstract syntax for Primmel models. Primmel is one of LutaML's concrete serializations.

## NISO STS

The published XML representation of each OIML Recommendation uses **NISO STS** (the National Information Standards Organization Standards Tag Suite). This is the same XML format used by ISO, IEC, ANSI, and other standards developers — ensuring OIML SMART outputs are interoperable with the broader standards publishing ecosystem.

## UnitsML

Physical quantities, units, and dimensions are encoded using **UnitsML**, referencing the SI Digital Framework. This ensures that measurement data in a SMART test report is unambiguously typed and convertible.

## OWL

The semantic ontology layer is published in **OWL** (Web Ontology Language), enabling reasoners, SPARQL queries, and cross-Recommendation inference. The OIML Core Ontology is the shared foundation; each Recommendation adds its own domain ontology.

## Open source

All of the core technologies above (Primmel, Metanorma, Relaton, LutaML) are open source, released by Ribose and the broader community. OIML SMART content itself is published under OIML copyright.
