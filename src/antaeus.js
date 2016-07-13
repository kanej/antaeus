'use strict'

const _ = require('lodash/fp')
const fs = require('fs')
const express = require('express')
const ipfsAPI = require('ipfs-api')
const Promise = require('bluebird')
const morgan = require('morgan')

const homeEndpoints = require('./controllers/home')
const hostnameToIPFSRewrite = require('./middleware/hostname-to-ipfs-rewrite-middleware')
const ConfigLoader = require('./configLoader')
const Logger = require('./logger')

var Antaeus = function (options) {
  const opts = options || {}

  this.app = null
  this.ipfs = null
  this.logger = opts.logger ? opts.logger : null

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
    delete this.config.logger
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
      this.logger = this.logger ? this.logger : new Logger()
      this.app = express()
      this.ipfs = ipfsAPI(this.config.ipfsConfig.host, this.config.ipfsConfig.port)

      this.dnsConfigLoader = new ConfigLoader({ ipfs: this.ipfs, fs: fs })

      this.dnsConfigLoader.retrieve(this.config.dnsConfig)
        .then((dnsConfig) => {
          this.dnsConfig = dnsConfig

          this.app.set('ipfs', this.ipfs)
          this.app.set('logger', this.logger)

          const middlewareLogging = morgan('combined', {
            stream: {
              write: (message, encoding) => {
                this.logger.info(message)
              }
            }
          })

          this.app.use(middlewareLogging)
          this.app.use(hostnameToIPFSRewrite.rewrite(this.dnsConfig))

          this.app.get('/', homeEndpoints.antaeusWelcomeMessage)
          this.app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)
          resolve()
        })
        .catch((e) => {
          this.logger.error(e)
        })
    })
  }
}

module.exports = Antaeus
