'use strict'

module.exports = function (request, reply) {
  request.log('emergency', {some_field: 'some data', short_message: 'AHA! Here it is!'})
  reply('ok')
}
