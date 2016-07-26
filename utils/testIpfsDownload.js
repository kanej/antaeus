'use strict'

const ipfsAPI = require('ipfs-api')
const util = require('util')

var ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })

var streamToString = function(stream, callback) {
  var str = '';
  stream.on('data', function(chunk) {
    str += chunk;
  });
  stream.on('end', function() {
    callback(str);
  });
}

ipfs.send('cat', '/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o', null, null, (err, response) => {
  if(err) {
    return console.error(err)
  }
  streamToString(response, function(myStr) {
    console.log(myStr);
  });
})
