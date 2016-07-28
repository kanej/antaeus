'use strict'

const Serializer = require('../src/api/serializer.js')

var exampleDns = [
  { address: 'www.kanej.me', ipfsPath: '/ipfs/boom' }
]

var examplePins = [
  { ipfsPath: '/ipfs/boom' }
]

const serializer = new Serializer()

var dnsentries = serializer.serialize('dnsentries', exampleDns)
console.log(dnsentries)

var pins = serializer.serialize('pins', examplePins)
console.log(pins)
