'use strict'

const Antaeus = require('./antaeus')

var config = {
  port: 3001,
  dnsConfig: null
}

if (process.argv.length === 3) {
  config.dnsConfig = process.argv[2]
}

var server = new Antaeus(config)

server.start(() => {
  // eslint-disable-next-line no-console
  console.log('Antaeus Server running on port 3001.')
})
