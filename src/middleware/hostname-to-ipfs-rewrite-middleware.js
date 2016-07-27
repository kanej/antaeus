'use strict'

const rewrite = function rewrite (dnsMapping) {
  return function ipfsRewriteMiddleware (req, res, next) {
    const address = dnsMapping.lookup(req.hostname)

    if (address) {
      const previousUrl = req.url.substring(1)
      const ipfsRoot = address

      if (previousUrl === '') {
        req.url = ipfsRoot
      } else {
        req.url = ipfsRoot + '/' + previousUrl
      }
    }

    next()
  }
}

module.exports = {
  rewrite: rewrite
}
