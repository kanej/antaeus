'use strict'

const Promise = require('bluebird')
const _ = require('lodash/fp')

let ConfigLoader = function ConfigLoader (options) {
  if (!options || !options.ipfs) {
    throw Error('Config Loader must be initialised with an ipfs option.')
  }

  this.ipfs = options.ipfs

  if (!options || !options.fs) {
    throw Error('Config Loader must be initialised with an fs option.')
  }

  this.fs = options.fs

  this.retrieve = function verify (configAddress) {
    if (!configAddress) {
      return new Promise((resolve, reject) => { resolve({}) })
    }

    if (configAddress.length !== 46) {
      return new Promise((resolve, reject) => {
        return this._getConfigFromFile(configAddress, (err, dnsConfig) => {
          if (err) {
            return reject(err)
          }

          return resolve(dnsConfig)
        })
      })
    }

    return new Promise((resolve, reject) => {
      return this._getConfigFromIpfs(configAddress, (err, dnsConfig) => {
        if (err) {
          return reject(err)
        }

        return resolve(dnsConfig)
      })
    })
  }

  // Helpers

  this._getConfigFromFile = function _getConfigFromFile (configAddress, callback) {
    try {
      const stats = this.fs.lstatSync(configAddress)

      if (!stats.isFile()) {
        return callback(new Error('Address is to a directory'))
      }
    } catch (e) {
      return callback(new Error('File not found'))
    }

    const dnsConfigRaw = this.fs.readFileSync(configAddress)

    try {
      return callback(null, JSON.parse(dnsConfigRaw))
    } catch (e) {
      return callback(new Error(`Parse Error - Not a valid json file at ${configAddress}`))
    }
  }

  this._getConfigFromIpfs = function _getConfigFromIpfs (configAddress, callback) {
    return this.ipfs.cat(configAddress, (err, stream) => {
      if (err) {
        return callback(err)
      }

      return this._streamToText(stream, (streamErr, text) => {
        if (streamErr) {
          callback(new Error(`IPFS Read Error - the underlying ipfs stream threw ${streamErr}`))
        }

        let json = this._tryParse(text)

        if (!json) {
          return callback(new Error(`Parse Error - Not a valid json file at address ${configAddress}`))
        }

        var { valid, message } = this._validateConfig(json)

        if (valid) {
          return callback(null, json)
        } else {
          return callback(new Error(message))
        }
      })
    })
  }

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
