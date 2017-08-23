'use strict'

const path = require('path')
const os = require('os')
const test = require('tape')
const UDPInterface = require(path.resolve('lib/sending-interfaces/udp.js'))

const gelfProperTransformedObject = {
  'version': '1.1',
  'host': os.hostname(),
  'short_message': 'some simple message',
  '_something': 'asdasfbanadghasfdjaeytngdh'
}

// test('UDPInterface should buffer the gelfobject',(t) => {
//   t.plan(1)
//   let udpSender = new UDPInterface(gelfProperTransformedObject)
//   console.log('BUFFER', udpSender.getGelfBuffer())
//   console.log('BUFFER SIZE', udpSender.getGelfBufferSize())
//   console.log('CHUNK TOTAL: ', udpSender.calculateChunkTotal())
//   t.ok(true)
// })

test('call send from interface', (t) => {
  t.plan(1)
  let udpSender = new UDPInterface(gelfProperTransformedObject)
  udpSender.send()
  t.ok(true)
})

test('is gelf payload chunkable', (t) => {
  t.plan(1)
  let udpSender = new UDPInterface(gelfProperTransformedObject)
  t.equal((udpSender.isPayloadChunkable()), false)
})

test('test chunk construction', (t) => {
  t.plan(1)
  let udpSender = new UDPInterface(gelfProperTransformedObject, {
    MAX_BUFFER_SIZE: 60
  })
  console.log('BUFFER', udpSender.getGelfBuffer().toString('hex'))
  console.log('BUFFER SIZE', udpSender.getGelfBufferSize())
  console.log('CHUNK TOTAL: ', udpSender.calculateChunkTotal())
  console.log(udpSender.prepareChunkedGelf())
  t.ok(true)
})