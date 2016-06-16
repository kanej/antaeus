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
    ipfsConnection: {
      type: 'string',
      default: '/ip4/127.0.0.1/tcp/5001'
    }
  },
  run: (port, dnsConfig, ipfsConnection) => {
    var server = new Antaeus({
      port: port,
      dnsConfig: dnsConfig,
      ipfsConfig: {
        multiaddr: ipfsConnection
      }
    })

    server.start(() => {
      // eslint-disable-next-line no-console
      console.log(`Antaeus Server started on port ${port}`)
    })
  }
})
