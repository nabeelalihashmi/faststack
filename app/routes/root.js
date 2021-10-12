'use strict'

module.exports = async function (fastify, opts) {

  // return index.html for all frontend routes
  fastify.get('/', async function (request, reply) {
    return reply.sendFile('index.html');
  })
  fastify.get('/person', async function (request, reply) {
    return reply.sendFile('index.html');
  })
  fastify.get('/person/:id', async function (request, reply) {
    return reply.sendFile('index.html');
  })
  fastify.get('/add_person', async function (request, reply) {
    return reply.sendFile('index.html');
  })
}