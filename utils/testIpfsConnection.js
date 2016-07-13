'use strict'

const http = require('http')
const Promise = require('bluebird')
const ConnectionRetrier = require('../src/connectionRetrier')

var retrier = new ConnectionRetrier()

retrier.ensureConnection('localhost', 5001).then((body) => {
  console.log('IPFS Daemon available')
}).catch((e) => {
  console.error(e)
})
