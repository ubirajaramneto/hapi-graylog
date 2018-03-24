'use strict'

const crypto = require('crypto')
const dgram = require('dgram')
const zlib = require('zlib')

const HEADER_FIRST_MAGIC_BYTE_POSITION  = 0
const HEADER_SECOND_MAGIC_BYTE_POSITION = 1
const HEADER_CHUNK_COUNT_POSITION       = 10
const HEADER_CHUNK_TOTAL_POSITION       = 11
const HEADER_SIZE                       = 12

function UDPInterface (
  gelfObject,
  options = {
    MAX_BUFFER_SIZE: 1350,
    COMPRESS: true
  },
  gelfServerPort = 12202,
  gelfServerHost = 'localhost'
) {
  this.gelfObject        = gelfObject
  this.gelfArrayToBeSent = []
  this.gelfServerHost    = gelfServerHost
  this.gelfServerPort    = gelfServerPort
  this.options           = options
  this.socket            = dgram.createSocket('udp4')
}

UDPInterface.prototype.prepareGelfBuffer = async function () {
  this.gelfPayload = await compressPayloadIfCompressable(Buffer.from(JSON.stringify(this.gelfObject)), this.options.COMPRESS)
  this.gelfBufferSize = Buffer.byteLength(this.gelfPayload)
}

UDPInterface.prototype.send = async function () {
  await this.prepareGelfBuffer()
  if(this.isPayloadChunkable()) {
    await this.prepareChunkedGelf()
    this.dispatchPackets()
  } else {
    try {
      this.gelfArrayToBeSent.push(this.gelfPayload)
      this.dispatchPackets()
    } catch (e) {
      console.log(e)
    }
  }
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
          console.error('Could not send GELF payload to server')
          console.error(err)
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

  if (this.chunkTotal >= 128) {
    console.log('hapi-graylog: Too many chunks to be sent, please increase MAX_BUFFER_SIZE or send smaller messages')
    return
  }

  let chunkedGelfBuffer
  let remainingPayloadSize
  const id = generateChunkId()
  for (let chunkIndex = 0; chunkIndex < this.chunkTotal; chunkIndex++) {
    chunkedGelfBuffer = null
    remainingPayloadSize = Math.ceil(
      this.gelfBufferSize - chunkIndex * (this.options.MAX_BUFFER_SIZE - HEADER_SIZE)
    )
    chunkedGelfBuffer = allocateBufferSpace(remainingPayloadSize)
    inserChunkedMagicBytes(chunkedGelfBuffer)
    id.copy(chunkedGelfBuffer, 2, 0, 8)
    chunkedGelfBuffer[HEADER_CHUNK_COUNT_POSITION] = chunkIndex
    chunkedGelfBuffer[HEADER_CHUNK_TOTAL_POSITION] = this.chunkTotal
    this.gelfPayload.copy(
      chunkedGelfBuffer,
      HEADER_SIZE,
      chunkIndex * (this.options.MAX_BUFFER_SIZE - HEADER_SIZE)
    )
    this.gelfArrayToBeSent.push(chunkedGelfBuffer)
  }
}

function compressPayloadIfCompressable (targetBuffer, shouldCompress) {
  return new Promise((resolve, reject) => {
    if(shouldCompress === true || shouldCompress === undefined) {
      zlib.deflate(targetBuffer, (err, compressedBuffer) => {
        if (err) {
          return reject(err)
        }
        return resolve(compressedBuffer)
      })
    } else {
      return resolve(targetBuffer)
    }
  })
}

module.exports = UDPInterface

// ¹: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
