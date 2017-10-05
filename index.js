'use strict'

const path = require('path')
const UDPInterface = require(path.resolve('lib/sending-interfaces/udp'))
const gelfFactory = require(path.resolve('lib/gelf/index'))

let internals = {
  sendGelfMessage: function (tag, data, options) {
    try {
      const gelfPayload = gelfFactory(data, tag)
      const udpSender = new UDPInterface(
        gelfPayload,
        options.config,
        options.port,
        options.host
      )
      console.log(gelfPayload)
      udpSender.send()
      console.log('payload sent**')
    } catch(e) {
      console.log(e)
    }
  },
  pluginFactory: function (logType, options) {
    if(logType === 'server') {
      return function (event, tags) {
        internals.sendGelfMessage(tags[0], event.data, options)
      }
    } else if(logType === 'request') {
      return function (request, event, tags) {
        internals.sendGelfMessage(tags[0], event.data, options)
      }
    }
  }
}

exports.register = function (server, options, next) {
  const serverLogHandler = internals.pluginFactory('server', options)
  const requestLogHandler = internals.pluginFactory('request', options)
  server.on('log', serverLogHandler)
  server.on('request', requestLogHandler)
  next()
}

exports.register.attributes = { pkg: require('./package.json') }
