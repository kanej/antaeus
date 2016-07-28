'use strict'

class MockEtcd {
  constructor () {
    this.setError = null
  }

  watcher () {
    return this
  }

  on (event, callback) {
    this.callback = callback
  }

  set (key, value, callback) {
    this._addKey(key, value)
    callback(this.setError)
  }

  del (key, callback) {
    this._deleteKey(key)
    callback()
  }

  unknownAction () {
    this.callback({ action: 'unknown', node: { key: '', value: null } })
  }

  _addKey (key, value) {
    this.callback({ action: 'set', node: { key: key, value: value } })
  }

  _deleteKey (key, value) {
    this.callback({ action: 'delete', node: { key: key } })
  }
}

module.exports = MockEtcd
