'use strict'

const _ = require('lodash')
const JSONAPISerializer = require('jsonapi-serializer').Serializer

class Serializer {
  constructor () {
    this.dnsSerializer = new JSONAPISerializer('dnsentries', {
      attributes: ['address', 'ipfsPath']
    })

    this.pinSerializer = new JSONAPISerializer('pins', {
      attributes: ['ipfsPath']
    })
  }

  serialize (type, objs) {
    var preppedObjs = _.isArray(objs)
          ? _.map(objs, _.partial(Serializer._prepForSerialization, type))
          : Serializer._prepForSerialization(type, objs)

    if (type === 'dnsentries') {
      return this.dnsSerializer.serialize(preppedObjs)
    } else if (type === 'pins') {
      return this.pinSerializer.serialize(preppedObjs)
    }

    throw new Error(`Unknown serialization type: ${type}`)
  }

  static _prepForSerialization (type, obj) {
    if (type === 'dnsentries') {
      return _.extend(obj, { id: obj.address })
    }

    if (type === 'pins') {
      return _.extend(obj, { id: obj.ipfsPath })
    }

    return obj
  }
}

module.exports = Serializer
