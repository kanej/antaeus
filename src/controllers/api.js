'use strict'

const _ = require('lodash')

const apiSetup = function (app) {
  app.get('/api/dns', (req, res) => {
    const dnsMapping = req.app.get('dnsMapping')
    const serializer = req.app.get('serializer')

    const dnsentries = _.chain(dnsMapping.listing).toPairs().map((pair) => {
      return { address: pair[0], ipfsPath: pair[1] }
    }).value()

    return res.json(serializer.serialize('dnsentries', dnsentries))
  })

  app.put('/api/dns/:url', (req, res) => {
    const dnsMapping = req.app.get('dnsMapping')
    const serializer = req.app.get('serializer')

    const url = req.params.url
    const ipfsPath = req.body.ipfsPath

    return dnsMapping.add(url, ipfsPath)
      .then((etcdResponse) => {
        const dnsentry = {
          address: etcdResponse.node.key,
          ipfsPath: etcdResponse.node.value
        }

        return res.status(201).json(serializer.serialize('dnsentries', dnsentry))
      })
      .catch((err) => {
        return res.status(500).send(err.message)
      })
  })

  app.delete('/api/dns/:url', (req, res) => {
    const dnsMapping = req.app.get('dnsMapping')

    const url = req.params.url

    dnsMapping.delete(url)
      .then(() => {
        return res.status(204).send('')
      })
      .catch((err) => {
        return res.status(500).send(err.message)
      })
  })
}

module.exports = {
  setup: apiSetup
}
