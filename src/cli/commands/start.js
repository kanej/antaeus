'use strict'

const Command = require('ronin').Command

module.exports = Command.extend({
  desc: 'Start the Antaeus server',
  run: () => {
    require('../../../src/index.js')
  }
})
