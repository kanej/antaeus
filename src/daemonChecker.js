'use strict'

const http = require('http')
const Promise = require('bluebird')
const _ = require('lodash/fp')

var DaemonChecker = function (options) {
  if (!_.isObject(options)) {
    options = {}
  }

  this.retries = _.isNumber(options.retries) ? options.retries : 10
  this.delay = _.isNumber(options.delay) ? options.delay : 1000
  this.logger = _.isObject(options.logger) ? options.logger : { info: () => {} }

  this.ensureConnection = function (host, port) {
    return new Promise((resolve, reject) => {
      return this._recursiveRequest(resolve, reject, this.retries, { host: host, port: port })
    })
  }

  this._recursiveRequest = (resolve, reject, retries, options) => {
    if (retries === 0) {
      return reject(new Error('Could not connect'))
    }

    this._httpRequest(options.host, options.port)
      .then((body) => {
        if (body.toString().trim() === '404 page not found') {
          resolve()
        } else {
          reject(new Error('Unexpected response: ' + body))
        }
      })
      .catch((err) => {
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          return Promise.delay(this.delay).then(() => {
            this.logger.info('Could not connect to IPFS daemon. Retrying ...')
            return this._recursiveRequest(resolve, reject, retries - 1, options)
          })
        }

        reject(err)
      })
  }

  this._httpRequest = function (host, port) {
    return new Promise((resolve, reject) => {
      return http.get(`http://${host}:${port}`, (response) => {
        let body = ''
        response.on('data', (d) => {
          body += d
        })

        response.on('end', (d) => {
          resolve(body)
        })
      }).on('error', (err) => {
        reject(err)
      })
    })
  }
}

module.exports = DaemonChecker
