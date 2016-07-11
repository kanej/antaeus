'use strict'

const stream = require('stream')
const util = require('util')

function Source () {
  stream.Readable.call(
    this,
    {
      objectMode: true
    }
  )
}

util.inherits(Source, stream.Readable)

Source.prototype._read = function (sizeIsIgnored) {
  this.emit('error', new Error('StreamError'))
  this.push(null)
}

const textToStream = (text) => {
  let s = new stream.Readable()
  s._read = function noop () {}
  s.push(text)
  s.push(null)
  return s
}

const MockIpfs = function (options) {
  this.options = options

  this.cat = function cat (configAddress, cb) {
    if (this.options.error) {
      return cb(this.options.errorMessage, null)
    } else if (this.options.readError) {
      let s = new Source()
      return cb(null, s)
    } else {
      return cb(null, textToStream(this.options.config))
    }
  }
}

module.exports = MockIpfs
