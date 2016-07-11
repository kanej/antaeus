/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const MockIpfs = require('./mocks/mockIpfs')
const ConfigLoader = require('../src/configLoader')

const validIPFSConfigAddress = 'example'

describe('Config Loader', () => {
  let errorMessage = ''

  beforeEach(() => {
    errorMessage = ''
  })

  const runVerify = function runVerify (mockIpfsConfig, done) {
    let ipfs = new MockIpfs(mockIpfsConfig)
    let configLoader = new ConfigLoader({ ipfs: ipfs })

    configLoader.verify(validIPFSConfigAddress)
          .catch((e) => {
            errorMessage = e
          })
          .finally(() => {
            done()
          })
  }

  describe('initialisation', () => {
    it('throws an error if there is no ipfs option provided', () => {
      expect(() => { return new ConfigLoader({ ipfs: null }) }).to.throw(Error)
    })
  })

  describe('for a valid config file on ipfs', () => {
    beforeEach((done) => {
      runVerify({ error: false, config: '{}' }, done)
    })

    it('returns successfully', () => {
      expect(errorMessage).to.be.empty
    })
  })

  describe('for a non-existant file on ipfs', () => {
    beforeEach((done) => {
      runVerify({ error: true, errorMessage: 'File not found' }, done)
    })

    it('returns a file not found error message', () => {
      expect(errorMessage).to.equal('File not found')
    })
  })

  describe('for a non-json file on ipfs', () => {
    beforeEach((done) => {
      runVerify({ error: false, config: '{]' }, done)
    })

    it('returns a parse error', () => {
      expect(errorMessage).to.equal('Parse Error - Not a valid json file at address example')
    })
  })

  describe('for a json file in the wrong format on ipfs', () => {
    beforeEach((done) => {
      const json = JSON.stringify({ invalid_key: [] })
      runVerify({ error: false, config: json }, done)
    })

    it('should error if the json object is not key/value pairs of strings', () => {
      expect(errorMessage).to.equal('DNS Config Error - the key invalid_key has value that is not a string.')
    })
  })

  describe('for a read error on ipfs', () => {
    beforeEach((done) => {
      runVerify({ readError: true }, done)
    })

    it('returns a connect error', () => {
      expect(errorMessage).to.equal('IPFS Read Error - the underlying ipfs stream threw StreamError')
    })
  })
})
