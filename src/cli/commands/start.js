'use strict'

const Command = require('ronin').Command
const Antaeus = require('../../../src/antaeus')

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
    }
  },
  run: (port, dnsConfig, ipfsHost, ipfsPort) => {
    var server = new Antaeus({
      port: port,
      dnsConfig: dnsConfig,
      ipfsConfig: {
        host: ipfsHost,
        port: ipfsPort
      }
    })

    server.start(() => {
      // eslint-disable-next-line no-console
      console.log(`Antaeus Server started on port ${port}`)
    })
  }
})
