'use strict'

const winston = require('winston')
winston.emitErrs = true

const Logger = function Logger () {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
      })
    ]
  })
}

module.exports = Logger
