'use strict'

const crypto = require('crypto')
const dgram = require('dgram')

const HEADER_FIRST_MAGIC_BYTE_POSITION  = 0
const HEADER_SECOND_MAGIC_BYTE_POSITION = 1
const HEADER_CHUNK_COUNT_POSITION       = 10
const HEADER_CHUNK_TOTAL_POSITION       = 11
const HEADER_SIZE                       = 12

function UDPInterface (
  gelfObject,
  options = {
    MAX_BUFFER_SIZE: 1400
  },
  gelfServerPort = 12202,
  gelfServerHost = 'localhost'
) {
  this.gelfPayload        = Buffer.from(JSON.stringify(gelfObject))
  this.gelfBufferSize     = Buffer.byteLength(this.gelfPayload)
  this.gelfArrayToBeSent  = []
  this.gelfServerHost     = gelfServerHost
  this.gelfServerPort     = gelfServerPort
  this.options            = options
  this.socket             = dgram.createSocket('udp4')
}

UDPInterface.prototype.send = function () {
  if(this.isPayloadChunkable()) {
    this.prepareChunkedGelf()
    this.dispatchPackets()
  } else {
    this.dispatchSinglePacket(this.gelfPayload)
  }
}

UDPInterface.prototype.dispatchSinglePacket = function () {
  this.socket.send(
    this.gelfPayload,
    0,
    this.gelfPayload.length,
    this.gelfServerPort,
    this.gelfServerHost,
    (err) => {
      if(err) {
        console.debug('Could not send GELF payload to server')
        console.debug(err)
        return this.socket.close()
      }
      this.socket.close()
    })
}

UDPInterface.prototype.dispatchPackets = function () {
  for (let packetIndex = 0; packetIndex < this.gelfArrayToBeSent.length; packetIndex++) {
    this.socket.send(
      this.gelfArrayToBeSent[packetIndex],
      0,
      this.gelfArrayToBeSent[packetIndex].length,
      this.gelfServerPort,
      this.gelfServerHost,
      (err) => {
        if(err) {
          console.debug('Could not send GELF payload to server')
          console.debug(err)
          return this.socket.close()
        }
        if(packetIndex === this.gelfArrayToBeSent.length-1 && this.socket) {
          this.socket.close()
        }
      })
  }
}

UDPInterface.prototype.isPayloadChunkable = function () {
  return this.gelfBufferSize > this.options.MAX_BUFFER_SIZE
}

UDPInterface.prototype.calculateChunkTotal = function () {
  this.chunkTotal = Math.ceil(this.gelfBufferSize/(this.options.MAX_BUFFER_SIZE - HEADER_SIZE) - 1) + 1
  if (this.chunkTotal > 128) {
    throw new Error('Too many chunks to be sent')
  }
  return this.chunkTotal
}

UDPInterface.prototype.prepareChunkedGelf = function () {

  function inserChunkedMagicBytes (_chunkedGelfBuffer) {
    _chunkedGelfBuffer[HEADER_FIRST_MAGIC_BYTE_POSITION]  = 0x1e
    _chunkedGelfBuffer[HEADER_SECOND_MAGIC_BYTE_POSITION] = 0x0f
  }

  function generateChunkId () {
    return crypto.randomBytes(8)
  }

  // ¹arrow function so we don't need binding of 'this'
  const allocateBufferSpace = (remainingPayloadSize) =>  {
    if(remainingPayloadSize < this.options.MAX_BUFFER_SIZE - HEADER_SIZE) {
      return Buffer.alloc(HEADER_SIZE + remainingPayloadSize)
    } else {
      return Buffer.alloc(this.options.MAX_BUFFER_SIZE)
    }
  }

  this.calculateChunkTotal()

  let chunkedGelfBuffer
  let remainingPayloadSize
  const id = generateChunkId()
  for (let i = 0; i < this.chunkTotal; i++) {
    chunkedGelfBuffer = null
    remainingPayloadSize = Math.ceil(
      this.gelfBufferSize - i * (this.options.MAX_BUFFER_SIZE - HEADER_SIZE)
    )
    chunkedGelfBuffer = allocateBufferSpace(remainingPayloadSize)
    inserChunkedMagicBytes(chunkedGelfBuffer)
    id.copy(chunkedGelfBuffer, 2, 0, 8)
    chunkedGelfBuffer[HEADER_CHUNK_COUNT_POSITION] = i
    chunkedGelfBuffer[HEADER_CHUNK_TOTAL_POSITION] = this.chunkTotal
    this.gelfPayload.copy(
      chunkedGelfBuffer,
      HEADER_SIZE,
      i * (this.options.MAX_BUFFER_SIZE - HEADER_SIZE)
    )
    this.gelfArrayToBeSent.push(chunkedGelfBuffer)
  }
  return this.gelfArrayToBeSent
}

module.exports = UDPInterface

// ¹: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
