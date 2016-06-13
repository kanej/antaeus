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
    }
  },
  run: (port, dnsConfig) => {
    var server = new Antaeus({
      port: port,
      dnsConfig: dnsConfig
    })

    server.start(() => {
      // eslint-disable-next-line no-console
      console.log(`Antaeus Server started on port ${port}`)
    })
  }
})
