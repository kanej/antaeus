/* eslint-env mocha */
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

  describe('lookup', () => {
    beforeEach(() => {
      mapping = new MemoryDnsMapping({ dnsConfig: initialConfig })
    })

    it('by url', () => {
      expect(mapping.lookup('www.example.com')).to.equal('/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
    })
  })

  it('allows adding a new mapping')
  it('allows deleting an address mapping')
})
