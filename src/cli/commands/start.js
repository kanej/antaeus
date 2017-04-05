'use strict'

const Command = require('ronin').Command
const Antaeus = require('../../../src/antaeus')
const Logger = require('../../../src/logger')

module.exports = Command.extend({
  desc: 'Start the Antaeus server',
  options: {
    port: {
      default: 3001
    },
    dnsConfig: {
      type: 'string'
    },
    ipfsHost: {
      type: 'string',
      default: '127.0.0.1'
    },
    ipfsPort: {
      type: 'string',
      default: '5001'
    },
    enableEtcd: {
      type: 'boolean',
      default: false
    },
    etcdUrl: {
      type: 'string',
      default: 'http://localhost:2379'
    },
    accessKey: {
      type: 'string'
    },
    secretKey: {
      type: 'string'
    }
  },
  run: (port, dnsConfig, ipfsHost, ipfsPort, enableEtcd, etcdUrl, accessKey, secretKey) => {
    const logger = new Logger()

    const server = new Antaeus({
      port: port,
      dnsConfig: dnsConfig,
      ipfsConfig: {
        host: ipfsHost,
        port: ipfsPort
      },
      enableEtcd: enableEtcd,
      etcdUrl: etcdUrl,
      logger: logger,
      jwtConfig: {
        accessKey: accessKey,
        secretKey: secretKey
      }
    })

    server.start(() => {
      logger.info(`Antaeus Server started on port ${port}`)
    })
  }
})
