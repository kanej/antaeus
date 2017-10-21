'use strict'

const _ = require('lodash')
const url = require('url')

const antaeusWelcomeMessage = (req, res) => {
  const ipfsId = req.app.get('ipfsId')

  const addresses = _.chain(ipfsId.addresses)
    .reject(item => /\/ip6\//.test(item))
    .reject(item => /\/127.0.0.1\//.test(item))
    .filter(item => /\/tcp\/4001\//.test(item))
    .value()

  return res.render('home', {
    title: 'Antaeus',
    addresses: addresses
  })
}

const routeToIPFS = (req, res) => {
  const logger = req.app.get('logger')
  const ipfs = req.app.get('ipfs')

  const ipfsPath = url.parse(req.url).pathname.replace('/ipfs/', '')

  return ipfs.send({
    path: 'cat',
    args: ipfsPath,
    buffer: null
  }, (err, ipfsFile) => {
    if (err) {
      if (err.message === 'this dag node is a directory') {
        return ipfs.send({
          path: 'cat',
          args: ipfsPath + '/index.html',
          buffer: null
        }, (err, recursiveFile) => {
          if (err) {
            logger.error(err)
            return res.status(500).send(err)
          }

          return recursiveFile.pipe(res)
        })
      } else {
        if (err.code === 0) {
          return res.status(404)
            .contentType('text/plain; charset=utf-8')
            .send(`Path Resolve error: ${err.message}`)
        }

        logger.error(err.message, { path: ipfsPath })
        return res.status(500).send(err.message)
      }
    }

    return ipfsFile.pipe(res)
  })
}

module.exports = {
  antaeusWelcomeMessage: antaeusWelcomeMessage,
  routeToIPFS: routeToIPFS
}
