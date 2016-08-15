'use strict'

const ApiClient = require('../src/client/apiClient')

const client = new ApiClient({
  url: 'localhost:3001',
  username: 'example',
  password: 'password'
})

client//.listDnsMappings()
      .addDnsMapping('www2.kanej.me', '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
      //.deleteDnsMapping('www2.kanej.me')
  .then((response) => {
    console.log(response)
  })
  .catch((err) => {
    console.error(err)
  })
