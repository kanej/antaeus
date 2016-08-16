/* eslint-disable no-console */
'use strict'

const _ = require('lodash')
const Command = require('ronin').Command

const Logger = require('../../../src/logger')
const ApiClient = require('../../../src/client/apiClient')

module.exports = Command.extend({
  desc: 'Run a command against a remote antaeus server',
  options: {
    command: {
      type: 'string'
    },
    serverUrl: {
      type: 'string'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    domain: {
      type: 'string'
    },
    ipfsPath: {
      type: 'string'
    }
  },
  run: (command, serverUrl, username, password, domain, ipfsPath) => {
    const logger = new Logger()

    if (!serverUrl || !username || !password) {
      throw new Error('Remote connection details must be given: --serverUrl --username --password')
    }

    if (!command) {
      throw new Error('No command specified')
    }

    if (!_.includes(['add', 'delete', 'ls'], command)) {
      throw new Error('Unrecognized command: ' + command)
    }

    const client = new ApiClient({
      url: serverUrl,
      username: username,
      password: password,
      logger: logger
    })

    var commandPromise

    if (command === 'add') {
      if (!domain || !ipfsPath) {
        throw new Error('Add DNS Mapping command requires both --domain and --ipfsPath options')
      }

      commandPromise = client.addDnsMapping(domain, ipfsPath)
    } else if (command === 'delete') {
      if (!domain) {
        throw new Error('Delete DNS Mapping command requires the --domain option')
      }

      commandPromise = client.addDnsMapping(domain, ipfsPath)
    } else if (command === 'ls') {
      commandPromise = client.listDnsMappings()
        .then((response) => {
          if (_.isEmpty(response)) {
            console.log('No DNS entries')
            return
          }

          console.log('DNS Mappings')
          console.log('------------')
          _.each(response, (entry) => {
            console.log(entry.attributes.address + '\t' + entry.attributes['ipfs-path'])
          })
        })
    }

    commandPromise
      .catch((err) => {
        logger.error(err)
        process.exit(1)
      })
  }
})
