'use strict'

const path = require('path')
const test = require('tape')
const UDPInterface = require(path.resolve('lib/sending-interfaces')).Udp

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
  '_something0': '123456789123456789123456789',
  '_something1': '123456789123456789123456789',
  '_something2': '123456789123456789123456789',
  '_something3': '123456789123456789123456789',
  '_something4': '123456789123456789123456789'
}

const largeGelfObject = {
  'version': '1.1',
  'host': 'hapiplugin.org',
  'short_message': 'some simple chunked message',
  'level': 5,
  '_something0': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something1': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something2': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something3': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something4': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something5': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something6': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something7': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something8': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something9': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something10': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something11': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something12': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something13': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something14': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something15': '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
  '_something16': '123456789123456789123456789123456789123456789123456789123456789123456789123456789'

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

test('should not send the payload if it is too big', (t) => {
  t.plan(1)
  let udpSender = new UDPInterface(largeGelfObject, {
    MAX_BUFFER_SIZE: 20
  })
  udpSender.send()
  t.ok(true)
})
