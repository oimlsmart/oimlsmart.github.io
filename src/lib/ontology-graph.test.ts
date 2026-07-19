import { describe, it, expect } from 'vitest'
import {
  ancestors,
  descendants,
  children,
  siblings,
  propertiesOfClass,
  inheritedProperties,
  instancesOf,
  whereUsed,
  relatedBySeeAlso,
} from './ontology-graph'
import type { OntologyEntity } from '../data/ontology-domain'

// Fixture: a miniature ontology graph that exercises every traversal
// function. All entities use ontology: 'oiml' (a known prefix).
const E = (partial: Partial<OntologyEntity> & { qname: string; slug: string }): OntologyEntity => ({
  uri: `https://example.org/${partial.qname}`,
  label: partial.qname.split(':').pop() || partial.qname,
  description: '',
  ontology: 'oiml',
  type: 'class',
  ...partial,
})

const fixture: OntologyEntity[] = [
  E({ qname: 'oiml:Entity', slug: 'Entity', type: 'class' }),
  E({ qname: 'oiml:Device', slug: 'Device', type: 'class', parent: 'oiml:Entity' }),
  E({ qname: 'oiml:LoadCell', slug: 'LoadCell', type: 'class', parent: 'oiml:Device' }),
  E({ qname: 'oiml:Scale', slug: 'Scale', type: 'class', parent: 'oiml:Device' }),
  E({ qname: 'oiml:DigitalScale', slug: 'DigitalScale', type: 'class', parent: 'oiml:Scale' }),
  E({ qname: 'oiml:hasDevice', slug: 'hasDevice', type: 'objectProperty', domain: ['oiml:Entity'], range: ['oiml:Device'] }),
  E({ qname: 'oiml:hasLoad', slug: 'hasLoad', type: 'objectProperty', domain: ['oiml:Device'], range: ['oiml:LoadCell'] }),
  E({ qname: 'oiml:serial', slug: 'serial', type: 'datatypeProperty', domain: ['oiml:Device'] }),
  E({ qname: 'oiml:R60', slug: 'R60', type: 'individual', instanceOf: ['oiml:LoadCell'] }),
  E({ qname: 'oiml:R76', slug: 'R76', type: 'individual', instanceOf: ['oiml:Scale'] }),
  E({ qname: 'oiml:seeAlsoRef', slug: 'seeAlsoRef', type: 'class', parent: 'oiml:Entity', seeAlso: ['oiml:Device'] }),
]

describe('ontology-graph', () => {
  const entity = (qname: string) => fixture.find((e) => e.qname === qname)!

  describe('ancestors', () => {
    it('walks the parent chain root-first', () => {
      const chain = ancestors(entity('oiml:DigitalScale'), fixture)
      expect(chain.map((e) => e.qname)).toEqual(['oiml:Entity', 'oiml:Device', 'oiml:Scale'])
    })

    it('returns empty for a root', () => {
      expect(ancestors(entity('oiml:Entity'), fixture)).toEqual([])
    })

    it('handles cycles gracefully', () => {
      const cyclic: OntologyEntity[] = [
        E({ qname: 'a:A', slug: 'a', parent: 'a:B' }),
        E({ qname: 'a:B', slug: 'b', parent: 'a:A' }),
      ]
      expect(ancestors(cyclic[0], cyclic).length).toBeLessThanOrEqual(2)
    })
  })

  describe('descendants', () => {
    it('returns all transitive children', () => {
      const desc = descendants(entity('oiml:Device'), fixture)
      const qnames = desc.map((e) => e.qname).sort()
      expect(qnames).toEqual(['oiml:DigitalScale', 'oiml:LoadCell', 'oiml:Scale'])
    })

    it('returns empty for a leaf', () => {
      expect(descendants(entity('oiml:LoadCell'), fixture)).toEqual([])
    })
  })

  describe('children', () => {
    it('returns direct children only', () => {
      const kids = children(entity('oiml:Device'), fixture)
      expect(kids.map((e) => e.qname).sort()).toEqual(['oiml:LoadCell', 'oiml:Scale'])
    })
  })

  describe('siblings', () => {
    it('returns entities with the same parent', () => {
      const sibs = siblings(entity('oiml:LoadCell'), fixture)
      expect(sibs.map((e) => e.qname)).toEqual(['oiml:Scale'])
    })

    it('returns empty for a root', () => {
      expect(siblings(entity('oiml:Entity'), fixture)).toEqual([])
    })
  })

  describe('propertiesOfClass', () => {
    it('finds properties where domain is this class', () => {
      const props = propertiesOfClass(entity('oiml:Device'), fixture)
      expect(props.map((e) => e.qname).sort()).toEqual(['oiml:hasLoad', 'oiml:serial'])
    })

    it('returns empty for non-class', () => {
      expect(propertiesOfClass(entity('oiml:R60'), fixture)).toEqual([])
    })
  })

  describe('inheritedProperties', () => {
    it('finds properties from ancestors but not self', () => {
      // Scale inherits from Entity (hasDevice) and Device (hasLoad, serial)
      const inherited = inheritedProperties(entity('oiml:Scale'), fixture)
      expect(inherited.map((e) => e.qname).sort()).toEqual(['oiml:hasDevice', 'oiml:hasLoad', 'oiml:serial'])
    })

    it('does not duplicate own properties', () => {
      // Device has its own props; Entity has hasDevice. Device should inherit hasDevice.
      const inherited = inheritedProperties(entity('oiml:Device'), fixture)
      expect(inherited.map((e) => e.qname)).toEqual(['oiml:hasDevice'])
    })
  })

  describe('instancesOf', () => {
    it('finds individuals instanceOf this class', () => {
      const insts = instancesOf(entity('oiml:LoadCell'), fixture)
      expect(insts.map((e) => e.qname)).toEqual(['oiml:R60'])
    })

    it('finds individuals instanceOf descendants', () => {
      // Device → Scale → R76
      const insts = instancesOf(entity('oiml:Device'), fixture)
      const qnames = insts.map((e) => e.qname).sort()
      expect(qnames).toEqual(['oiml:R60', 'oiml:R76'])
    })
  })

  describe('whereUsed', () => {
    it('finds back-references', () => {
      const used = whereUsed(entity('oiml:Device'), fixture)
      const contexts = used.map((u) => `${u.entity.qname}:${u.context}`).sort()
      // LoadCell and Scale subclass Device; hasLoad and serial have domain Device; hasDevice has range Device
      expect(contexts).toContain('oiml:LoadCell:subClassOf')
      expect(contexts).toContain('oiml:Scale:subClassOf')
      expect(contexts).toContain('oiml:hasLoad:domain')
      expect(contexts).toContain('oiml:serial:domain')
      expect(contexts).toContain('oiml:hasDevice:range')
    })
  })

  describe('relatedBySeeAlso', () => {
    it('resolves seeAlso qnames to entities', () => {
      const related = relatedBySeeAlso(entity('oiml:seeAlsoRef'), fixture)
      expect(related.map((e) => e.qname)).toEqual(['oiml:Device'])
    })
  })
})
