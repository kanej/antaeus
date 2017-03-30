/* eslint-env mocha */
/* eslint-disable no-unused-expressions, max-nested-callbacks */
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
      beforeEach((done) => {
        mapping.add('www.example2.com', '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82')
          .finally(done)
      })

      it('makes it available in the listing', () => {
        expect(mapping.listing['www.example2.com']).to.equal('/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82')
      })
    })

    describe('adding an address with an etcd error', () => {
      let error = ''

      beforeEach((done) => {
        mapping.etcd.setError = new Error('ETCD went bad')
        mapping.add('www.example2.com', '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82')
          .catch((err) => { error = err.message })
          .finally(done)
      })

      it('errors', () => {
        expect(error).to.not.be.empty
      })
    })

    describe('deleting an address', () => {
      beforeEach((done) => {
        mapping.delete('www.example.com').finally(done)
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
