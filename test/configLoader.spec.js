/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const MockIpfs = require('./mocks/mockIpfs')
const MockFs = require('./mocks/mockFs')
const ConfigLoader = require('../src/configLoader')

const ipfsAddress = 'QmfSnGmfexFsLDkbgN76Qhx2W8sxrNDobFEQZ6ER5qg2wW'

describe('Config Loader', () => {
  describe('initialisation', () => {
    it('throws an error if there is no ipfs option provided', () => {
      expect(() => { return new ConfigLoader({ ipfs: null }) }).to.throw(Error)
    })

    it('throws an error if there is no fs option provided', () => {
      expect(() => { return new ConfigLoader({ ipfs: {}, fs: null }) }).to.throw(Error)
    })
  })

  describe('retrieve command', () => {
    const expectedDnsConfig = { 'www.example.com': '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u' }
    let dnsConfig = {}
    let errorMessage = ''

    beforeEach(() => {
      errorMessage = ''
      dnsConfig = {}
    })

    const runVerify = function runVerify (configAddress, mockConfig, done) {
      let ipfs = new MockIpfs(mockConfig)
      let fs = new MockFs(mockConfig)
      let configLoader = new ConfigLoader({ ipfs: ipfs, fs: fs })

      configLoader.retrieve(configAddress)
        .then((config) => {
          dnsConfig = config
        })
        .catch((e) => {
          errorMessage = e.message.toString()
        })
        .finally(() => {
          done()
        })
    }

    describe('with no parameters', () => {
      beforeEach((done) => {
        runVerify(null, {}, done)
      })

      it('returns without error', () => {
        expect(errorMessage).to.be.empty
      })

      it('returns an empty config', () => {
        expect(dnsConfig).to.deep.equal({})
      })
    })

    describe('on filesystem', () => {
      describe('for a valid config file', () => {
        beforeEach((done) => {
          runVerify('./exampleDNSconfig.json', { config: JSON.stringify(expectedDnsConfig) }, done)
        })

        it('returns without error', () => {
          expect(errorMessage).to.be.empty
        })

        it('returns the dns config', () => {
          expect(dnsConfig).to.deep.equal(expectedDnsConfig)
        })
      })

      describe('for a non-existant file', () => {
        beforeEach((done) => {
          runVerify('./nonexistant.json', { fileExists: false }, done)
        })

        it('returns a file not found error', () => {
          expect(errorMessage).to.equal('File not found')
        })
      })

      describe('for a directory', () => {
        beforeEach((done) => {
          runVerify('./a_directory', { isDirectory: true }, done)
        })

        it('returns a is directory error', () => {
          expect(errorMessage).to.equal('Address is to a directory')
        })
      })

      describe('for a non-json file', () => {
        beforeEach((done) => {
          runVerify('./config.yaml', { config: '{]' }, done)
        })

        it('returns a parse error', () => {
          expect(errorMessage).to.equal('Parse Error - Not a valid json file at ./config.yaml')
        })
      })
    })

    describe('on ipfs', () => {
      describe('for a valid config file', () => {
        beforeEach((done) => {
          runVerify(ipfsAddress, { error: false, config: JSON.stringify(expectedDnsConfig) }, done)
        })

        it('returns without error', () => {
          expect(errorMessage).to.be.empty
        })

        it('returns the dns config', () => {
          expect(dnsConfig).to.deep.equal(expectedDnsConfig)
        })
      })

      describe('for a non-existant file', () => {
        beforeEach((done) => {
          runVerify(ipfsAddress, { error: true, errorMessage: 'File not found' }, done)
        })

        it('returns a file not found error message', () => {
          expect(errorMessage).to.equal('File not found')
        })
      })

      describe('for a non-json file', () => {
        beforeEach((done) => {
          runVerify(ipfsAddress, { config: '{]' }, done)
        })

        it('returns a parse error', () => {
          expect(errorMessage).to.equal('Parse Error - Not a valid json file at address QmfSnGmfexFsLDkbgN76Qhx2W8sxrNDobFEQZ6ER5qg2wW')
        })
      })

      describe('for a json file in the wrong format', () => {
        beforeEach((done) => {
          const json = JSON.stringify({ invalid_key: [] })
          runVerify(ipfsAddress, { config: json }, done)
        })

        it('should error if the json object is not key/value pairs of strings', () => {
          expect(errorMessage).to.equal('DNS Config Error - the key invalid_key has value that is not a string.')
        })
      })

      describe('for a read error', () => {
        beforeEach((done) => {
          runVerify(ipfsAddress, { readError: true }, done)
        })

        it('returns a connect error', () => {
          expect(errorMessage).to.equal('IPFS Read Error - the underlying ipfs stream threw StreamError')
        })
      })
    })
  })
})
