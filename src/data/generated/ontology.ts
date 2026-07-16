// Auto-generated from TTL files by build/ontology-data-plugin.ts
// Do not edit manually
// Sources: public/ontologies/*.ttl

export const ontologyEntities = [
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/",
    "qname": "smart:",
    "slug": "smart-",
    "label": "IEC-ISO SMART Core Ontology",
    "description": "",
    "ontology": "smart",
    "type": "ontology",
    "version": "2.0.0",
    "imports": []
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/Entity",
    "qname": "smart:Entity",
    "slug": "smart-Entity",
    "label": "Entity",
    "description": "The root class of the SMART Core Ontology. Every domain object that can be identified, described, and referenced within a machine-actionable standard is an Entity.",
    "ontology": "smart",
    "type": "class"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/PublicationDocument",
    "qname": "smart:PublicationDocument",
    "slug": "smart-PublicationDocument",
    "label": "Publication Document",
    "description": "A document published by a standards body. International Recommendations, Guides, Vocabularies, and other publication types are subclasses.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/PublicationDocumentType",
    "qname": "smart:PublicationDocumentType",
    "slug": "smart-PublicationDocumentType",
    "label": "Publication Document Type",
    "description": "The type of a publication document (e.g. International Recommendation, Guide, Vocabulary). Used as the value of publication-type taxonomies.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/TermEntry",
    "qname": "smart:TermEntry",
    "slug": "smart-TermEntry",
    "label": "Term Entry",
    "description": "A terminological entry grouping one or more designations (terms, symbols, abbreviations) for a single concept, together with its definition and grammatical/contextual metadata, in accordance with ISO 10241-1.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/Organization",
    "qname": "smart:Organization",
    "slug": "smart-Organization",
    "label": "Organization",
    "description": "An organization — a body such as a standards body, regulatory authority, conformity-assessment body, or manufacturer, that has a role in the publication, certification, or conformity-assessment lifecycle.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/Activity",
    "qname": "smart:Activity",
    "slug": "smart-Activity",
    "label": "Activity",
    "description": "An activity or process carried out by an Organization, such as certification, auditing, or testing.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/ExternalConstraint",
    "qname": "smart:ExternalConstraint",
    "slug": "smart-ExternalConstraint",
    "label": "External Constraint",
    "description": "A constraint that originates outside the provision itself — typically a classification-dimension applicability that restricts a provision to a subset of a device family (e.g. accuracy class, technology, humidity class).",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/Provision",
    "qname": "smart:Provision",
    "slug": "smart-Provision",
    "label": "Provision",
    "description": "A single normative provision in a standard — a requirement, recommendation, permission, or statement, expressed in a machine-actionable form.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/Requirement",
    "qname": "smart:Requirement",
    "slug": "smart-Requirement",
    "label": "Requirement",
    "description": "A provision that expresses an obligation: the agent subject to the requirement must perform (or refrain from) the action or satisfy the condition.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Provision"
  },
  {
    "uri": "https://w3id.org/standards/smart/ontologies/core/ProvisionSet",
    "qname": "smart:ProvisionSet",
    "slug": "smart-ProvisionSet",
    "label": "Provision Set",
    "description": "A named grouping of related provisions in a standard — e.g. a Requirements Class grouping related requirements, or a Conformance Class grouping related conformance tests.",
    "ontology": "smart",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/",
    "qname": "oiml:",
    "slug": "oiml-",
    "label": "OIML Core Ontology",
    "description": "",
    "ontology": "oiml",
    "type": "ontology",
    "version": "1.0.0",
    "imports": [
      "smart:"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Standard",
    "qname": "oiml:Standard",
    "slug": "oiml-Standard",
    "label": "Standard",
    "description": "An OIML International Recommendation.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:PublicationDocument"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/RequirementsDocument",
    "qname": "oiml:RequirementsDocument",
    "slug": "oiml-RequirementsDocument",
    "label": "Requirements Document",
    "description": "Part 1 of an OIML Recommendation: metrological and technical requirements.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:PublicationDocument"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/TestProcedures",
    "qname": "oiml:TestProcedures",
    "slug": "oiml-TestProcedures",
    "label": "Test Procedures",
    "description": "Part 2 of an OIML Recommendation: test procedures.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:PublicationDocument"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/TestReportForms",
    "qname": "oiml:TestReportForms",
    "slug": "oiml-TestReportForms",
    "label": "Test Report Forms",
    "description": "Part 3 of an OIML Recommendation: test report forms.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:PublicationDocument"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/RequirementsClass",
    "qname": "oiml:RequirementsClass",
    "slug": "oiml-RequirementsClass",
    "label": "Requirements Class",
    "description": "A grouping of related requirements in an OIML standard.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:ProvisionSet"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Requirement",
    "qname": "oiml:Requirement",
    "slug": "oiml-Requirement",
    "label": "Requirement",
    "description": "A specific requirement in an OIML standard.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Requirement"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/ConformanceClass",
    "qname": "oiml:ConformanceClass",
    "slug": "oiml-ConformanceClass",
    "label": "Conformance Class",
    "description": "A grouping of related conformance tests in an OIML standard.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:ProvisionSet"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/ConformanceTest",
    "qname": "oiml:ConformanceTest",
    "slug": "oiml-ConformanceTest",
    "label": "Conformance Test",
    "description": "A test procedure for verifying conformance to requirements.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Provision"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/TestReport",
    "qname": "oiml:TestReport",
    "slug": "oiml-TestReport",
    "label": "Test Report",
    "description": "The evaluation report document containing all test report forms.",
    "ontology": "oiml",
    "type": "class",
    "parent": "oiml:Standard"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/TestReportForm",
    "qname": "oiml:TestReportForm",
    "slug": "oiml-TestReportForm",
    "label": "Test Report Form",
    "description": "An individual form within a test report.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Term",
    "qname": "oiml:Term",
    "slug": "oiml-Term",
    "label": "Term",
    "description": "A term defined in an OIML standard.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:TermEntry"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Applicability",
    "qname": "oiml:Applicability",
    "slug": "oiml-Applicability",
    "label": "Applicability",
    "description": "Classification dimension constraints on a provision. Each dimension key maps to an array of allowed classification values. Omitted dimensions mean all values (universal). Effective applicability is computed by merging scope and item applicability per-dimension, with item dimensions overriding scope dimensions.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:ExternalConstraint"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/IssuingAuthority",
    "qname": "oiml:IssuingAuthority",
    "slug": "oiml-IssuingAuthority",
    "label": "Issuing Authority",
    "description": "An OIML member state body authorized to issue OIML certificates of conformity.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Organization"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Certificate",
    "qname": "oiml:Certificate",
    "slug": "oiml-Certificate",
    "label": "Certificate",
    "description": "An OIML type approval or conformity certificate.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Certification",
    "qname": "oiml:Certification",
    "slug": "oiml-Certification",
    "label": "Certification",
    "description": "The certification process and decision.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Activity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/AuditReport",
    "qname": "oiml:AuditReport",
    "slug": "oiml-AuditReport",
    "label": "Audit Report",
    "description": "A complete audit and testing report for a device.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/CalibrationRecord",
    "qname": "oiml:CalibrationRecord",
    "slug": "oiml-CalibrationRecord",
    "label": "Calibration Record",
    "description": "A calibration record for test equipment.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/EvaluationResult",
    "qname": "oiml:EvaluationResult",
    "slug": "oiml-EvaluationResult",
    "label": "Evaluation Result",
    "description": "A pass/fail/NA evaluation result.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/TestEquipment",
    "qname": "oiml:TestEquipment",
    "slug": "oiml-TestEquipment",
    "label": "Test Equipment",
    "description": "Equipment used in testing.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/DeviceUnderTest",
    "qname": "oiml:DeviceUnderTest",
    "slug": "oiml-DeviceUnderTest",
    "label": "Device Under Test",
    "description": "The device being evaluated.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/Classification",
    "qname": "oiml:Classification",
    "slug": "oiml-Classification",
    "label": "Classification",
    "description": "A classification scheme for a device.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/TestParameter",
    "qname": "oiml:TestParameter",
    "slug": "oiml-TestParameter",
    "label": "Test Parameter",
    "description": "A parameter measured during testing.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/MeasurementResult",
    "qname": "oiml:MeasurementResult",
    "slug": "oiml-MeasurementResult",
    "label": "Measurement Result",
    "description": "A measurement result from a test.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:Entity"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasPart",
    "qname": "oiml:hasPart",
    "slug": "oiml-hasPart",
    "label": "has part",
    "description": "Relates a standard to its parts (requirements, test procedures, test report forms).",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Standard"
    ],
    "range": [
      "oiml:Standard"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasRequirementsClass",
    "qname": "oiml:hasRequirementsClass",
    "slug": "oiml-hasRequirementsClass",
    "label": "has requirements class",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:RequirementsDocument"
    ],
    "range": [
      "oiml:RequirementsClass"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasRequirement",
    "qname": "oiml:hasRequirement",
    "slug": "oiml-hasRequirement",
    "label": "has requirement",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:RequirementsClass"
    ],
    "range": [
      "oiml:Requirement"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasConformanceClass",
    "qname": "oiml:hasConformanceClass",
    "slug": "oiml-hasConformanceClass",
    "label": "has conformance class",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:TestProcedures"
    ],
    "range": [
      "oiml:ConformanceClass"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasConformanceTest",
    "qname": "oiml:hasConformanceTest",
    "slug": "oiml-hasConformanceTest",
    "label": "has conformance test",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:ConformanceClass"
    ],
    "range": [
      "oiml:ConformanceTest"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasTestReport",
    "qname": "oiml:hasTestReport",
    "slug": "oiml-hasTestReport",
    "label": "has test report",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:TestReportForms"
    ],
    "range": [
      "oiml:TestReport"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasTestReportForm",
    "qname": "oiml:hasTestReportForm",
    "slug": "oiml-hasTestReportForm",
    "label": "has test report form",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:TestReport"
    ],
    "range": [
      "oiml:TestReportForm"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/verifiedBy",
    "qname": "oiml:verifiedBy",
    "slug": "oiml-verifiedBy",
    "label": "verified by",
    "description": "A requirement is verified by a conformance test.",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Requirement"
    ],
    "range": [
      "oiml:ConformanceTest"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/documentedBy",
    "qname": "oiml:documentedBy",
    "slug": "oiml-documentedBy",
    "label": "documented by",
    "description": "A conformance test is documented by a test report form.",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:ConformanceTest"
    ],
    "range": [
      "oiml:TestReportForm"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasApplicability",
    "qname": "oiml:hasApplicability",
    "slug": "oiml-hasApplicability",
    "label": "has applicability",
    "description": "Relates a provision set, provision, or form to its applicability constraints. Inherited by child items unless overridden per-dimension. When absent, the provision is universal (applies to all classifications).",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "smart:Provision",
      "smart:ProvisionSet",
      "oiml:TestReportForm"
    ],
    "range": [
      "oiml:Applicability"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasTerm",
    "qname": "oiml:hasTerm",
    "slug": "oiml-hasTerm",
    "label": "has term",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Standard"
    ],
    "range": [
      "oiml:Term"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/issuedBy",
    "qname": "oiml:issuedBy",
    "slug": "oiml-issuedBy",
    "label": "issued by",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Certificate"
    ],
    "range": [
      "oiml:IssuingAuthority"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/basedOn",
    "qname": "oiml:basedOn",
    "slug": "oiml-basedOn",
    "label": "based on",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Certificate"
    ],
    "range": [
      "oiml:AuditReport"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/certifiesCompliance",
    "qname": "oiml:certifiesCompliance",
    "slug": "oiml-certifiesCompliance",
    "label": "certifies compliance with",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Certificate"
    ],
    "range": [
      "oiml:Standard"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/conducts",
    "qname": "oiml:conducts",
    "slug": "oiml-conducts",
    "label": "conducts",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:IssuingAuthority"
    ],
    "range": [
      "oiml:AuditReport"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/evaluates",
    "qname": "oiml:evaluates",
    "slug": "oiml-evaluates",
    "label": "evaluates",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:AuditReport"
    ],
    "range": [
      "oiml:DeviceUnderTest"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasClassification",
    "qname": "oiml:hasClassification",
    "slug": "oiml-hasClassification",
    "label": "has classification",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:DeviceUnderTest"
    ],
    "range": [
      "oiml:Classification"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/containsFormResult",
    "qname": "oiml:containsFormResult",
    "slug": "oiml-containsFormResult",
    "label": "contains form result",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:AuditReport"
    ],
    "range": [
      "oiml:TestReportForm"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/produces",
    "qname": "oiml:produces",
    "slug": "oiml-produces",
    "label": "produces",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:AuditReport"
    ],
    "range": [
      "oiml:EvaluationResult"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/usesEquipment",
    "qname": "oiml:usesEquipment",
    "slug": "oiml-usesEquipment",
    "label": "uses equipment",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:AuditReport"
    ],
    "range": [
      "oiml:TestEquipment"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasCalibration",
    "qname": "oiml:hasCalibration",
    "slug": "oiml-hasCalibration",
    "label": "has calibration",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:TestEquipment"
    ],
    "range": [
      "oiml:CalibrationRecord"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/measures",
    "qname": "oiml:measures",
    "slug": "oiml-measures",
    "label": "measures",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:ConformanceTest"
    ],
    "range": [
      "oiml:TestParameter"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasMeasurementResult",
    "qname": "oiml:hasMeasurementResult",
    "slug": "oiml-hasMeasurementResult",
    "label": "has measurement result",
    "description": "",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:TestReportForm"
    ],
    "range": [
      "oiml:MeasurementResult"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/OIMLPublicationType",
    "qname": "oiml:OIMLPublicationType",
    "slug": "oiml-OIMLPublicationType",
    "label": "OIML Publication Type",
    "description": "The type of an OIML publication document.",
    "ontology": "oiml",
    "type": "class",
    "parent": "smart:PublicationDocumentType"
  },
  {
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasOIMLPublicationType",
    "qname": "oiml:hasOIMLPublicationType",
    "slug": "oiml-hasOIMLPublicationType",
    "label": "has OIML publication type",
    "description": "Relates an OIML standard to its publication type.",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:Standard"
    ],
    "range": [
      "oiml:OIMLPublicationType"
    ],
    "functional": false
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/",
    "qname": "oiml-pubtype:",
    "slug": "oiml-pubtype-",
    "label": "OIML Publication Type Taxonomy",
    "description": "",
    "ontology": "oiml-pubtype",
    "type": "conceptScheme",
    "topConcepts": [
      "oiml-pubtype:internationalRecommendation",
      "oiml-pubtype:internationalDocument",
      "oiml-pubtype:basicPublication",
      "oiml-pubtype:guide",
      "oiml-pubtype:vocabulary",
      "oiml-pubtype:bulletin",
      "oiml-pubtype:expertReport"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/internationalRecommendation",
    "qname": "oiml-pubtype:internationalRecommendation",
    "slug": "oiml-pubtype-internationalRecommendation",
    "label": "International Recommendation",
    "description": "A model regulation that establishes the metrological and technical requirements for measuring instruments subject to legal metrology control. Member States are obliged to implement Recommendations to the greatest possible extent.",
    "altLabel": "R",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/internationalDocument",
    "qname": "oiml-pubtype:internationalDocument",
    "slug": "oiml-pubtype-internationalDocument",
    "label": "International Document",
    "description": "An informative document providing guidance on specific aspects of legal metrology. International Documents are not subject to the same implementation obligations as Recommendations.",
    "altLabel": "D",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/basicPublication",
    "qname": "oiml-pubtype:basicPublication",
    "slug": "oiml-pubtype-basicPublication",
    "label": "Basic Publication",
    "description": "A foundational publication providing general information on the activities, structure, and functioning of OIML.",
    "altLabel": "B",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/guide",
    "qname": "oiml-pubtype:guide",
    "slug": "oiml-pubtype-guide",
    "label": "OIML Guide",
    "description": "A document providing guidance on the application of OIML Recommendations and related metrological topics.",
    "altLabel": "G",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/vocabulary",
    "qname": "oiml-pubtype:vocabulary",
    "slug": "oiml-pubtype-vocabulary",
    "label": "Vocabulary",
    "description": "A standardised vocabulary of metrological terms used in OIML publications and legal metrology practice.",
    "altLabel": "V",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/bulletin",
    "qname": "oiml-pubtype:bulletin",
    "slug": "oiml-pubtype-bulletin",
    "label": "Bulletin",
    "description": "The OIML Bulletin is a periodical publication containing articles on legal metrology developments, OIML activities, and related technical topics.",
    "altLabel": "BL",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/expertReport",
    "qname": "oiml-pubtype:expertReport",
    "slug": "oiml-pubtype-expertReport",
    "label": "Expert Report",
    "description": "A report prepared by an OIML expert or group of experts on a specific metrological topic.",
    "altLabel": "E",
    "ontology": "oiml-pubtype",
    "type": "concept",
    "scheme": "oiml-pubtype:",
    "instanceOf": [
      "oiml:OIMLPublicationType"
    ]
  }
] as const

export const ontologyPrefixes = [{"prefix":"owl","uri":"http://www.w3.org/2002/07/owl#"},{"prefix":"rdf","uri":"http://www.w3.org/1999/02/22-rdf-syntax-ns#"},{"prefix":"rdfs","uri":"http://www.w3.org/2000/01/rdf-schema#"},{"prefix":"skos","uri":"http://www.w3.org/2004/02/skos/core#"},{"prefix":"dcterms","uri":"http://purl.org/dc/terms/"},{"prefix":"smart","uri":"https://w3id.org/standards/smart/ontologies/core/"},{"prefix":"oiml","uri":"https://w3id.org/standards/oiml/ontologies/core/"},{"prefix":"oiml-pubtype","uri":"https://w3id.org/standards/oiml/taxonomies/publication-type/"}] as const

export const ontologyImportChain = {"oiml:":{"imports":["smart:"],"description":"","version":"1.0.0"},":":{"imports":["oiml:"],"description":"","version":"1.0.0"}} as const

export const ontologyTypeMeta = {"ontology":{"label":"Ontology","color":"bg-indigo-100 text-indigo-800","colorDot":"bg-indigo-400"},"class":{"label":"Class","color":"bg-blue-100 text-blue-800","colorDot":"bg-blue-400"},"objectProperty":{"label":"Object Property","color":"bg-green-100 text-green-800","colorDot":"bg-green-400"},"individual":{"label":"Named Individual","color":"bg-orange-100 text-orange-800","colorDot":"bg-orange-400"},"concept":{"label":"SKOS Concept","color":"bg-teal-100 text-teal-800","colorDot":"bg-teal-400"},"conceptScheme":{"label":"Concept Scheme","color":"bg-cyan-100 text-cyan-800","colorDot":"bg-cyan-400"}} as const

export const ontologyNamespaces = [
  {
    "prefix": "smart",
    "uri": "https://w3id.org/standards/smart/ontologies/core/",
    "title": "IEC-ISO SMART Core Ontology",
    "description": "Foundational ontology for representing machine-actionable standards content, as defined by the IEC/ISO SMART project. Provides the root Entity class and the Provision, PublicationDocument, and TermEntry models that OIML extends.",
    "color": "emerald",
    "version": "2.0.0"
  },
  {
    "prefix": "oiml",
    "uri": "https://w3id.org/standards/oiml/ontologies/core/",
    "title": "OIML Core Ontology",
    "description": "Core ontology for OIML International Recommendations. Defines classes and properties shared across all OIML standards (R 60, R 76, R 111, etc.), including the standard structure (Requirements, Tests, Test Report, Forms) and certification lifecycle.",
    "color": "brand",
    "version": "1.0.0"
  },
  {
    "prefix": "oiml-pubtype",
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/",
    "title": "OIML Publication Type Taxonomy",
    "description": "A SKOS concept scheme enumerating the kinds of publication documents issued by OIML: International Recommendation (R), International Document (D), Basic Publication (B), Guide (G), Vocabulary (V), Bulletin (BL), and Expert Report (E).",
    "color": "orange",
    "version": "1.0.0"
  }
] as const

export type OntologyEntity = typeof ontologyEntities[number]
