'use strict'

const _ = require('lodash')
const jwt = require('jsonwebtoken')

const apiSetup = function (app) {
  const ensureAuthToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token']

    if (!token) {
      return res.status(403).json({
        errors: [
          {
            title: 'No token',
            detail: 'No auth token provided.'
          }
        ]
      })
    }

    jwt.verify(token, 'super secret', (err, decoded) => {
      if (err) {
        return res.json({
          errors: [
            {
              title: 'Failed to authenticate',
              detail: 'Auth token refused.'
            }
          ]
        })
      }

      req.decoded = decoded
      return next()
    })
  }

  app.post('/api/authenticate', (req, res) => {
    const token = jwt.sign({ user: 'anon' }, 'super secret', { expiresIn: '1 day' })

    res.json({ data: { token: token } })
  })

  app.get('/api/dns', [ensureAuthToken], (req, res) => {
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

    if (!url || !ipfsPath) {
      return res.status(400).json({
        errors: [
          {
            title: 'Missing parameter',
            detail: 'Missing either the url or ipfsPath.'
          }
        ]
      })
    }

    return dnsMapping.add(url, ipfsPath)
      .then((etcdResponse) => {
        const dnsentry = {
          address: etcdResponse.node.key,
          ipfsPath: etcdResponse.node.value
        }

        return res.status(201).json(serializer.serialize('dnsentries', dnsentry))
      })
      .catch((err) => {
        return res.status(500).json({
          errors: [
            {
              title: err
            }
          ]
        })
      })
  })

  app.delete('/api/dns/:url', (req, res) => {
    const dnsMapping = req.app.get('dnsMapping')
    const serializer = req.app.get('serializer')

    const url = req.params.url
    var ipfsPath
    try {
      ipfsPath = dnsMapping.lookup(url)
    } catch (e) {
      return res.status(500).json({
        errors: [
          {
            title: e.message
          }
        ]
      })
    }

    const dnsentry = {
      address: url,
      ipfsPath: ipfsPath
    }

    dnsMapping.delete(url)
      .then(() => {
        return res.status(204).json(serializer.serialize('dnsentries', dnsentry))
      })
      .catch((err) => {
        return res.status(500).json({
          errors: [
            {
              title: err.error.message
            }
          ]
        })
      })
  })
}

module.exports = {
  setup: apiSetup
}
