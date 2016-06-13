#! /usr/bin/env node

'use strict'

const ronin = require('ronin')

const cli = ronin({
  path: __dirname,
  desc: 'IPFS gateway with DNS mapping.'
})

cli.run()
