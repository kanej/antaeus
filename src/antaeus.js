'use strict'

const fs = require('fs')
const _ = require('lodash/fp')
const express = require('express')
const ipfsAPI = require('ipfs-api')
const homeEndpoints = require('./controllers/home')
const hostnameToIPFSRewrite = require('./middleware/hostname-to-ipfs-rewrite-middleware')

var Antaeus = function (options) {
  this.app = null
  this.ipfs = null

  this.dnsConfig = {}

  this.defaultConfig = {
    port: 3001,
    dnsConfig: null
  }

  if (_.isPlainObject(options)) {
    this.config = _.assign(this.defaultConfig, options)
  }

  this.init = function init () {
    this._initDNSConfig()

    this.app = express()
    this.ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })

    this.app.set('ipfs', this.ipfs)

    this.app.use(hostnameToIPFSRewrite.rewrite(this.dnsConfig))

    this.app.get('/', homeEndpoints.antaeusWelcomeMessage)
    this.app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)

    return this
  }

  this.start = function start (callback) {
    this.app.listen(this.config.port, callback)

    return this
  }

  // Helpers

  this._initDNSConfig = function _initDNSConfig () {
    if (this.config.dnsConfig) {
      try {
        const stats = fs.lstatSync(this.config.dnsConfig)

        if (!stats.isFile()) {
          throw new Error('The given DNS config json file is not a file')
        }
      } catch (e) {
        throw new Error('Could not find the given DNS config json file')
      }

      const dnsConfigRaw = fs.readFileSync(this.config.dnsConfig)

      try {
        this.dnsConfig = JSON.parse(dnsConfigRaw)
      } catch (e) {
        throw new Error('Unable to parse the given DNS config json file')
      }
    } else {
      this.dnsConfig = {}
    }
  }

  return this.init()
}

module.exports = Antaeus
