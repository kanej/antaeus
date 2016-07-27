'use strict'

class MockEtcd {
  watcher () {
    return this
  }

  on (event, callback) {
    this.callback = callback
  }

  set (key, value) {
    this._addKey(key, value)
  }

  del (key) {
    this._deleteKey(key)
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
