// Auto-generated from TTL files by ontology-data Vite plugin
// Do not edit manually

export const ontologyEntities = [
  {
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/",
    "qname": "oiml-pubtype:",
    "slug": "oiml-pubtype-",
    "label": "OIML Publication Type Taxonomy",
    "description": "Defines the categories of publication documents issued by the International Organization of Legal Metrology (OIML).",
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
    "uri": "https://w3id.org/standards/oiml/ontologies/core/",
    "qname": "oiml:",
    "slug": "oiml-",
    "label": "OIML Core Ontology",
    "description": "Core ontology for OIML International Recommendations. Defines classes and properties shared across all OIML standards, including the standard structure (Requirements, Tests, Test Report, Forms) and certification lifecycle (Authority, Certificate, Audit, Calibration).",
    "ontology": "oiml",
    "type": "ontology",
    "version": "1.0.0",
    "imports": [
      "smart:"
    ]
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
    "uri": "https://w3id.org/standards/oiml/ontologies/core/hasApplicability",
    "qname": "oiml:hasApplicability",
    "slug": "oiml-hasApplicability",
    "label": "has applicability",
    "description": "Relates a provision set, provision, or form to its applicability constraints. Inherited by child items unless overridden per-dimension. When absent, the provision is universal (applies to all classifications).",
    "ontology": "oiml",
    "type": "objectProperty",
    "domain": [
      "oiml:TestReportForm",
      "smart:ProvisionSet",
      "smart:Provision"
    ],
    "range": [
      "oiml:Applicability"
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-rated-operating-conditions",
    "qname": "oiml-r129:req-rated-operating-conditions",
    "slug": "oiml-r129-req-rated-operating-conditions",
    "label": "Rated operating conditions",
    "description": "Instruments shall not exceed the mpe when exposed to: (a) mains voltage -15 % to +10 % of nominal; (b) air temperature at stated limits or -10 °C to +40 °C if not stated; (c) 85 % relative humidity at the high temperature limit or 40 °C, whichever is lower. Special temperature limits shall span at l",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.2.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-disturbance-resistance",
    "qname": "oiml-r129:req-disturbance-resistance",
    "slug": "oiml-r129-req-disturbance-resistance",
    "label": "Disturbance resistance",
    "description": "When exposed to disturbances, either significant faults do not occur, or significant faults are detected and acted upon. A fault ≤ d is allowed during the disturbance. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.3.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-no-significant-faults",
    "qname": "oiml-r129:req-no-significant-faults",
    "slug": "oiml-r129-req-no-significant-faults",
    "label": "No significant faults during disturbances",
    "description": "If the instrument does not detect and react to a significant fault, then the fault shall not exceed the value of one scale interval (d). ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.3.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-light-acoustic-effects",
    "qname": "oiml-r129:req-light-acoustic-effects",
    "slug": "oiml-r129-req-light-acoustic-effects",
    "label": "Light and acoustic effects",
    "description": "Instruments based on light or acoustic measuring techniques shall remain within the mpe when subjected to the applicable light or acoustic effects, or have provisions for alternative operations if the instrument can only perform across a limited range. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-scale-intervals-min-dimension",
    "qname": "oiml-r129:req-scale-intervals-min-dimension",
    "slug": "oiml-r129-req-scale-intervals-min-dimension",
    "label": "Scale intervals and minimum dimension",
    "description": "The lower limit of the minimum dimension for all values of the scale interval shall be as follows: for d ≤ 2 cm, Min ≥ 10 d; for 2 cm < d ≤ 10 cm, Min ≥ 20 d; for d > 10 cm, Min ≥ 50 d. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-mpe",
    "qname": "oiml-r129:req-mpe",
    "slug": "oiml-r129-req-mpe",
    "label": "Value of the maximum permissible error",
    "description": "The mpe applicable to the measurement by the instrument of any of the three dimensions for initial and subsequent verification is ±1.0 d. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-fault-limit",
    "qname": "oiml-r129:req-fault-limit",
    "slug": "oiml-r129-req-fault-limit",
    "label": "Value of the fault limit",
    "description": "The value of the fault limit is one scale interval (d). A fault equal to or smaller than d is allowed during a disturbance irrespective of the value of the error of indication prior to the disturbance. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-variation-between-indicators",
    "qname": "oiml-r129:req-variation-between-indicators",
    "slug": "oiml-r129-req-variation-between-indicators",
    "label": "Maximum permissible variation between indicators",
    "description": "There shall be no difference between the indications when displayed on different digital indicators. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-multi-interval",
    "qname": "oiml-r129:req-multi-interval",
    "slug": "oiml-r129-req-multi-interval",
    "label": "Multi-interval instruments",
    "description": "For multi-interval instruments with scale intervals of d₁, d₂, …, dᵣ, the mpe are ±1 d₁, ±1 d₂, …, ±1 dᵣ for the applicable range and axis. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.5"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-calculated-quantities",
    "qname": "oiml-r129:req-calculated-quantities",
    "slug": "oiml-r129-req-calculated-quantities",
    "label": "Calculated quantities",
    "description": "All calculated quantities included in the transaction shall be derived from the indicated measured dimensions, which are rounded to the nearest applicable scale interval. All calculated quantities shall be in mathematical agreement. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.6"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-error-determination-rules",
    "qname": "oiml-r129:req-error-determination-rules",
    "slug": "oiml-r129-req-error-determination-rules",
    "label": "Rules for the determination of errors",
    "description": "The specifications in 4.1.2 to 4.1.5 apply to all instruments irrespective of their principles of operation. The initial intrinsic error is found at reference conditions of 20 °C ± 5 °C, ambient atmospheric pressure, nominal voltage and (50 ± 15) % relative humidity. For instruments with an extended",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-4.1.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-object-shape",
    "qname": "oiml-r129:req-object-shape",
    "slug": "oiml-r129-req-object-shape",
    "label": "Shape of the object",
    "description": "Instruments that can only measure rectangular boxes shall be so marked. If an instrument can measure irregular shapes in some but not all dimensions, it shall be marked that it is only to be used for measuring rectangular boxes. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-surface-colour-uniform",
    "qname": "oiml-r129:req-surface-colour-uniform",
    "slug": "oiml-r129-req-surface-colour-uniform",
    "label": "Surface colour — uniform",
    "description": "Light coloured objects are more easily measured than dark coloured objects for instruments using light. Suitable test objects with surfaces varying from shiny white to matt black shall be used to determine limits. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.3.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-surface-colour-non-uniform",
    "qname": "oiml-r129:req-surface-colour-non-uniform",
    "slug": "oiml-r129-req-surface-colour-non-uniform",
    "label": "Surface colour — non-uniform",
    "description": "Instruments shall correctly measure objects with non-uniform surface colour within marked limitations. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.3.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-surface-reflectivity",
    "qname": "oiml-r129:req-surface-reflectivity",
    "slug": "oiml-r129-req-surface-reflectivity",
    "label": "Surface reflectivity and absorption",
    "description": "For acoustic instruments, sound reflective qualities depend on density and smoothness. For optical instruments, light reflective qualities depend on surface finish. Instruments shall correctly measure objects with varying surface characteristics within marked limitations. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.3.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-transparency",
    "qname": "oiml-r129:req-transparency",
    "slug": "oiml-r129-req-transparency",
    "label": "Transparency",
    "description": "Instruments using light beam cutting or reflection shall correctly handle transparent or semi-transparent objects within marked limitations. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.3.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-surface-roughness",
    "qname": "oiml-r129:req-surface-roughness",
    "slug": "oiml-r129-req-surface-roughness",
    "label": "Surface roughness",
    "description": "Instruments shall correctly measure objects with varying surface roughness within marked limitations. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.3.8"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-surface-protrusions",
    "qname": "oiml-r129:req-surface-protrusions",
    "slug": "oiml-r129-req-surface-protrusions",
    "label": "Protrusions on the surface",
    "description": "Instruments shall correctly measure objects with protrusions within marked limitations. If a minimum protrusion is marked, a test object with that size protrusion shall be used. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.3.9"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-orientation-position",
    "qname": "oiml-r129:req-orientation-position",
    "slug": "oiml-r129-req-orientation-position",
    "label": "Orientation and position",
    "description": "If the instrument does not depend on a particular orientation or position, several different orientations and positions shall be tested and the results shall be within mpe. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#annex-a.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-speed-movement",
    "qname": "oiml-r129:req-speed-movement",
    "slug": "oiml-r129-req-speed-movement",
    "label": "Speed of relative movement",
    "description": "For automatic instruments with relative movement between object and instrument, measurements at maximum and minimum speeds shall be within mpe. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-software-identification",
    "qname": "oiml-r129:req-software-identification",
    "slug": "oiml-r129-req-software-identification",
    "label": "Software identification",
    "description": "The software of a measuring instrument shall be clearly identified. The identification shall be displayed on command, during operation, or on start-up. If a software-controlled component has no display, the identification shall be sent via a communication interface. If the software is modified in an",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-algorithm-correctness",
    "qname": "oiml-r129:req-algorithm-correctness",
    "slug": "oiml-r129-req-algorithm-correctness",
    "label": "Correctness of algorithms and functions",
    "description": "The measuring algorithms and functions shall be appropriate and functionally correct for the given application. It shall be possible to assess algorithms and functions either by metrological tests, software tests or software examination. No hidden or undocumented functions or parameters shall exist.",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-securing-software",
    "qname": "oiml-r129:req-securing-software",
    "slug": "oiml-r129-req-securing-software",
    "label": "Securing and protecting software",
    "description": "Software-controlled instruments shall minimize possibilities for unintentional, unauthorised, or intentional misuse. Software shall be protected so that evidence of any intervention is available. Parameters that fix the legally relevant characteristics shall be protected. Displaying or printing of c",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-authentication-results",
    "qname": "oiml-r129:req-authentication-results",
    "slug": "oiml-r129-req-authentication-results",
    "label": "Authentication of measurement results",
    "description": "It shall not be possible to fraudulently simulate legally relevant software for presenting measurement results, using easily available and manageable tools. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-audit-trail",
    "qname": "oiml-r129:req-audit-trail",
    "slug": "oiml-r129-req-audit-trail",
    "label": "Audit trail",
    "description": "Audit trails shall be protected, non-deletable, and non-exchangeable. They shall contain success/failure of updates, timestamps, software identification, and parameter change details. Storage shall suffice for at least three successive verifications. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.5"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-significant-defect-detection",
    "qname": "oiml-r129:req-significant-defect-detection",
    "slug": "oiml-r129-req-significant-defect-detection",
    "label": "Detection of significant defects",
    "description": "If software is involved in detecting significant defects, the instrument shall be made inoperative automatically or provide a visual/audible indication that continues until the user takes action. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-durability-protection",
    "qname": "oiml-r129:req-durability-protection",
    "slug": "oiml-r129-req-durability-protection",
    "label": "Durability protection support",
    "description": "If software is involved in durability protection, the instrument shall initiate measures to ensure further durability, become inoperable, or the problem shall disappear on its own. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-6.8"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-fraudulent-use",
    "qname": "oiml-r129:req-fraudulent-use",
    "slug": "oiml-r129-req-fraudulent-use",
    "label": "Fraudulent use prevention",
    "description": "Instruments shall not facilitate fraudulent use, either by accidental or by deliberate means when using the instrument in the normal manner. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-suitability-construction",
    "qname": "oiml-r129:req-suitability-construction",
    "slug": "oiml-r129-req-suitability-construction",
    "label": "Suitability of construction",
    "description": "Instruments shall be of adequately robust construction to maintain their metrological characteristics when properly installed and used in an environment for which they are intended. Instruments shall be constructed so that all controls, indicators, etc. are suitable for operation under normal condit",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-suitability-use",
    "qname": "oiml-r129:req-suitability-use",
    "slug": "oiml-r129-req-suitability-use",
    "label": "Suitability for use",
    "description": "Instruments shall be designed to suit the method of operation and the objects for which they are intended. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-suitability-verification",
    "qname": "oiml-r129:req-suitability-verification",
    "slug": "oiml-r129-req-suitability-verification",
    "label": "Suitability for verification",
    "description": "Instruments shall be constructed so that the performance requirements of this Recommendation can be applied. If in normal operation the instrument indicates the volume and not the measured dimensions, a test mode shall be provided to display or print out the measured dimensions. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-zero-ready-adjustment",
    "qname": "oiml-r129:req-zero-ready-adjustment",
    "slug": "oiml-r129-req-zero-ready-adjustment",
    "label": "Zero or ready adjustment",
    "description": "Instruments shall be provided with facilities to set the instrument to, and maintain it at, zero or ready condition. This shall only be possible without an object in the measuring area. Either this condition is met automatically for each measurement or the instrument is automatically inhibited from ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.5"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-tare-device",
    "qname": "oiml-r129:req-tare-device",
    "slug": "oiml-r129-req-tare-device",
    "label": "Tare device",
    "description": "The tare function shall only operate subtractively. The value of the tare scale interval shall be the same as the scale interval of the respective axis and range. Operation of tare shall be indicated. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.6"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-warm-up",
    "qname": "oiml-r129:req-warm-up",
    "slug": "oiml-r129-req-warm-up",
    "label": "Warm-up period",
    "description": "As soon as the instrument indicates, prints, stores or transmits the measurement results after the warm-up period following switch-on, the indications shall be within mpe. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.1.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-presentation-indications",
    "qname": "oiml-r129:req-presentation-indications",
    "slug": "oiml-r129-req-presentation-indications",
    "label": "Presentation of indications",
    "description": "Printed and displayed indications shall be reliable, clear and unambiguous and printing shall be indelible. Figures forming the results shall be of a size, shape and clarity for reading to be easy. Printed numbers and symbols shall be at least 2 mm high. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.2.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-units-of-measurement",
    "qname": "oiml-r129:req-units-of-measurement",
    "slug": "oiml-r129-req-units-of-measurement",
    "label": "Units of measurement",
    "description": "All printed and displayed indications shall include the name or symbol of the unit of measurement. For each indication of a quantity only one unit of measurement for that quantity shall be used, and the unit of measurement shall be the same for each axis. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.2.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-scale-interval-value",
    "qname": "oiml-r129:req-scale-interval-value",
    "slug": "oiml-r129-req-scale-interval-value",
    "label": "Value of the scale interval",
    "description": "The value of all scale intervals shall be in the form 1, 2 or 5 × 10ⁿ where n is a positive or negative whole number or zero. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.2.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-limits-of-indication",
    "qname": "oiml-r129:req-limits-of-indication",
    "slug": "oiml-r129-req-limits-of-indication",
    "label": "Limits of indication",
    "description": "Displaying, storing, transmitting or printing the quantity value of any dimension shall either be inhibited or an error message shall be included if the axis is shorter than Min or longer than Max + 9 d. Measurement shall be inhibited if the entire object is not contained within the measuring area. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.2.6"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-nameplate-markings",
    "qname": "oiml-r129:req-nameplate-markings",
    "slug": "oiml-r129-req-nameplate-markings",
    "label": "Nameplate markings",
    "description": "Instruments shall be clearly and permanently marked with: manufacturer's name or mark; model designation; serial number and year of manufacture; type evaluation mark; Max and Min for each axis; V_max and V_min if applicable; scale interval(s) for each axis; and temperature limits if other than -10 °",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.3.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-technical-specifications",
    "qname": "oiml-r129:req-technical-specifications",
    "slug": "oiml-r129-req-technical-specifications",
    "label": "Technical specifications display",
    "description": "Any specifications or limitation of use relating to the instrument or the objects being measured shall be visibly and clearly presented to the operator on the instrument. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.3.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-verification-mark",
    "qname": "oiml-r129:req-verification-mark",
    "slug": "oiml-r129-req-verification-mark",
    "label": "Verification mark provision",
    "description": "Provision shall be made for the application of a verification mark on a nameplate, stamping plug or adhesive label. The mark shall be easily affixed, visible when in use, not removable without damage, and have at least 200 mm² of space. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.4.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-sealing",
    "qname": "oiml-r129:req-sealing",
    "slug": "oiml-r129-req-sealing",
    "label": "Sealing provisions",
    "description": "Provision shall be made for sealing devices, software and parameters that have a metrologically significant effect. Sealing may be by mechanical, electronic, software (audit trail) and/or cryptographic means. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.4.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-interfaces",
    "qname": "oiml-r129:req-interfaces",
    "slug": "oiml-r129-req-interfaces",
    "label": "Interfaces for peripheral devices",
    "description": "An instrument may be equipped with interfaces permitting the coupling of peripheral devices or other instruments. The interface shall not allow metrological functions or measurement data to be affected. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.5.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-checking-significant-faults",
    "qname": "oiml-r129:req-checking-significant-faults",
    "slug": "oiml-r129-req-checking-significant-faults",
    "label": "Acting upon significant faults",
    "description": "When a significant fault has been detected, the instrument shall either be made inoperative automatically or a visual or audible indication shall be provided automatically and shall continue until the user takes action or the fault disappears. For automatic instruments, the instrument shall be made ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.6.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/req-indication-check",
    "qname": "oiml-r129:req-indication-check",
    "slug": "oiml-r129-req-indication-check",
    "label": "Indication check",
    "description": "If the failure of an indicator display element can cause a false indication, then the instrument shall have a display test facility which shows all relevant elements in both active and non-active states. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.6.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-voltage-dips",
    "qname": "oiml-r129:test-voltage-dips",
    "slug": "oiml-r129-test-voltage-dips",
    "label": "AC mains voltage dips and interruptions",
    "description": "Verify that the instrument does not exceed the significant fault threshold (1 d) during short-time reductions of mains voltage. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-bursts",
    "qname": "oiml-r129:test-bursts",
    "slug": "oiml-r129-test-bursts",
    "label": "Electrical bursts",
    "description": "Verify compliance when electrical bursts are applied to power lines, I/O circuits and communication lines. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-esd",
    "qname": "oiml-r129:test-esd",
    "slug": "oiml-r129-test-esd",
    "label": "Electrostatic discharge",
    "description": "Verify compliance when subjected to electrostatic discharge, both direct and indirect application. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-surges",
    "qname": "oiml-r129:test-surges",
    "slug": "oiml-r129-test-surges",
    "label": "Electrical surges",
    "description": "Verify compliance when electrical surges are applied to AC mains power lines and signal/data/control lines. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-rf-immunity-radiated",
    "qname": "oiml-r129:test-rf-immunity-radiated",
    "slug": "oiml-r129-test-rf-immunity-radiated",
    "label": "Immunity to RF electromagnetic fields — Radiated",
    "description": "Verify compliance when subjected to radiated RF electromagnetic fields. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-rf-immunity-conducted",
    "qname": "oiml-r129:test-rf-immunity-conducted",
    "slug": "oiml-r129-test-rf-immunity-conducted",
    "label": "Immunity to RF electromagnetic fields — Conducted",
    "description": "Verify compliance when subjected to conducted RF electromagnetic fields. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-damp-heat-cyclic",
    "qname": "oiml-r129:test-damp-heat-cyclic",
    "slug": "oiml-r129-test-damp-heat-cyclic",
    "label": "Damp heat cyclic",
    "description": "Verify compliance under cyclic humidity conditions for instruments that may be subject to condensate water. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-ambient-light",
    "qname": "oiml-r129:test-ambient-light",
    "slug": "oiml-r129-test-ambient-light",
    "label": "Ambient light test",
    "description": "Verify that optical instruments remain within mpe when subjected to varying ambient light levels. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-acoustics",
    "qname": "oiml-r129:test-acoustics",
    "slug": "oiml-r129-test-acoustics",
    "label": "Acoustics test",
    "description": "Verify that acoustic instruments remain within mpe when subjected to varying sound levels. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-construction-examination",
    "qname": "oiml-r129:test-construction-examination",
    "slug": "oiml-r129-test-construction-examination",
    "label": "Construction examination",
    "description": "Examine the instrument in conjunction with submitted documentation to ensure it complies with the metrological and technical requirements. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#clause-1.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-marking-examination",
    "qname": "oiml-r129:test-marking-examination",
    "slug": "oiml-r129-test-marking-examination",
    "label": "Marking examination",
    "description": "Verify that all required markings are present, clearly visible, permanent, and correctly showing all required information. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-1:2020#clause-5.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-documentation-examination",
    "qname": "oiml-r129:test-documentation-examination",
    "slug": "oiml-r129-test-documentation-examination",
    "label": "Documentation examination",
    "description": "Verify that submitted documentation is sufficient to understand the construction and method of operation of the instrument. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#clause-1.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-software-examination",
    "qname": "oiml-r129:test-software-examination",
    "slug": "oiml-r129-test-software-examination",
    "label": "Software examination",
    "description": "Evaluate legally relevant software for identification, correctness, protection, and audit trail compliance. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#clause-1.4.10"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-object-characteristics",
    "qname": "oiml-r129:test-object-characteristics",
    "slug": "oiml-r129-test-object-characteristics",
    "label": "Object characteristic tests",
    "description": "Verify that the instrument correctly measures objects with varying characteristics within the marked limitations. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-warm-up-time",
    "qname": "oiml-r129:test-warm-up-time",
    "slug": "oiml-r129-test-warm-up-time",
    "label": "Instrument warm-up time",
    "description": "Verify that the instrument is correct (within the mpe) as soon as the values of the dimensions are displayed after switch-on, and that all functions operate as designed. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-repeatability",
    "qname": "oiml-r129:test-repeatability",
    "slug": "oiml-r129-test-repeatability",
    "label": "Repeatability",
    "description": "Verify that the instrument indicates correctly within mpe under conditions of repeated measurement, and that calculated quantities are correct. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-static-temperatures",
    "qname": "oiml-r129:test-static-temperatures",
    "slug": "oiml-r129-test-static-temperatures",
    "label": "Static temperatures",
    "description": "Verify that the instrument complies with the mpe under conditions of high and low temperatures within the rated operating range. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-damp-heat-steady",
    "qname": "oiml-r129:test-damp-heat-steady",
    "slug": "oiml-r129-test-damp-heat-steady",
    "label": "Damp heat steady-state",
    "description": "Verify compliance under conditions of high humidity and constant temperature (85 % RH, 48 h). ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-ac-voltage-variation",
    "qname": "oiml-r129:test-ac-voltage-variation",
    "slug": "oiml-r129-test-ac-voltage-variation",
    "label": "AC mains voltage variation",
    "description": "Verify compliance under AC mains voltage variations between upper (110 %) and lower (85 %) limits. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r129/test-low-voltage-battery",
    "qname": "oiml-r129:test-low-voltage-battery",
    "slug": "oiml-r129-test-low-voltage-battery",
    "label": "Low voltage of internal battery",
    "description": "Verify compliance during low battery voltage conditions. ",
    "ontology": "oiml-r129",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:129-2:2020#anx-a"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-measurement-units",
    "qname": "oiml-r144:req-measurement-units",
    "slug": "oiml-r144-req-measurement-units",
    "label": "Presentation of measurement results",
    "description": "The measurement results of the concentration of CO and nitrogen oxides in the sample shall be expressed in the units of volume fraction and reduced to reference conditions (273.15 K, 101.325 kPa). ppm is used for the volume fraction unit. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-measuring-range",
    "qname": "oiml-r144:req-measuring-range",
    "slug": "oiml-r144-req-measuring-range",
    "label": "Measuring range",
    "description": "The gas analyzer shall provide measurements of a volume fraction of the components determined in the following ranges: CO: 10 ppm to 20 000 ppm; NO: 10 ppm to 5 000 ppm; NO2: 10 ppm to 500 ppm. These measuring ranges may be divided into sub-ranges. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-mpe-intrinsic",
    "qname": "oiml-r144:req-mpe-intrinsic",
    "slug": "oiml-r144-req-mpe-intrinsic",
    "label": "Maximum permissible intrinsic error",
    "description": "For any measurement within the measuring range or sub-range under reference conditions, the MPE, positive or negative, is the larger of: 2 ppm; or 5 % of the measured value. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.3.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-mpe-operating",
    "qname": "oiml-r144:req-mpe-operating",
    "slug": "oiml-r144-req-mpe-operating",
    "label": "MPE on verification under rated operating conditions",
    "description": "The MPE, positive or negative, under rated operating conditions may be equal to or greater than the maximum permissible intrinsic errors, but should not exceed the larger of: 5 ppm; or 10 % of the measured value. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.3.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-repeatability",
    "qname": "oiml-r144:req-repeatability",
    "slug": "oiml-r144-req-repeatability",
    "label": "Repeatability",
    "description": "An estimate of the standard deviation shall not exceed 1/3 of the maximum permissible intrinsic error at the given point of the measuring range. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-rated-conditions",
    "qname": "oiml-r144:req-rated-conditions",
    "slug": "oiml-r144-req-rated-conditions",
    "label": "Rated operating conditions",
    "description": "The gas analyzer shall operate within MPE under: temperature: 5 °C to 40 °C; relative humidity: up to 90 % at 25 °C; atmospheric pressure: 86 kPa to 106 kPa; AC supply voltage: nominal value -15 % to +10 %; supply frequency: nominal ±2 %. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.5.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-cross-sensitivity",
    "qname": "oiml-r144:req-cross-sensitivity",
    "slug": "oiml-r144-req-cross-sensitivity",
    "label": "Cross sensitivity",
    "description": "The indications of the gas analyzer shall not vary by more than half the absolute value of the MPE at the given point if the value of the volume fraction of gas components other than the measurand does not exceed the maximum permissible value. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.5.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-vibration",
    "qname": "oiml-r144:req-vibration",
    "slug": "oiml-r144-req-vibration",
    "label": "Vibration resistance",
    "description": "The gas analyzer shall be protected against the effects of vibration. The minimum requirements should correspond to severity level 1 of OIML D 11:2013, 11.1. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.5.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-disturbances",
    "qname": "oiml-r144:req-disturbances",
    "slug": "oiml-r144-req-disturbances",
    "label": "Disturbances",
    "description": "The error of the gas analyzer shall lie within the permissible limits, or its failure shall be detected by the checking facility for: mechanical shocks, short time power reduction, voltage pulses from the mains, electrostatic discharges, radio frequency electromagnetic fields. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.5.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-response-time",
    "qname": "oiml-r144:req-response-time",
    "slug": "oiml-r144-req-response-time",
    "label": "Response time",
    "description": "When a volume fraction at the input changes abruptly from 0 % to 100 %, the reading shall reach at least 90 % within four minutes. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.6"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-warm-up-time",
    "qname": "oiml-r144:req-warm-up-time",
    "slug": "oiml-r144-req-warm-up-time",
    "label": "Warm-up time",
    "description": "After switching on and after the warm-up time specified by the manufacturer, the gas analytical system shall meet the metrological requirements. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-drift",
    "qname": "oiml-r144:req-drift",
    "slug": "oiml-r144-req-drift",
    "label": "Stability with time (drift)",
    "description": "When operated under stable environmental conditions, the error shall remain within the MPE for at least seven days from the moment of adjustment using the CGM. Automatic drift compensation shall not produce confusing indications. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-4.8"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-corrosion-resistant",
    "qname": "oiml-r144:req-corrosion-resistant",
    "slug": "oiml-r144-req-corrosion-resistant",
    "label": "Corrosion resistant materials",
    "description": "All components of the gas handling system shall be made of corrosion resistant material. The materials used shall not influence the composition of the gas sample. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-representative-sampling",
    "qname": "oiml-r144:req-representative-sampling",
    "slug": "oiml-r144-req-representative-sampling",
    "label": "Representative sampling",
    "description": "The means for sampling and sample preparation during extractive sampling shall provide for representative sampling and shall comply with ISO 10396:2007. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-gas-switching",
    "qname": "oiml-r144:req-gas-switching",
    "slug": "oiml-r144-req-gas-switching",
    "label": "Gas switching system",
    "description": "The gas handling system shall contain a switching system to allow zero gas, calibration gas mixtures, and gas sample to flow into the analyzer. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-zero-gas-filter",
    "qname": "oiml-r144:req-zero-gas-filter",
    "slug": "oiml-r144-req-zero-gas-filter",
    "label": "Zero gas filter",
    "description": "A dehydrating charcoal filter or equivalent system shall be used when ambient air is supplied as a zero gas. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-pump-mounting",
    "qname": "oiml-r144:req-pump-mounting",
    "slug": "oiml-r144-req-pump-mounting",
    "label": "Pump mounting",
    "description": "The pump shall be mounted so its vibrations do not affect measurement results. It shall be possible to turn the pump on/off separately, but measurement shall not be possible when the pump is off. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.5"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-gas-flow-meter",
    "qname": "oiml-r144:req-gas-flow-meter",
    "slug": "oiml-r144-req-gas-flow-meter",
    "label": "Gas flow meter",
    "description": "The gas handling system shall be equipped with a gas flow meter, by which the user can check the measuring mode specified by the manufacturer. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.6"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-air-tightness",
    "qname": "oiml-r144:req-air-tightness",
    "slug": "oiml-r144-req-air-tightness",
    "label": "Air-tightness",
    "description": "The gas handling system shall be air-tight. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-interface-peripherals",
    "qname": "oiml-r144:req-interface-peripherals",
    "slug": "oiml-r144-req-interface-peripherals",
    "label": "Interface for peripherals",
    "description": "The gas analytical system may be equipped with an interface permitting it to be coupled to any peripheral devices or other instruments. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.8"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-interface-isolation",
    "qname": "oiml-r144:req-interface-isolation",
    "slug": "oiml-r144-req-interface-isolation",
    "label": "Interface and peripheral isolation",
    "description": "The interface and peripherals coupled to it shall not affect the metrological characteristics of the gas analytical system or the measurement data obtained. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.1.9"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-indication-range",
    "qname": "oiml-r144:req-indication-range",
    "slug": "oiml-r144-req-indication-range",
    "label": "Indication range",
    "description": "The indication range of the display device shall be from 0.0 ppm to the maximum measuring range. In normal operation, the recording device may indicate 0.0 ppm for volume fraction ≤ 1 ppm. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.2.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-analog-scale",
    "qname": "oiml-r144:req-analog-scale",
    "slug": "oiml-r144-req-analog-scale",
    "label": "Analog scale requirements",
    "description": "If an analog scale is fitted: scale mark distance ≥ 1.25 mm; interval ≤ 2 % of span; pointer thickness ≤ 1/4 of mark distance; pointer overlap ≥ 1/3 of shortest mark; figure height ≥ 5 mm. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.2.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-digital-display",
    "qname": "oiml-r144:req-digital-display",
    "slug": "oiml-r144-req-digital-display",
    "label": "Digital display requirements",
    "description": "Figure height ≥ 5 mm (illuminated) or ≥ 10 mm (other); unit symbol ≥ 3 mm height; zero result shall not be confused with zero indication prior to measurement. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.2.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-printing-device",
    "qname": "oiml-r144:req-printing-device",
    "slug": "oiml-r144-req-printing-device",
    "label": "Printing device",
    "description": "The system shall print date/time, measurement results with units, and self-check results. Printouts shall not differ from displayed values. Minimum figure height 2 mm. Printouts shall remain readable for the required period. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-computing-device",
    "qname": "oiml-r144:req-computing-device",
    "slug": "oiml-r144-req-computing-device",
    "label": "Computing device",
    "description": "The computing device shall calculate emissions with estimated uncertainty. The computational algorithm shall be certified by the relevant authority. Flow rate, temperature, gas pressure, and pipe diameter information shall be automatically introduced. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-alarm-system",
    "qname": "oiml-r144:req-alarm-system",
    "slug": "oiml-r144-req-alarm-system",
    "label": "Alarm system",
    "description": "The gas analytical system may be equipped with an alarm system that gives an audible or visible signal when the maximum permissible unit emission is exceeded. If fitted, it shall be tested. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.5.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-gas-flow-monitoring",
    "qname": "oiml-r144:req-gas-flow-monitoring",
    "slug": "oiml-r144-req-gas-flow-monitoring",
    "label": "Gas flow monitoring",
    "description": "The gas handling system shall have a device that measures or signals that the gas flow is not available or outside manufacturer-specified limits. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.5.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-readiness-indication",
    "qname": "oiml-r144:req-readiness-indication",
    "slug": "oiml-r144-req-readiness-indication",
    "label": "Readiness indication",
    "description": "An indication that the system is ready for measurement shall be provided. If not ready, recording and printing of results shall be prevented. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.5.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-sensor-expiry",
    "qname": "oiml-r144:req-sensor-expiry",
    "slug": "oiml-r144-req-sensor-expiry",
    "label": "Electrochemical sensor expiry warning",
    "description": "For systems with electrochemical sensors, a warning device shall signal sensor expiry. Sensors for filter expiry shall also be fitted. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.5.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-adjustment-facilities",
    "qname": "oiml-r144:req-adjustment-facilities",
    "slug": "oiml-r144-req-adjustment-facilities",
    "label": "Adjustment facilities",
    "description": "The system shall have adjustment facilities for zero-setting, CGM, and internal adjustment. Facilities may be manual, semi-automatic, or automatic. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.6.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-internal-adjustment",
    "qname": "oiml-r144:req-internal-adjustment",
    "slug": "oiml-r144-req-internal-adjustment",
    "label": "Internal adjustment isolation",
    "description": "Internal adjustment shall not affect zero set or linearity, and shall not be connected with CGM adjustment. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.6.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-negative-zero",
    "qname": "oiml-r144:req-negative-zero",
    "slug": "oiml-r144-req-negative-zero",
    "label": "Negative zero indication",
    "description": "The adjustment facility for zero-setting shall give negative indications near zero for certain tests or manual adjustment, if necessary. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.6.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-auto-adjustment-output",
    "qname": "oiml-r144:req-auto-adjustment-output",
    "slug": "oiml-r144-req-auto-adjustment-output",
    "label": "Automatic adjustment output",
    "description": "Automatic adjustment facilities shall display or print results of all internal adjustments (flow rate, internal reference, calibration, leak) after switching on and during operation with specified periodicity. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.6.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-adjustment-security",
    "qname": "oiml-r144:req-adjustment-security",
    "slug": "oiml-r144-req-adjustment-security",
    "label": "Adjustment access control",
    "description": "Technical means for adjusting the gas analyzer (CGM and zero-setting) shall be inaccessible to the operator. Access shall be by code or equivalent procedure. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.7.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-mode-security",
    "qname": "oiml-r144:req-mode-security",
    "slug": "oiml-r144-req-mode-security",
    "label": "Mode change access control",
    "description": "Means to change from one mode of operation to another shall be inaccessible to the operator. Access shall be by code or equivalent procedure. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.7.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/req-inscriptions",
    "qname": "oiml-r144:req-inscriptions",
    "slug": "oiml-r144-req-inscriptions",
    "label": "Inscriptions and markings",
    "description": "The gas analyzer shall be inscribed with: manufacturer's trademark/name, symbolic designation, serial number, year of manufacture, type approval mark, power supply parameters. Each constituent part shall show: designation, serial number, year, parent system, power supply parameters. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:Requirement"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5.8"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-error-determination",
    "qname": "oiml-r144:test-error-determination",
    "slug": "oiml-r144-test-error-determination",
    "label": "Error determination",
    "description": "Determine the error at 3+ points within the measuring range using CGMs. For linear calibration: min+10%, mid±10%, max-10%. For nonlinear: 5+ points uniformly distributed. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-drift-test",
    "qname": "oiml-r144:test-drift-test",
    "slug": "oiml-r144-test-drift-test",
    "label": "Stability with time (drift test)",
    "description": "Verify the error remains within MPE for 7 days after adjustment using CGM. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.3"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-repeatability-test",
    "qname": "oiml-r144:test-repeatability-test",
    "slug": "oiml-r144-test-repeatability-test",
    "label": "Repeatability test",
    "description": "Verify that the standard deviation of 20 measurements does not exceed 1/3 of the MPE at the given point. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.4"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-dry-heat",
    "qname": "oiml-r144:test-dry-heat",
    "slug": "oiml-r144-test-dry-heat",
    "label": "Dry heat test",
    "description": "Verify the system operates within MPE at 40 °C (or max operating temperature) for 2 hours. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.5"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-cold",
    "qname": "oiml-r144:test-cold",
    "slug": "oiml-r144-test-cold",
    "label": "Cold test",
    "description": "Verify the system operates within MPE at 5 °C (or min operating temperature) for 2 hours. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.6"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-damp-heat",
    "qname": "oiml-r144:test-damp-heat",
    "slug": "oiml-r144-test-damp-heat",
    "label": "Damp heat test",
    "description": "Verify the system operates within MPE at 30 °C and 85 % RH for 2 days. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.7"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-ambient-pressure",
    "qname": "oiml-r144:test-ambient-pressure",
    "slug": "oiml-r144-test-ambient-pressure",
    "label": "Ambient pressure test",
    "description": "Verify operation within MPE at extreme pressures (86 kPa and 106 kPa). ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.8"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-power-supply",
    "qname": "oiml-r144:test-power-supply",
    "slug": "oiml-r144-test-power-supply",
    "label": "Power supply variation test",
    "description": "Verify operation within MPE at extreme supply voltage and frequency. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.9"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-cross-sensitivity-test",
    "qname": "oiml-r144:test-cross-sensitivity-test",
    "slug": "oiml-r144-test-cross-sensitivity-test",
    "label": "Cross sensitivity test",
    "description": "Verify that gas components other than the measurand do not cause indication changes exceeding 0.5 × |MPE|. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.10"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-vibration-test",
    "qname": "oiml-r144:test-vibration-test",
    "slug": "oiml-r144-test-vibration-test",
    "label": "Mechanical vibration test",
    "description": "Verify metrological characteristics are maintained under random vibration at severity level 1 of OIML D 11:2013, 11.1. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.11.1"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-shock-test",
    "qname": "oiml-r144:test-shock-test",
    "slug": "oiml-r144-test-shock-test",
    "label": "Mechanical shock test",
    "description": "Verify error within MPE after mechanical shock (25 mm drop on each bottom edge). ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.11.2"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-power-reduction",
    "qname": "oiml-r144:test-power-reduction",
    "slug": "oiml-r144-test-power-reduction",
    "label": "Short time power reduction test",
    "description": "Verify error within MPE or fault detected during AC voltage dips. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.12"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-burst-mains",
    "qname": "oiml-r144:test-burst-mains",
    "slug": "oiml-r144-test-burst-mains",
    "label": "Electrical burst test (AC/DC mains)",
    "description": "Verify error within MPE or fault detected during electrical bursts on mains. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.13"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-burst-signal",
    "qname": "oiml-r144:test-burst-signal",
    "slug": "oiml-r144-test-burst-signal",
    "label": "Electrical burst test (signal lines)",
    "description": "Verify error within MPE or fault detected during electrical bursts on signal lines. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.14"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-surge",
    "qname": "oiml-r144:test-surge",
    "slug": "oiml-r144-test-surge",
    "label": "Surge test",
    "description": "Verify error within MPE or fault detected during electrical surges on signal lines. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.15"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-esd",
    "qname": "oiml-r144:test-esd",
    "slug": "oiml-r144-test-esd",
    "label": "Electrostatic discharge test",
    "description": "Verify error within MPE or fault detected during electrostatic discharges. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.16"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-rf-emf",
    "qname": "oiml-r144:test-rf-emf",
    "slug": "oiml-r144-test-rf-emf",
    "label": "Radiated RF electromagnetic field test",
    "description": "Verify error within MPE or fault detected under RF EM fields. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.17"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-low-battery",
    "qname": "oiml-r144:test-low-battery",
    "slug": "oiml-r144-test-low-battery",
    "label": "Low battery voltage test",
    "description": "Verify system detects and responds to low battery voltage. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.18"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-warm-up-test",
    "qname": "oiml-r144:test-warm-up-test",
    "slug": "oiml-r144-test-warm-up-test",
    "label": "Warm-up time test",
    "description": "Verify the system meets MPE requirements immediately after warm-up and at 2, 5, and 15 minutes post-warm-up. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.19"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-response-time-test",
    "qname": "oiml-r144:test-response-time-test",
    "slug": "oiml-r144-test-response-time-test",
    "label": "Response time test",
    "description": "Verify response time ≤ 4 minutes when switching from ambient air to CGM at 90 % of maximum range. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.20"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-flow-spillover",
    "qname": "oiml-r144:test-flow-spillover",
    "slug": "oiml-r144-test-flow-spillover",
    "label": "Spillover of gas flow rates test",
    "description": "Verify low flow indicator responds correctly when gas flow rate is reduced below minimum and increased above maximum. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.21"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-leakproofness",
    "qname": "oiml-r144:test-leakproofness",
    "slug": "oiml-r144-test-leakproofness",
    "label": "Leakproofness test",
    "description": "Verify gas handling system is air-tight per R 144-1, 5.1.6. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-2:2013#clause-1.22"
  },
  {
    "uri": "https://w3id.org/standards/oiml/oiml-r144/test-visual-examination",
    "qname": "oiml-r144:test-visual-examination",
    "slug": "oiml-r144-test-visual-examination",
    "label": "Visual and technical examination",
    "description": "Verify that the gas analytical system meets all visual and technical requirements through inspection of construction, markings, display devices, and adjustment facilities. ",
    "ontology": "oiml-r144",
    "type": "individual",
    "instanceOf": [
      "oiml:ConformanceTest"
    ],
    "reference": "urn:oiml:pub:r:144-1:2013#clause-5"
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
  }
] as const

export const ontologyPrefixes = [{"prefix":"owl","uri":"http://www.w3.org/2002/07/owl#"},{"prefix":"rdf","uri":"http://www.w3.org/1999/02/22-rdf-syntax-ns#"},{"prefix":"rdfs","uri":"http://www.w3.org/2000/01/rdf-schema#"},{"prefix":"skos","uri":"http://www.w3.org/2004/02/skos/core#"},{"prefix":"dcterms","uri":"http://purl.org/dc/terms/"},{"prefix":"oiml","uri":"https://w3id.org/standards/oiml/ontologies/core/"},{"prefix":"oiml-pubtype","uri":"https://w3id.org/standards/oiml/taxonomies/publication-type/"},{"prefix":"smart","uri":"https://w3id.org/standards/smart/ontologies/core/"}] as const

export const ontologyImportChain = {"oiml:":{"imports":["smart:"],"description":"Core ontology for OIML International Recommendations. Defines classes and properties shared across all OIML standards, including the standard structure (Requirements, Tests, Test Report, Forms) and certification lifecycle (Authority, Certificate, Audit, Calibration).","version":"1.0.0"}} as const

export const ontologyTypeMeta = {"conceptScheme":{"label":"Concept Scheme","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"concept":{"label":"Concept","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"class":{"label":"Class","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"ontology":{"label":"Ontology","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"objectProperty":{"label":"Obj Prop","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"datatypeProperty":{"label":"Datatype Prop","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"annotationProperty":{"label":"Annot Prop","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"shape":{"label":"Shape","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"individual":{"label":"Individual","color":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300","colorDot":"bg-slate-500"},"external":{"label":"external","color":"bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400","colorDot":"bg-slate-400"}} as const

export const ontologyNamespaces = [
  {
    "prefix": "smart",
    "uri": "https://w3id.org/standards/smart/ontologies/core/",
    "title": "IEC-ISO SMART Core Ontology",
    "description": "Reference ontology for machine-actionable standards content, as defined by the IEC/ISO SMART project. Provides the Entity, Provision, PublicationDocument, and TermEntry primitives. The OIML Core Ontology is parallel to this — feature-equivalent where applicable, a superset for OIML's certification domain, and explicitly mapped rather than a subclass extension.",
    "color": "teal",
    "version": "2.0.0"
  },
  {
    "prefix": "oiml",
    "uri": "https://w3id.org/standards/oiml/ontologies/core/",
    "title": "OIML Core Ontology",
    "description": "Core ontology for OIML International Recommendations. Defines classes and properties shared across all OIML standards: standard structure (Requirements, Tests, Test Report, Forms) and certification lifecycle (Authority, Certificate, Audit, Calibration). Parallel to — and a superset of — the IEC-ISO SMART Core Ontology; the two are explicitly mapped rather than related by subclassing.",
    "color": "brand",
    "version": "1.0.0"
  },
  {
    "prefix": "oiml-pubtype",
    "uri": "https://w3id.org/standards/oiml/taxonomies/publication-type/",
    "title": "OIML Publication Type Taxonomy",
    "description": "A SKOS concept scheme enumerating the kinds of publication documents issued by OIML: International Recommendation (R), International Document (D), Basic Publication (B), Guide (G), Vocabulary (V), Bulletin (BL), and Expert Report (E).",
    "color": "amber",
    "version": "1.0.0"
  }
] as const

export type OntologyEntity = typeof ontologyEntities[number]
