'use strict'

const antaeusWelcomeMessage = (req, res) => {
  return res.send('Welcome to Antaeus')
}

const routeToIPFS = (req, res) => {
  const ipfs = req.app.get('ipfs')

  const ipfsPath = req.url.replace('/ipfs/', '')

  return ipfs.cat(ipfsPath, (err, ipfsFile) => {
    if (err) {
      if (err.message === 'this dag node is a directory') {
        return ipfs.cat(ipfsPath + '/index.html', (err, recursiveFile) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log('Error: ' + err)
            return res.status(500).send(err)
          }

          return recursiveFile.pipe(res)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log('Error: ', err.message, ipfsPath)
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
