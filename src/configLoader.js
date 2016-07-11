'use strict'

let Promise = require('bluebird')
let _ = require('lodash/fp')

let ConfigLoader = function ConfigLoader (options) {
  if (!options || !options.ipfs) {
    throw Error('Config Loader must be initialised with an ipfs option.')
  }

  this.ipfs = options.ipfs

  this.verify = function verify (configAddress) {
    return new Promise((resolve, reject) => {
      return this.ipfs.cat(configAddress, (err, stream) => {
        if (err) {
          return reject(err)
        }

        return this._streamToText(stream, (streamErr, text) => {
          if (streamErr) {
            reject(`IPFS Read Error - the underlying ipfs stream threw ${streamErr}`)
          }

          let json = this._tryParse(text)

          if (!json) {
            return reject(`Parse Error - Not a valid json file at address ${configAddress}`)
          }

          var { valid, message } = this._validateConfig(json)

          if (valid) {
            return resolve()
          } else {
            return reject(message)
          }
        })
      })
    })
  }

  // Helpers

  this._validateConfig = function _validateConfig (dnsConfig) {
    var badKeys = _.chain(dnsConfig)
          .toPairs()
          .filter((p) => { return !_.isString(p[1]) })
          .map(_.first)
          .value()

    if (badKeys.length > 0) {
      return { valid: false, message: `DNS Config Error - the key ${badKeys[0]} has value that is not a string.` }
    }

    return { valid: true, message: null }
  }

  this._streamToText = function _streamToText (stream, callback) {
    let buf = ''
    let hasErrored = false
    let errorMessage = ''

    return stream
      .on('error', (err) => {
        hasErrored = true
        errorMessage = err.message.toString()
      })
      .on('data', (data) => {
        buf += data
      })
      .on('end', () => {
        if (hasErrored) {
          return callback(errorMessage, null)
        } else {
          return callback(null, buf)
        }
      })
  }

  this._tryParse = function _tryParse (text) {
    let json
    try {
      json = JSON.parse(text.toString())

      return json
    } catch (e) {
      return null
    }
  }
}

module.exports = ConfigLoader
