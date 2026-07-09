---
title: Primmel adopted as the SMART modelling language
date: 2026-06-24
author: OIML SMART team
summary: OIML SMART has adopted Primmel — Ribose's successor to MMEL — as its information modelling language. Primmel was released as a public language for standards organizations in 2026.
---


The OIML SMART information model is now authored in
**[Primmel](https://www.primmel.org/)**, Ribose's next-generation executable
standards modelling language. Primmel is the successor to MMEL (the
Multi-Modal Modelling Language developed jointly by Ribose and BSI for the
BSI SMART programme) and was adopted as the basis of OIML SMART in 2026.

## What Primmel provides

Primmel is a JSON-like syntax for describing:

- The **data model** of a standard (entities, attributes, relationships).
- The **process model** (lifecycle states, transitions, guards).
- **Compliance rules** (typed expressions and constraints).
- **Measurement kinds** (units, dimensions, quantities).
- **Mappings** to other formats and ontologies.

## Why we adopted it

- **Executable.** Primmel models run; they are not just diagrams.
- **Lineage.** Direct successor to MMEL, with the same expressiveness.
- **Open.** Released as a public language for standards organizations.
- **Tool-supported.** Reference parsers and validators are open source.

## What this means for the pilot

Existing YAML schemas in `data/<standard>/` remain the serialization format
for SMART data — they map 1:1 to Primmel constructs. The Primmel model is
the canonical source; the YAML files are its concrete serialization for a
specific Recommendation.

Read the [Technology page](/about/technology.html) for the full Primmel /
Metanorma / Relaton / LutaML stack.