'use strict'

const path = require('path')
const os = require('os')
const test = require('tape')
const { GELFMessageFactory } = require(path.resolve('lib/gelf/index.js'))

test('GELFMessageFactory should create basic gelf message with short and detailed message', (t) => {
  t.plan(1)
  const gelfJson = GELFMessageFactory()
  const gelfRequiredFields = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 5,
    'short_message': 'short_message not set'
  }
  t.deepEqual(gelfRequiredFields, gelfJson)
})

test('GELFMessageFactory should create gelf message with data', (t) => {
  t.plan(1)
  const gelfJson = GELFMessageFactory({facility: 'some facility', full_message: 'some full message', short_message: 'some short message'}, 'notice')
  const gelfExpectedJson = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 5,
    'short_message': 'some short message',
    'full_message': 'some full message',
    '_facility': 'some facility'
  }
  t.deepEqual(gelfJson, gelfExpectedJson)
})

test('GELFMessageFactory should delete id key', (t) => {
  t.plan(1)
  const gelfJson = GELFMessageFactory({facility: 'some facility', full_message: 'some full message', id: '1', short_message: 'some short message'}, 'notice')
  const gelfExpectedJson = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 5,
    'short_message': 'some short message',
    'full_message': 'some full message',
    '_facility': 'some facility'
  }
  t.deepEqual(gelfJson, gelfExpectedJson)
})

test('Testing tags', (t) => {
  t.plan(8)
  const gelfJsonEmergency = GELFMessageFactory({}, 'emergency')
  const gelfExpectedJsonEmergency = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 0,
    'short_message': 'short_message not set',
  }
  const gelfJsonAlert = GELFMessageFactory({}, 'alert')
  const gelfExpectedJsonAlert = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 1,
    'short_message': 'short_message not set',
  }
  const gelfJsonCritical = GELFMessageFactory({}, 'critical')
  const gelfExpectedJsonCritical = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 2,
    'short_message': 'short_message not set',
  }
  const gelfJsonError = GELFMessageFactory({}, 'error')
  const gelfExpectedJsonError = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 3,
    'short_message': 'short_message not set',
  }
  const gelfJsonWarning = GELFMessageFactory({}, 'warning')
  const gelfExpectedJsonWarning= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 4,
    'short_message': 'short_message not set',
  }
  const gelfJsonNotice = GELFMessageFactory({}, 'notice')
  const gelfExpectedJsonNotice= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 5,
    'short_message': 'short_message not set',
  }
  const gelfJsonInfo = GELFMessageFactory({}, 'info')
  const gelfExpectedJsonInfo= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 6,
    'short_message': 'short_message not set',
  }
  const gelfJsonDebug = GELFMessageFactory({}, 'debug')
  const gelfExpectedJsonDebug= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 7,
    'short_message': 'short_message not set',
  }
  t.deepEqual(gelfJsonEmergency, gelfExpectedJsonEmergency)
  t.deepEqual(gelfJsonAlert, gelfExpectedJsonAlert)
  t.deepEqual(gelfJsonCritical, gelfExpectedJsonCritical)
  t.deepEqual(gelfJsonError, gelfExpectedJsonError)
  t.deepEqual(gelfJsonWarning, gelfExpectedJsonWarning)
  t.deepEqual(gelfJsonNotice, gelfExpectedJsonNotice)
  t.deepEqual(gelfJsonInfo, gelfExpectedJsonInfo)
  t.deepEqual(gelfJsonDebug, gelfExpectedJsonDebug)
})
