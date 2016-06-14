'use strict'

const Command = require('ronin').Command
const fs = require('fs')

module.exports = Command.extend({
  desc: 'Shows the Antaeus servers version information',
  run: () => {
    var packageJson = JSON.parse(fs.readFileSync('./package.json'))
    // eslint-disable-next-line no-console
    console.log(`antaeus version ${packageJson.version}`)
  }
})
