'use strict'

module.exports = async function (fastify, opts) {
  
  // return index.html for all frontend routes
  fastify.get('/', async function (request, reply) {
    return reply.sendFile('index.html');
  })
}