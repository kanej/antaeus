'use strict'

const _ = require('lodash/fp')

class EtcdDnsMapping {
  constructor (options) {
    if (!_.isPlainObject(options)) {
      throw new Error('EtcdDnsMapping is constructed with an options object')
    }

    if (!_.isObject(options.etcd)) {
      throw new Error('EtcdDnsMapping must be passed an \'etcd\' option')
    }

    this.etcd = options.etcd
    this.logger = _.isObject(options.logger) ? options.logger : { info: () => {} }

    this.antaeusEtcdRoot = '/antaeus/mapping/'
    this.listing = {}

    this.watcher = this.etcd.watcher(this.antaeusEtcdRoot, null, { recursive: true })
    this.watcher.on('change', this._dispatchAction.bind(this))

    if (_.isPlainObject(options.dnsConfig)) {
      _.toPairs(options.dnsConfig).forEach((entry) => {
        this.etcd.set(this.antaeusEtcdRoot + entry[0], entry[1])
      })
    }
  }

  lookup (address) {
    return this.listing[address]
  }

  add (address, ipfsRefPath) {
    return this.etcd.set(EtcdDnsMapping._addressToKey(this.antaeusEtcdRoot, address), ipfsRefPath)
  }

  delete (address) {
    return this.etcd.del(EtcdDnsMapping._addressToKey(this.antaeusEtcdRoot, address))
  }

  static _keyToAddress (antaeusEtcdRoot, key) {
    return key.replace(antaeusEtcdRoot, '')
  }

  static _addressToKey (antaeusEtcdRoot, address) {
    return `${antaeusEtcdRoot}${address}`
  }

  _dispatchAction (change) {
    const action = change.action
    const address = EtcdDnsMapping._keyToAddress(this.antaeusEtcdRoot, change.node.key)
    const value = change.node.value

    if (action === 'set') {
      this.listing[address] = value
      return this.logger.info(`Setting address mapping: ${address} - ${value}`)
    } else if (action === 'delete') {
      delete this.listing[address]
      return this.logger.info(`Deleting address mapping: ${address} - ${value}`)
    }

    return this.logger.info('Unknown etcd action')
  }
}

module.exports = EtcdDnsMapping
