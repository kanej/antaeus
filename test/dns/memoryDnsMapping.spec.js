/* eslint-env mocha */
/* eslint-disable no-unused-expressions, max-nested-callbacks */
'use strict'

const expect = require('chai').expect

const MemoryDnsMapping = require('../../src/dns/memoryDnsMapping')

describe('Memory DNS Mapping', () => {
  let mapping = {}
  const initialConfig = { 'www.example.com': '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u' }

  describe('initialisation', () => {
    describe('without an options object', () => {
      it('errors', () => {
        expect(() => { mapping = new MemoryDnsMapping() }).to.throw(Error)
      })
    })

    describe('without initial dns config', () => {
      beforeEach(() => {
        mapping = new MemoryDnsMapping({})
      })

      it('has an empty listing', () => {
        expect(mapping.listing).to.be.empty
      })
    })

    describe('with initial config', () => {
      beforeEach(() => {
        mapping = new MemoryDnsMapping({ dnsConfig: initialConfig })
      })

      it('leads to a populated listing', () => {
        expect(mapping.listing).to.not.be.empty
      })
    })
  })

  describe('api', () => {
    beforeEach(() => {
      mapping = new MemoryDnsMapping({ dnsConfig: initialConfig })
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

      it('inserts it into the listing', () => {
        expect(mapping.listing['www.example2.com']).to.equal('/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82')
      })
    })

    describe('deleting an address', () => {
      beforeEach((done) => {
        mapping.delete('www.example.com')
          .finally(done)
      })

      it('inserts it into the listing', () => {
        expect(mapping.listing['www.example.com']).to.be.undefined
      })
    })
  })
})
