'use strict'

const _ = require('lodash/fp')

class MemoryDnsMapping {
  constructor (options) {
    if (!_.isPlainObject(options)) {
      throw new Error('MemoryDnsMapping must be initialised with an options object.')
    }

    this.listing = _.isPlainObject(options.dnsConfig) ? options.dnsConfig : {}
  }

  lookup (url) {
    return this.listing[url]
  }
}

module.exports = MemoryDnsMapping
