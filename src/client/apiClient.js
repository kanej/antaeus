'use strict'

const request = require('request')
const Promise = require('bluebird')
const _ = require('lodash')

class ApiClient {
  constructor (options) {
    if (!_.isObject(options)) {
      throw new Error('Antaeus API Client requires an options object on construction')
    }

    if (!_.isString(options.serverUrl)) {
      throw new Error('Antaeus API client my be passed a "serverUrl" option for the remote api server')
    }

    if (!_.isString(options.username)) {
      throw new Error('Antaeus API client my be passed a "username" option for the remote api server')
    }

    if (!_.isString(options.password)) {
      throw new Error('Antaeus API client my be passed a "password" option for the remote api server')
    }

    this.serverUrl = options.serverUrl

    this.accessToken = null
    this.authenticationPromise = null

    this.requestAuthToken(options.username, options.password)
  }

  requestAuthToken (username, password) {
    this.authenticationPromise = new Promise((resolve, reject) => {
      return request({
        url: this.resolveUrl('/api/authenticate'),
        method: 'POST',
        json: {
          username: username,
          password: password
        }
      }, this.promisfyCallback(resolve, reject))
    }).then((data) => {
      this.accessToken = data.token
      return data.token
    })

    return this.authenticationPromise
  }

  listDnsMappings () {
    return this.authenticationPromise.then(() => {
      return this.request({
        url: '/api/dns',
        method: 'GET'
      })
    })
  }

  addDnsMapping (url, ipfsPath) {
    return this.authenticationPromise.then(() => {
      return this.request({
        url: '/api/dns/' + url,
        method: 'PUT',
        json: {
          url: url,
          ipfsPath: ipfsPath
        }
      })
    })
  }

  deleteDnsMapping (url) {
    return this.authenticationPromise.then(() => {
      return this.request({
        url: '/api/dns/' + url,
        method: 'DELETE'
      })
    })
  }

  // Helpers

  resolveUrl (path) {
    return this.serverUrl + path
  }

  request (options) {
    const requestOptions = _.cloneDeep(options)

    if (_.isUndefined(requestOptions.json)) {
      requestOptions.json = true
    }

    if (_.isString(requestOptions.url)) {
      requestOptions.url = this.resolveUrl(requestOptions.url)
    }

    if (_.isObject(requestOptions.headers)) {
      requestOptions.headers['x-access-token'] = this.accessToken
    } else {
      requestOptions.headers = { 'x-access-token': this.accessToken }
    }

    return new Promise((resolve, reject) => {
      request(requestOptions, this.promisfyCallback(resolve, reject))
    })
  }

  promisfyCallback (resolve, reject) {
    return (err, response, body) => {
      if (err) {
        return reject(err)
      }

      if (Math.floor(response.statusCode / 100) !== 2) {
        return reject(body.errors[0].title)
      }

      return resolve(body.data)
    }
  }
}

module.exports = ApiClient
