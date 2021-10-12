const personController = require('../../../controllers/person_controller');
const PersonModel = require('../../../models/Person');

module.exports = async function (fastify, opts) {

  fastify.get('/', async function (request, reply) {

    res = await personController.getAllPersons(request, reply);
    return res;
  })

  fastify.get('/add/:name/:cnic', async function (request, reply) {
    res = await personController.addPerson(request, reply);
    return res;
  })

  fastify.post('/add', async function (request, reply) {
    res = await personController.addRealPerson(request, reply);
    return res;
  })

  fastify.get('/list/:id', async function (request, reply) {
    res = await personController.getPersonById(request, reply);
    return res;
  })
  
  fastify.get('/list', async function (request, reply) {
    res = await personController.getAllPersons(request, reply);
    return res;
  })

}
