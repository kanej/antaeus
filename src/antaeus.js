'use strict'

const _ = require('lodash/fp')
const fs = require('fs')
const express = require('express')
const ipfsAPI = require('ipfs-api')
const Promise = require('bluebird')
const homeEndpoints = require('./controllers/home')
const hostnameToIPFSRewrite = require('./middleware/hostname-to-ipfs-rewrite-middleware')
const ConfigLoader = require('./configLoader')

var Antaeus = function (options) {
  this.app = null
  this.ipfs = null

  this.dnsConfigLoader = null
  this.dnsConfig = {}

  this.defaultConfig = {
    port: 3001,
    dnsConfig: null,
    ipfsConfig: {
      host: 'localhost',
      port: 5001
    }
  }

  if (_.isPlainObject(options)) {
    this.config = _.assign(this.defaultConfig, options)
  }

  this.initPromise = null

  this.start = function start (callback) {
    this._init().then(() => {
      this.app.listen(this.config.port, callback)
    })

    return this
  }

  this.verify = function verify (configAddress) {
    return this._init().then(() => { this.dnsConfigLoader.retrieve(configAddress) })
  }

  // Helpers
  this._init = function init () {
    return new Promise((resolve, reject) => {
      this.app = express()
      this.ipfs = ipfsAPI(this.config.ipfsConfig.host, this.config.ipfsConfig.port)

      this.dnsConfigLoader = new ConfigLoader({ ipfs: this.ipfs, fs: fs })

      this.dnsConfigLoader.retrieve(this.config.dnsConfig)
        .then((dnsConfig) => {
          this.dnsConfig = dnsConfig
          this.app.set('ipfs', this.ipfs)

          this.app.use(hostnameToIPFSRewrite.rewrite(this.dnsConfig))

          this.app.get('/', homeEndpoints.antaeusWelcomeMessage)
          this.app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)
          resolve()
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e)
        })
    })
  }
}

module.exports = Antaeus
