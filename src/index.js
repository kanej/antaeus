'use strict'

const Antaeus = require('./antaeus')
const Logger = require('./logger')

const logger = new Logger()

const config = {
  port: 3001,
  dnsConfig: null,
  ipfsConfig: {
    host: 'localhost',
    port: 5001
  },
  logger: logger,
  enableEtcd: true,
  etcdUrl: 'http://localhost:2379',
  jwtConfig: {
    accessKey: 'user',
    secretKey: 'example'
  }
}

if (process.argv.length === 3) {
  config.dnsConfig = process.argv[2]
}

var server = new Antaeus(config)

server.start(() => {
  logger.info(`Antaeus Server running on port ${config.port}.`)
})
