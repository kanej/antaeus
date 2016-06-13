'use strict'

const Command = require('ronin').Command

module.exports = Command.extend({
  desc: 'Shows the Antaeus servers version information',
  run: () => {
    // eslint-disable-next-line no-console
    console.log('antaeus version 0.1.0')
  }
})
