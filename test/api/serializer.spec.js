/* eslint-env mocha */
'use strict'

const Serializer = require('../../src/api/serializer')
const expect = require('chai').expect

describe('Serializer', () => {
  let serializer = new Serializer()

  describe('on dnsentries', () => {
    const exampleDnsentry = { address: 'www.example.com', ipfsPath: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u' }
    const exampleDnsentry2 = { address: 'www.example2.com', ipfsPath: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82' }

    describe('as a single item', () => {
      var singleItem = null

      beforeEach(() => {
        singleItem = serializer.serialize('dnsentries', exampleDnsentry)
      })

      it('converts it to api.json', () => {
        const expectedResponse = {
          data: {
            id: 'www.example.com',
            type: 'dnsentries',
            attributes: {
              address: 'www.example.com',
              'ipfs-path': 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
            }
          }
        }
        expect(singleItem).to.deep.equal(expectedResponse)
      })
    })

    describe('as a list', () => {
      var list = null

      beforeEach(() => {
        list = serializer.serialize('dnsentries', [exampleDnsentry, exampleDnsentry2])
      })

      it('converts it to api.json', () => {
        const expectedResponse = {
          data: [
            {
              id: 'www.example.com',
              type: 'dnsentries',
              attributes: {
                address: 'www.example.com',
                'ipfs-path': 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
              }
            },
            {
              id: 'www.example2.com',
              type: 'dnsentries',
              attributes: {
                address: 'www.example2.com',
                'ipfs-path': 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82'
              }
            }
          ]
        }
        expect(list).to.deep.equal(expectedResponse)
      })
    })
  })

  describe('on pins', () => {
    const examplePin = { ipfsPath: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u' }
    const examplePin2 = { ipfsPath: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82' }

    describe('as a single item', () => {
      var singleItem = null

      beforeEach(() => {
        singleItem = serializer.serialize('pins', examplePin)
      })

      it('converts it to api.json', () => {
        const expectedResponse = {
          data: {
            id: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
            type: 'pins',
            attributes: {
              'ipfs-path': 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
            }
          }
        }
        expect(singleItem).to.deep.equal(expectedResponse)
      })
    })

    describe('as a list', () => {
      var list = null

      beforeEach(() => {
        list = serializer.serialize('pins', [examplePin, examplePin2])
      })

      it('converts it to api.json', () => {
        const expectedResponse = {
          data: [
            {
              id: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
              type: 'pins',
              attributes: {
                'ipfs-path': 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
              }
            },
            {
              id: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82',
              type: 'pins',
              attributes: {
                'ipfs-path': 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs82'
              }
            }
          ]
        }
        expect(list).to.deep.equal(expectedResponse)
      })
    })
  })

  describe('on an unknown type', () => {
    it('throws an error', () => {
      expect(() => { serializer.serialize('unknown', {}) }).to.throw(Error)
    })
  })
})
