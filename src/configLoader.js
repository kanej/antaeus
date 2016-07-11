'use strict'

let ConfigLoader = function ConfigLoader (options) {
  if (!options || !options.ipfs) {
    throw Error('Config Loader must be initialised with an ipfs option.')
  }

  this.ipfs = options.ipfs

  this.verify = function verify (configAddress) {
    return this.ipfs.cat(configAddress, (err, stream) => {
      if (err) {
        throw new Error(err)
      }

      this._streamToText(stream, (streamErr, text) => {
        let json = this._tryParse(text)

        if (!json) {
          throw new Error('Not a valid json file at: ' + configAddress)
        }

        var {valid, message} = this._validateConfig(json)

        if (valid) {
          // eslint-disable-next-line no-console
          console.log('Valid DNS config file')
        } else {
          throw new Error(message)
        }
      })
    })
  }

  // Helpers

  this._validateConfig = function _validateConfig (dnsConfig) {
    return { valid: true, message: null }
  }

  this._streamToText = function _streamToText (stream, callback) {
    let buf = ''

    return stream
      .on('error', (err) => {
        return callback(err, null)
      })
      .on('data', (data) => {
        buf += data
      })
      .on('end', () => {
        return callback(null, buf)
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
