'use strict'

module.exports = {
  LARGE_GELF_BUFFER: Buffer.alloc(8192, '0'),
  EXTRA_LARGE_GELF_BUFFER: Buffer.alloc(100000, '0'),
  EXTRA_LARGE_GELF_OBJECT: {
    'version': '1.1',
    'host': 'some_weird_host_name',
    'short_message': 'some simple message',
    '_something': '123'
  }
}