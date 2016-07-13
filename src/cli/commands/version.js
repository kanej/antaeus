'use strict'

const Command = require('ronin').Command
const Logger = require('../../../src/logger')
const fs = require('fs')

module.exports = Command.extend({
  desc: 'Shows the Antaeus servers version information',
  run: () => {
    const logger = new Logger()

    const packageJson = JSON.parse(fs.readFileSync('./package.json'))
    logger.info(`antaeus version ${packageJson.version}`)
  }
})
