'use strict'

const Command = require('ronin').Command
const Antaeus = require('../../../src/antaeus')

module.exports = Command.extend({
  desc: 'Start the Antaeus server',
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
    var server = new Antaeus({
      dnsConfig: dnsConfig,
      ipfsConfig: {
        host: ipfsHost,
        port: ipfsPort
      }
    })

    server.verify(dnsConfig, () => {
      // eslint-disable-next-line no-console
      console.log('Antaeus Verify')
    })
  }
})
