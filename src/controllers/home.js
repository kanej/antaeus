'use strict'

const url = require('url')

const antaeusWelcomeMessage = (req, res) => {
  return res.render('home', { title: 'Antaeus' })
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
        return res.status(500).send(err)
      }
    }

    return ipfsFile.pipe(res)
  })
}

module.exports = {
  antaeusWelcomeMessage: antaeusWelcomeMessage,
  routeToIPFS: routeToIPFS
}
