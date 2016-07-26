'use strict'

const Command = require('ronin').Command
const Antaeus = require('../../../src/antaeus')
const Logger = require('../../../src/logger')

module.exports = Command.extend({
  desc: 'Verify an Antaeus DNS config file',
  options: {
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
    }
  },

  run: (dnsConfig, ipfsHost, ipfsPort) => {
    const logger = new Logger()

    const server = new Antaeus({
      dnsConfig: dnsConfig,
      ipfsConfig: {
        host: ipfsHost,
        port: ipfsPort
      },
      logger: logger
    })

    server.verify(dnsConfig)
      .catch((err) => {
        logger.error(err)
      })
  }
})
