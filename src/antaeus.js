'use strict'

const _ = require('lodash/fp')
const fs = require('fs')
const express = require('express')
const ipfsAPI = require('ipfs-api')
const homeEndpoints = require('./controllers/home')
const hostnameToIPFSRewrite = require('./middleware/hostname-to-ipfs-rewrite-middleware')
const ConfigLoader = require('./configLoader')
const DaemonChecker = require('./daemonChecker')

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
    const ipfsHost = this.config.ipfsConfig.host
    const ipfsPort = this.config.ipfsConfig.port

    this.daemonChecker = new DaemonChecker({ retries: 20 })

    return this.daemonChecker.ensureConnection(ipfsHost, ipfsPort)
      .then(() => {
        this.ipfs = ipfsAPI(ipfsHost, ipfsPort)

        this.dnsConfigLoader = new ConfigLoader({ ipfs: this.ipfs, fs: fs })
        return this.dnsConfigLoader.retrieve(this.config.dnsConfig)
      })
      .then((dnsConfig) => {
        this.dnsConfig = dnsConfig

        this.app = express()
        this.app.set('ipfs', this.ipfs)

        this.app.use(hostnameToIPFSRewrite.rewrite(this.dnsConfig))

        this.app.get('/', homeEndpoints.antaeusWelcomeMessage)
        this.app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)
      })
  }
}

module.exports = Antaeus
