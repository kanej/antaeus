/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const nock = require('nock')
const expect = require('chai').expect

const DaemonChecker = require('../src/daemonChecker')

describe('Daemon Checker', () => {
  let checker = {}

  let connectionMade = false
  let error = false
  let errorMessage = ''

  beforeEach(() => {
    connectionMade = false
    error = false
    errorMessage = ''
  })

  const runEnsureConnection = (done) => {
    checker = new DaemonChecker({
      retries: 5,
      delay: 0,
      logger: { info: () => {} }
    })
    checker.ensureConnection('localhost', 5001)
      .then(() => {
        connectionMade = true
      })
      .catch((e) => {
        error = true
        errorMessage = e.message
      })
      .finally(() => {
        done()
      })
  }

  const mockDaemonConnectionSuccess = () => {
    nock('http://localhost:5001', { encodedQueryParams: true, retries: 5 })
      .get('/')
      .reply(404, '404 page not found\n', {
        'content-type': 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
        date: 'Wed, 13 Jul 2016 15:10:45 GMT',
        'content-length': '19',
        connection: 'close'
      })
  }

  const mockMalfunctioningDaemonConnectionSuccess = () => {
    nock('http://localhost:5001', { encodedQueryParams: true, retries: 5 })
      .get('/')
      .reply(200, 'Ok', {
        'content-type': 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
        date: 'Wed, 13 Jul 2016 15:10:45 GMT',
        'content-length': '19',
        connection: 'close'
      })
  }

  const mockDaemonConnectionFailure = (numberOfFailures, errorMessage, errorCode) => {
    nock('http://localhost:5001', { encodedQueryParams: true, retries: 5 })
      .get('/')
      .times(numberOfFailures)
      .replyWithError({ message: errorMessage, code: errorCode })
  }

  describe('initialisation', () => {
    beforeEach(() => {
      checker = new DaemonChecker()
    })

    it('defaults to 10 retries', () => {
      expect(checker.retries).to.equal(10)
    })

    it('defaults to a second for the delay', () => {
      expect(checker.delay).to.equal(1000)
    })

    it('defaults to a noop object for the logger', () => {
      expect(checker.logger.info).to.not.be.null
    })
  })

  describe('with a running IPFS daemon', () => {
    beforeEach((done) => {
      mockDaemonConnectionSuccess()
      runEnsureConnection(done)
    })

    it('returns when the connection responds with \'404 not found\'', () => {
      expect(connectionMade).to.equal(true)
    })
  })

  describe('without a running IPFS daemon', () => {
    beforeEach((done) => {
      mockDaemonConnectionFailure(5, 'Connection Error', 'ECONNREFUSED')
      runEnsureConnection(done)
    })

    it('returns a connection error', () => {
      expect(error).to.equal(true)
      expect(errorMessage).to.equal('Could not connect')
    })
  })

  describe('a malfunctioning IPFS daemon', () => {
    beforeEach((done) => {
      mockMalfunctioningDaemonConnectionSuccess()
      runEnsureConnection(done)
    })

    it('returns a connection error', () => {
      expect(error).to.equal(true)
      expect(errorMessage).to.equal('Unexpected response: Ok')
    })
  })

  describe('with an IPFS daemon that is booting', () => {
    beforeEach((done) => {
      mockDaemonConnectionFailure(3, 'Connection Error', 'ECONNREFUSED')
      mockDaemonConnectionSuccess()
      runEnsureConnection(done)
    })

    it('returns when the connection responds with \'404 not found\'', () => {
      expect(connectionMade).to.equal(true)
    })
  })

  describe('with network failures', () => {
    beforeEach((done) => {
      mockDaemonConnectionFailure(5, 'Network Error', 'UNSEENNETWORKERROR')
      runEnsureConnection(done)
    })

    it('returns a connection error', () => {
      expect(error).to.equal(true)
      expect(errorMessage).to.equal('Network Error')
    })
  })
})
