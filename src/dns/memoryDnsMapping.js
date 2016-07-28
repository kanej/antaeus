'use strict'

const _ = require('lodash/fp')
const Promise = require('bluebird')

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

  add (address, ipfsPath) {
    return new Promise((resolve, reject) => {
      this.listing[address] = ipfsPath
      resolve()
    })
  }

  delete (address) {
    return new Promise((resolve, reject) => {
      delete this.listing[address]
      resolve()
    })
  }
}

module.exports = MemoryDnsMapping
