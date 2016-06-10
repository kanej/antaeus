/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const expect = require('chai').expect

describe('Routes', () => {
  const homeEndpoints = require('../src/controllers/home')

  describe('GET /', () => {
    it('should run a test', () => {
      const req = {}
      const res = {}
      res.send = sinon.spy()

      homeEndpoints.antaeusWelcomeMessage(req, res)

      expect(res.send.calledWith('Welcome to Antaeus')).to.equal(true)
    })
  })
})

