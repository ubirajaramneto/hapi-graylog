'use strict'

const path = require('path')
const UDPInterface = require(path.resolve('lib/sending-interfaces/udp'))
const gelfFactory = require(path.resolve('lib/gelf/index'))

exports.register = function (server, options, next) {
  server.on('request', (request, event) => {
    try {
      const gelfPayload = gelfFactory(event.data.short_message, event.data, event.tags[0])
      const udpSender = new UDPInterface(
        gelfPayload,
        options.gelfServerOptions,
        options.graylogPort,
        options.graylogHost
      )
      console.log(gelfPayload)
      udpSender.send()
      console.log('payload sent**')
    } catch(e) {
      console.log(e)
    }
  })
  next()
}

exports.register.attributes = { pkg: require('./package.json') }
