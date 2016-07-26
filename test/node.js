/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const expect = require('chai').expect

describe('Routes', () => {
  const homeEndpoints = require('../src/controllers/home')

  describe('GET /', () => {
    let req = {}
    let res = {}

    beforeEach(() => {
      res.send = sinon.spy()
      homeEndpoints.antaeusWelcomeMessage(req, res)
    })

    it('show the welcome message', () => {
      expect(res.send.calledWith('Welcome to Antaeus')).to.equal(true)
    })
  })

  describe('GET /ipfs/...', () => {
    let ipfs = {}
    let logger = {
      error: function noop () {}
    }
    let req = {
      url: '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
      app: { get: (name) => { return name === 'logger' ? logger : ipfs } }
    }
    let res = {}

    let requestedFile = {}
    let requestedIndexFile = {}

    beforeEach(() => {
      ipfs.cat = sinon.stub()

      requestedFile.pipe = sinon.spy()
      requestedIndexFile.pipe = sinon.spy()

      res.status = sinon.stub()
      res.send = sinon.spy()
      res.status.returnsThis()
    })

    describe('an individual file', () => {
      describe('looked up by a valid address', () => {
        beforeEach(() => {
          ipfs.cat.callsArgWith(1, null, requestedFile)
          homeEndpoints.routeToIPFS(req, res)
        })

        it('returns the file', () => {
          expect(requestedFile.pipe.calledOnce).to.equal(true)
        })
      })

      describe('looked up by an invalid address', () => {
        beforeEach(() => {
          ipfs.cat.callsArgWith(1, 'Not a valid address', null)
          homeEndpoints.routeToIPFS(req, res)
        })

        it('returns a 500 http status code', () => {
          expect(res.status.calledWith(500)).to.equal(true)
        })

        it('returns the error message', () => {
          expect(res.send.calledWith('Not a valid address')).to.equal(true)
        })
      })
    })

    describe('a directory', () => {
      describe('looked up by a valid address', () => {
        beforeEach(() => {
          ipfs.cat.onFirstCall().callsArgWith(1, { message: 'this dag node is a directory' }, null)
        })

        describe('with an index.html file', () => {
          beforeEach(() => {
            ipfs.cat.onSecondCall().callsArgWith(1, null, requestedIndexFile)
            homeEndpoints.routeToIPFS(req, res)
          })

          it('returns the index.html page', () => {
            expect(requestedIndexFile.pipe.calledOnce).to.equal(true)
          })
        })

        describe('without an index.html file', () => {
          beforeEach(() => {
            ipfs.cat.onSecondCall().callsArgWith(1, 'Not a valid address', null)
            homeEndpoints.routeToIPFS(req, res)
          })

          it('returns a 500 status code', () => {
            expect(res.status.calledWith(500)).to.equal(true)
          })

          it('returns the error message', () => {
            expect(res.send.calledWith('Not a valid address')).to.equal(true)
          })
        })
      })
    })
  })
})
