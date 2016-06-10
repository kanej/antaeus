'use strict'

const antaeusWelcomeMessage = (req, res) => {
  return res.send('Welcome to Antaeus')
}

module.exports = {
  antaeusWelcomeMessage: antaeusWelcomeMessage
}
