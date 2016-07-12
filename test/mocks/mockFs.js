'use strict'

const _ = require('lodash/fp')

const MockFs = function (options) {
  this.options = _.defaults({ isDirectory: false, fileExists: true }, options)

  this.lstatSync = (configAddress) => {
    if (!this.options.fileExists) {
      throw new Error('Kaboom')
    }

    return {
      isFile: () => {
        return !this.options.isDirectory
      }
    }
  }

  this.readFileSync = (configAddress) => {
    return this.options.config
  }
}

module.exports = MockFs
