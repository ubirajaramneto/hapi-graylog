'use strict'

const path = require('path')
const os = require('os')
const test = require('tape')
const GelfFactory = require(path.resolve('lib/gelf/index.js'))

test('GelfFactory should create basic gelf message with short and detailed message', (t) => {
  t.plan(1)
  const gelfJson = GelfFactory()
  const gelfRequiredFields = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 5,
    'short_message': 'short_message not set'
  }
  t.deepEqual(gelfRequiredFields, gelfJson)
})

test('GelfFactory should create gelf message with data', (t) => {
  t.plan(1)
  const gelfJson = GelfFactory('some short message', {facility: 'some facility', full_message: 'some full message'})
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

test('GelfFactory should delete id key', (t) => {
  t.plan(1)
  const gelfJson = GelfFactory('some short message', {facility: 'some facility', full_message: 'some full message', id: '1'})
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
  const gelfJsonEmergency = GelfFactory('some short message', {}, 'emergency')
  const gelfExpectedJsonEmergency = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 0,
    'short_message': 'some short message',
  }
  const gelfJsonAlert = GelfFactory('some short message', {}, 'alert')
  const gelfExpectedJsonAlert = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 1,
    'short_message': 'some short message',
  }
  const gelfJsonCritical = GelfFactory('some short message', {}, 'critical')
  const gelfExpectedJsonCritical = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 2,
    'short_message': 'some short message',
  }
  const gelfJsonError = GelfFactory('some short message', {}, 'error')
  const gelfExpectedJsonError = {
    'version': '1.1',
    'host': os.hostname(),
    'level': 3,
    'short_message': 'some short message',
  }
  const gelfJsonWarning = GelfFactory('some short message', {}, 'warning')
  const gelfExpectedJsonWarning= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 4,
    'short_message': 'some short message',
  }
  const gelfJsonNotice = GelfFactory('some short message', {}, 'notice')
  const gelfExpectedJsonNotice= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 5,
    'short_message': 'some short message',
  }
  const gelfJsonInfo = GelfFactory('some short message', {}, 'info')
  const gelfExpectedJsonInfo= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 6,
    'short_message': 'some short message',
  }
  const gelfJsonDebug = GelfFactory('some short message', {}, 'debug')
  const gelfExpectedJsonDebug= {
    'version': '1.1',
    'host': os.hostname(),
    'level': 7,
    'short_message': 'some short message',
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
