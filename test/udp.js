'use strict'

const path = require('path')
const test = require('tape')
const UDPInterface = require(path.resolve('lib/sending-interfaces/udp.js'))

const gelfProperTransformedObject = {
  'version': '1.1',
  'host': 'hapiplugin.org',
  'short_message': 'some simple non chunked message',
  'level': 5,
  '_something': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something1': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something2': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something3': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something4': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh'
}

const chunkedGelfProperTransformedObject = {
  'version': '1.1',
  'host': 'hapiplugin.org',
  'short_message': 'some simple chunked message',
  'level': 5,
  '_something': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something1': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something2': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something3': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh',
  '_something4': 'asdasfbanadghasfdjaeytngdhasdasfbanadghasfdjaeytngdh'
}

test('test gelf sending without chunking', (t) => {
  t.plan(1)
  let udpSender = new UDPInterface(gelfProperTransformedObject)
  udpSender.send()
  t.ok(true)
})

test('test chuked gelf', (t) => {
  t.plan(1)
  let udpSender = new UDPInterface(chunkedGelfProperTransformedObject, {
    MAX_BUFFER_SIZE: 230
  })
  udpSender.send()
  t.ok(true)
})
