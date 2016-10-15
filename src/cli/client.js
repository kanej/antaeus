#! /usr/bin/env node
'use strict'

const path = require('path')
const _ = require('lodash')
const yargs = require('yargs')
const nconf = require('nconf')
const osenv = require('osenv')

const Logger = require('../../src/logger')
const ApiClient = require('../../src/client/apiClient')

yargs
  .usage('$0 <cmd> [args]')
  .command('ls [options]', 'List mappings', {
    serverUrl: {
      required: false,
      desc: 'The url of the remote antaeus server'
    },
    username: {
      alias: 'u',
      required: false,
      desc: 'The username for the remote Antaeus server\'s api'
    },
    password: {
      alias: 'p',
      required: false,
      desc: 'The password for the remote Antaeus server\'s api'
    }
  }, (argv) => {
    const configFilepath = path.join(osenv.home(), '.antaeus/config.json')
    nconf.argv().env().file({ file: configFilepath })

    const logger = new Logger()

    const options = {
      serverUrl: nconf.get('serverUrl'),
      username: nconf.get('username'),
      password: nconf.get('password')
    }

    if (!options.serverUrl || !options.username || !options.password) {
      throw new Error('Remote connection details must be given: --serverUrl --username --password')
    }

    const client = new ApiClient(_.extend(options, {
      logger: logger
    }))

    client.listDnsMappings()
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
      .catch((err) => {
        logger.error(err)
        process.exit(1)
      })
  })
  .help()
  .argv
