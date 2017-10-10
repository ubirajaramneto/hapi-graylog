'use strict'

const path = require('path')
const Hapi = require('hapi')
const handler = require('./mock-handler')

const server = new Hapi.Server()
server.connection({ port: 3000, host: 'localhost' })

server.register(require(path.resolve('index')), (err) => {
  if(err) console.log(err)
})

server.route({
  method: 'GET',
  path: '/log',
  handler: handler
})

server.start((err) => {

  if (err) {
    throw err
  }

  console.log(`Server running at: ${server.info.uri}`)
  server.log('emergency', {server_message: 'server started at' + server.info.uri})

})
