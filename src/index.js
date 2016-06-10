'use strict'

const express = require('express')
const homeEndpoints = require('./controllers/home')

const app = express()

app.get('/', homeEndpoints.antaeusWelcomeMessage)

app.listen(3001, () => {
  // eslint-disable-next-line no-console
  console.log('Antaeus Server running on port 3001.')
})
