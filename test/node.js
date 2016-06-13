/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const expect = require('chai').expect

describe('Routes', () => {
  const homeEndpoints = require('../src/controllers/home')

  describe('GET /', () => {
    it('show the welcome message', () => {
      const req = {}
      const res = {}
      res.send = sinon.spy()

      homeEndpoints.antaeusWelcomeMessage(req, res)

      expect(res.send.calledWith('Welcome to Antaeus')).to.equal(true)
    })
  })

  describe('GET /ipfs/...', () => {
    let ipfs = {}
    let req = {
      url: '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
      app: { get: () => { return ipfs } }
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
      it('returns the file when it is a valid address', () => {
        ipfs.cat.callsArgWith(1, null, requestedFile)

        homeEndpoints.routeToIPFS(req, res)

        expect(requestedFile.pipe.calledOnce).to.equal(true)
      })

      it('returns the index.html page if the address is a directory with an index.html', () => {
        ipfs.cat.onFirstCall().callsArgWith(1, { message: 'this dag node is a directory' }, null)
        ipfs.cat.onSecondCall().callsArgWith(1, null, requestedIndexFile)

        homeEndpoints.routeToIPFS(req, res)

        expect(requestedIndexFile.pipe.calledOnce).to.equal(true)
      })

      it('return a 500 if it is not a valid address', () => {
        ipfs.cat.callsArgWith(1, 'Not a valid address', null)

        homeEndpoints.routeToIPFS(req, res)

        expect(res.status.calledWith(500))
        expect(res.send.calledOnce)
      })

      it('return a 500 if the address is a directory without an index.html', () => {
        ipfs.cat.onFirstCall().callsArgWith(1, { message: 'this dag node is a directory' }, null)
        ipfs.cat.onSecondCall().callsArgWith(1, 'Not a valid address', null)

        homeEndpoints.routeToIPFS(req, res)

        expect(res.status.calledWith(500))
        expect(res.send.calledOnce)
      })
    })
  })
})
