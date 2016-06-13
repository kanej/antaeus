'use strict'

const _ = require('lodash/fp')
const express = require('express')
const ipfsAPI = require('ipfs-api')
const homeEndpoints = require('./controllers/home')

var Antaeus = function (options) {
  this.app = null
  this.ipfs = null

  this.defaultConfig = {
    port: 3001
  }

  if (_.isPlainObject(options)) {
    this.config = _.assign(this.defaultConfig, options)
  }

  this.init = function init () {
    this.app = express()
    this.ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })

    this.app.set('ipfs', this.ipfs)

    this.app.get('/', homeEndpoints.antaeusWelcomeMessage)
    this.app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)

    return this
  }

  this.start = function start (callback) {
    this.app.listen(this.config.port, callback)

    return this
  }

  return this.init()
}

module.exports = Antaeus
