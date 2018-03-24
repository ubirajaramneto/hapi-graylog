'use strict'
const os = require('os')
const UDPInterface = require('./lib/sending-interfaces/udp')
const { parseLevel, GELFMessageFactory } = require('./lib/gelf')

let internals = {
  sendGelfMessage: function (tag, data, options) {
    try {
      data.source = options.source
      const gelfPayload = gelfFactory(data, tag)
      if (gelfPayload.level > options.level) {
        return
      }
      const udpSender = new UDPInterface(
        gelfPayload,
        options.config,
        options.port,
        options.host
      )
      udpSender.send()
    } catch(e) {
      console.log(e)
    }
  },
  pluginFactory: function (logType, options) {
    if(logType === 'server') {
      return function (event) {
        internals.sendGelfMessage(event.tags[0], event.data, options)
      }
    } else if(logType === 'request') {
      return function (request, event) {
        internals.sendGelfMessage(event.tags[0], event.data, options)
      }
    }
  }
}

exports.register = function (server, options, next) {
  options.source = options.source ? options.source : os.hostname()
  options.level = parseLevel(options.level || 'debug')
  const serverLogHandler = internals.pluginFactory('server', options)
  const requestLogHandler = internals.pluginFactory('request', options)
  server.on('log', serverLogHandler)
  server.on('request', requestLogHandler)
  next()
}

exports.register.attributes = { pkg: require('./package.json') }
