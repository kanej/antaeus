#! /usr/bin/env node
/* eslint-disable no-console */
'use strict'

const path = require('path')
const _ = require('lodash')
const yargs = require('yargs')
const nconf = require('nconf')
const osenv = require('osenv')
const isIpfs = require('is-ipfs')

const Logger = require('../../src/logger')
const ApiClient = require('../../src/client/apiClient')

const optionalServerOptions = {
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
}

const setupApiClientBasedOn = (argv, logger) => {
  const configFilepath = path.join(osenv.home(), '.antaeus/config.json')
  nconf.argv().env().file({ file: configFilepath })

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

  return client
}

const options = yargs
  .usage('$0 <cmd> [args]')
  .command('add <domain> <ipfsPath> [options]', 'Add a mapping', optionalServerOptions, (argv) => {
    const logger = new Logger()

    const ipfsPath = argv.ipfsPath
    const domain = argv.domain

    if (!isIpfs.urlOrPath(ipfsPath)) {
      throw Error('ipfsPath is not valid')
    }

    const client = setupApiClientBasedOn(argv, logger)

    client.addDnsMapping(domain, ipfsPath)
  })
  .command('delete <domain> [options]', 'Delete a mapping', optionalServerOptions, (argv) => {
    const logger = new Logger()

    const domain = argv.domain

    const client = setupApiClientBasedOn(argv, logger)

    client.deleteDnsMapping(domain)
  })
  .command('ls [options]', 'List mappings', optionalServerOptions, (argv) => {
    const logger = new Logger()
    const client = setupApiClientBasedOn(argv, logger)

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
  .version()
  .help()
  .recommendCommands()

if (process.argv.length === 2) {
  options.showHelp()
}

options.argv
