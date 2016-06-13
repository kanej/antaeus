'use strict'

const rewrite = function rewrite (config) {
  return function ipfsRewriteMiddleware (req, res, next) {
    if (config.hasOwnProperty(req.hostname)) {
      const previousUrl = req.url.substring(1)
      const ipfsRoot = config[req.hostname]

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
