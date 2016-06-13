'use strict'

const Command = require('ronin').Command
const Antaeus = require('../../../src/antaeus')

module.exports = Command.extend({
  desc: 'Start the Antaeus server',
  options: {
    port: {
      default: 3001
    }
  },
  run: (port) => {
    var server = new Antaeus({ port: port })

    server.start(() => {
      // eslint-disable-next-line no-console
      console.log(`Antaeus Server started on port ${port}`)
    })
  }
})
