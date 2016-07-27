'use strict'

const Etcd = require('node-etcd')
const EtcdDnsMapping = require('../src/dns/etcdDnsMapping')
const Logger = require('../src/logger')

const logger = new Logger()
const etcd = new Etcd()
const dnsMapping = new EtcdDnsMapping({ etcd: etcd, logger: logger })
