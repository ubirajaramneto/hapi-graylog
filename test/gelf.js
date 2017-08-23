'use strict'

const path = require('path')
const os = require('os')
const test = require('tape')
const GelfFactory = require(path.resolve('lib/gelf/index.js'))

test('GelfFactory should create basic gelf message with short and detailed message', (t) => {
  t.plan(1)
  const gelfJsonObject = GelfFactory({short_message: 'some simple message'})
  const gelfStandard = {
    'version': '1.1',
    'host': os.hostname(),
    'short_message': 'some simple message'
  }
  t.deepEqual(gelfJsonObject, gelfStandard)
})

test('GelfFactory should format the additional_fields object by adding underscores to keys', (t) => {
  t.plan(1)
  const gelfProperNOTTransformedObject = {
    'version': '1.1',
    'host': os.hostname(),
    'short_message': 'some simple message',
    'something': '123'
  }
  const gelfProperTransformedObject = {
    'version': '1.1',
    'host': os.hostname(),
    'short_message': 'some simple message',
    '_something': '123'
  }
  const gelfJsonObject = GelfFactory(gelfProperNOTTransformedObject)
  t.deepEqual(gelfJsonObject, gelfProperTransformedObject)
})

test('GelfFactory should throw if id field is present', (t) => {
  t.plan(1)
  const gelfJsonObject = {
    'short_message': 'message',
    '_id': '123'
  }
  t.throws(() => GelfFactory(gelfJsonObject), Error, 'Id field is present')
})

test('GelfFactory should throw if it is passed an empty object', (t) => {
  t.plan(1)
  t.throws(() => GelfFactory({}), Error, 'Empty object passed')
})

test('GelfFactory should throw if object does not contain a valid short_message field', (t) => {
  t.plan(1)
  t.throws(() => GelfFactory(), Error, 'Short message is not present')
})
