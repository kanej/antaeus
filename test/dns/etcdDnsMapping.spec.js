/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const MockEtcd = require('../mocks/mockEtcd')

const EtcdDnsMapping = require('../../src/dns/etcdDnsMapping')

describe('Etcd DNS Mapping', () => {
  const initialConfig = { 'www.example.com': '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u' }

  let mapping = {}
  let mockEtcd = new MockEtcd()

  beforeEach(() => {
    mockEtcd = new MockEtcd()
  })

  describe('initialisation', () => {
    describe('without an options object', () => {
      it('errors', () => {
        expect(() => { mapping = new EtcdDnsMapping() }).to.throw(Error)
      })
    })

    describe('without initial dns config', () => {
      beforeEach(() => {
        mapping = new EtcdDnsMapping({ etcd: mockEtcd })
      })

      it('has an empty listing', () => {
        expect(mapping.listing).to.be.empty
      })
    })

    describe('without etcd option', () => {
      it('errors', () => {
        expect(() => { mapping = new EtcdDnsMapping({}) }).to.throw(Error)
      })
    })

    describe('with initial dns config', () => {
      beforeEach(() => {
        mapping = new EtcdDnsMapping({ etcd: mockEtcd, dnsConfig: initialConfig })
      })

      it('leads to a populated listing', () => {
        expect(mapping.listing).to.not.be.empty
      })
    })

    describe('with a logger', () => {
      let givenLogger = { example: true }

      beforeEach(() => {
        mapping = new EtcdDnsMapping({ etcd: mockEtcd, logger: givenLogger })
      })

      it('uses that', () => {
        expect(mapping.logger).to.equal(givenLogger)
      })
    })
  })

  describe('api', () => {
    beforeEach(() => {
      mapping = new EtcdDnsMapping({ etcd: mockEtcd, dnsConfig: initialConfig })
    })

    describe('lookup', () => {
      it('by url', () => {
        expect(mapping.lookup('www.example.com')).to.equal('/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
      })
    })

    describe('adding an address', () => {
      beforeEach(() => {
        mapping.add('www.example2.com', '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82')
      })

      it('makes it available in the listing', () => {
        expect(mapping.listing['www.example2.com']).to.equal('/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82')
      })
    })

    describe('deleting an address', () => {
      beforeEach(() => {
        mapping.delete('www.example.com')
      })

      it('removes it from the listing', () => {
        expect(mapping.listing['www.example.com']).to.be.undefined
      })
    })

    describe('an unknown etcd action', () => {
      it('does not error', () => {
        expect(() => { mockEtcd.unknownAction() }).to.not.throw(Error)
      })
    })
  })
})
