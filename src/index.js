'use strict'

const express = require('express')
const ipfsAPI = require('ipfs-api')
const homeEndpoints = require('./controllers/home')

const app = express()
const ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })

app.set('ipfs', ipfs)

app.get('/', homeEndpoints.antaeusWelcomeMessage)
app.get(/^\/ipfs.*/, homeEndpoints.routeToIPFS)

app.listen(3001, () => {
  // eslint-disable-next-line no-console
  console.log('Antaeus Server running on port 3001.')
})
