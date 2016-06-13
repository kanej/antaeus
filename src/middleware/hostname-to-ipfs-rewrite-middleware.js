'use strict'

const rewrite = function rewrite (config) {
  return function ipfsRewriteMiddleware (req, res, next) {
    if (config.hasOwnProperty(req.hostname)) {
      req.url = config[req.hostname]
    }

    next()
  }
}

module.exports = {
  rewrite: rewrite
}
