'use strict'

const crypto = require('crypto')

const HEADER_FIRST_MAGIC_BYTE_POSITION  = 0
const HEADER_SECOND_MAGIC_BYTE_POSITION = 1
const HEADER_CHUNK_COUNT_POSITION       = 10
const HEADER_CHUNK_TOTAL_POSITION       = 11
const HEADER_SIZE                       = 12

function UDPInterface (gelfObject, options={MAX_BUFFER_SIZE: 7500}) {
  this.gelfPayload    = Buffer.from(JSON.stringify(gelfObject))
  this.gelfBufferSize = Buffer.byteLength(this.gelfPayload)
  this.options        = options
}

UDPInterface.prototype.send = function () {
  if(this.isPayloadChunkable()) {
    this.prepareChunkedGelf()
  } else {
    // compress and send the json payload
    // if(this.options) {
    //   this.client.send(this.gelfPayload, this.options.graylog_port, this.options.graylog_host, (err) => {
    //     console.log('ERROR WHEN SENDING GRAYLOG PAYLOAD')
    //     console.log(err)
    //   })
    // }
    // console.log('Options not set for graylog UDPInterface')
  }
}

UDPInterface.prototype.isPayloadChunkable = function () {
  return Buffer.byteLength(Buffer.from(JSON.stringify(this.gelfPayload))) > this.options.MAX_BUFFER_SIZE
}

UDPInterface.prototype.calculateChunkTotal = function () {
  // this.chunkTotal = Math.floor(this.gelfBufferSize/this.options.MAX_BUFFER_SIZE)
  // x = ((h * (bs/mbs)) + bs) / mbs
  // ( ( 12 × ( 128 ÷ 20 ) ) + 128) ÷ 20 = 10
  this.chunkTotal = Math.ceil(this.gelfBufferSize/(this.options.MAX_BUFFER_SIZE - HEADER_SIZE) - 1)

  return this.chunkTotal
}

UDPInterface.prototype.prepareChunkedGelf = function () {

  function inserChunkedMagicBytes (_chunkedGelfBuffer) {
    _chunkedGelfBuffer[HEADER_FIRST_MAGIC_BYTE_POSITION] = 0x1e
    _chunkedGelfBuffer[HEADER_SECOND_MAGIC_BYTE_POSITION] = 0x0f
  }

  function generateChunkId () {
    return crypto.randomBytes(8)
  }

  // We need to allocate space in the header before inserting the contents

  const allocateBufferHead = () =>  // arrow function so we can use ¹lexical scoping
     Buffer.alloc(this.options.MAX_BUFFER_SIZE)


  this.calculateChunkTotal()

  let chunkedGelfBuffer
  let chunkedGelfArray = []
  const id = generateChunkId()
  for (let i = 0; i <= this.chunkTotal; i++) {
    chunkedGelfBuffer = null
    chunkedGelfBuffer = allocateBufferHead()
    inserChunkedMagicBytes(chunkedGelfBuffer)
    id.copy(chunkedGelfBuffer, 2, 0, 8)
    chunkedGelfBuffer[HEADER_CHUNK_COUNT_POSITION] = i
    chunkedGelfBuffer[HEADER_CHUNK_TOTAL_POSITION] = this.chunkTotal
    this.gelfPayload.copy(chunkedGelfBuffer, HEADER_SIZE, i * (this.options.MAX_BUFFER_SIZE - HEADER_SIZE))
    chunkedGelfArray.push(chunkedGelfBuffer)
  }
  return chunkedGelfArray

}

UDPInterface.prototype.getGelfBuffer = function () {
  return this.gelfPayload
}

UDPInterface.prototype.getGelfBufferSize = function () {
  return this.gelfBufferSize
}

// Dependency injection utility
if(process.env.NODE_ENV === 'test') {
  UDPInterface.prototype.injectDependency = function (mockObject) {
    for(let key in mockObject) {
      this[key] = mockObject[key]
    }
  }
}

module.exports = UDPInterface

// ¹: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions