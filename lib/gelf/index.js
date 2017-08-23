'use strict'

const _ = require('lodash')
const os = require('os')

// http://docs.graylog.org/en/2.3/pages/gelf.html

function GELFMessageFactory (logObject) {

  if(!logObject) throw new Error('Log object is empty')

  // GELF spec string (UTF-8) short_message - MUST be set by client library.
  if (isShortMessageMissing(logObject)) throw new Error('Short message is not present')

  if (isIdFieldPresent(logObject)) throw new Error('Id is present')

  // GELF spec string (UTF-8) version - “1.1”; MUST be set by client library.
  // GELF spec string (UTF-8) host - MUST be set by client library.
  const gelfRequiredFields = {
    'version': '1.1',
    'host': os.hostname()
  }

  logObject = addUnderscoreToAdditionalFieldsKeys(logObject)

  return _.assign(gelfRequiredFields, logObject)
}

function isShortMessageMissing (logObject) {
  return _.isNil(logObject.short_message)
}

function isIdFieldPresent (logObject) {
  if(logObject) {
    return logObject._id !== undefined
  } else {
    return false
  }
}

function isAdditionalKey (key) {
  switch (key) {
    case 'version':
    case 'host':
    case 'level':
    case 'short_message':
    case 'full_message':
    case 'timestamp':
      return false
      break
    default:
      return true
  }
}

function addUnderscoreToAdditionalFieldsKeys (logObject) {
  return _.mapKeys(logObject, (value, key) => {
    if(isAdditionalKey(key)) {
      if(key.charAt(0) !== '_') return '_' + key
    } else {
      return key
    }
  })
}

module.exports = GELFMessageFactory
