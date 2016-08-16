'use strict'

const _ = require('lodash/fp')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const ipfsAPI = require('ipfs-api')
const morgan = require('morgan')
const Etcd = require('node-etcd')

const homeEndpoints = require('./controllers/home')
const apiEndpoints = require('./controllers/api')
const hostnameToIPFSRewrite = require('./middleware/hostname-to-ipfs-rewrite-middleware')
const ConfigLoader = require('./configLoader')
const MemoryDnsMapping = require('./dns/memoryDnsMapping')
const EtcdDnsMapping = require('./dns/etcdDnsMapping')
const DaemonChecker = require('./daemonChecker')
const Serializer = require('./api/serializer')
const Logger = require('./logger')

var Antaeus = function (options) {
  const opts = options || {}

  this.app = null
  this.ipfs = null
  this.logger = opts.logger ? opts.logger : null

  this.dnsConfigLoader = null
  this.dnsMapping = null

  this.defaultConfig = {
    port: 3001,
    dnsConfig: null,
    ipfsConfig: {
      host: 'localhost',
      port: 5001
    },
    enableEtcd: false,
    etcdUrl: 'http://localhost:2379'
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
    this.logger = this.logger ? this.logger : new Logger()
    this.serializer = new Serializer()

    const ipfsHost = this.config.ipfsConfig.host
    const ipfsPort = this.config.ipfsConfig.port

    this.daemonChecker = new DaemonChecker({ retries: 20, logger: this.logger })

    return this.daemonChecker.ensureConnection(ipfsHost, ipfsPort)
      .then(() => {
        this.ipfs = ipfsAPI(ipfsHost, ipfsPort)

        this.dnsConfigLoader = new ConfigLoader({ ipfs: this.ipfs, fs: fs })
        return this.dnsConfigLoader.retrieve(this.config.dnsConfig)
      })
      .then((dnsConfig) => {
        if (this.config.enableEtcd) {
          this.logger.info('Connecting to Etcd at ' + this.config.etcdUrl)
          return new EtcdDnsMapping({
            etcd: new Etcd(this.config.etcdUrl),
            dnsConfig: dnsConfig,
            logger: this.logger
          })
        } else {
          return new MemoryDnsMapping({ dnsConfig: dnsConfig })
        }
      })
      .then((dnsMapping) => {
        this.dnsMapping = dnsMapping

        this.app = express()

        this.app.set('ipfs', this.ipfs)
        this.app.set('serializer', this.serializer)
        this.app.set('logger', this.logger)
        this.app.set('dnsMapping', this.dnsMapping)

        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())

        const middlewareLogging = morgan('combined', {
          stream: {
            write: (message, encoding) => {
              this.logger.info(message)
            }
          }
        })

        this.app.use(middlewareLogging)
        this.app.use(hostnameToIPFSRewrite.rewrite(this.dnsMapping))

        this.app.get('/', homeEndpoints.antaeusWelcomeMessage)

        apiEndpoints.setup(this.app)

        this.app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)
      })
  }
}

module.exports = Antaeus
