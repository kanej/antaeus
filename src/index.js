'use strict'

const Antaeus = require('./antaeus')

var config = {
  port: 3001
}

var server = new Antaeus(config)

server.start(() => {
  // eslint-disable-next-line no-console
  console.log('Antaeus Server running on port 3001.')
})
