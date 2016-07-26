'use strict'

const http = require('http')
const Promise = require('bluebird')
const DaemonChecker = require('../src/daemonChecker')
const Logger = require('../src/logger')

var logger = new Logger()
var retrier = new DaemonChecker({ logger: logger })

retrier.ensureConnection('localhost', 5001).then((body) => {
  console.log('IPFS Daemon available')
}).catch((e) => {
  console.error(e)
})
