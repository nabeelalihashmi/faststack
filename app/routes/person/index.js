const personController = require('../../controllers/person_controller');
const PersonModel = require('../../models/Person');

module.exports = async function (fastify, opts) {

  fastify.get('/', async function (request, reply) {
    
     res = await personController.getAllPersons(request, reply);
     return res;
    })
    
    fastify.post('/', async function (request, reply) {
    res = await personController.addPerson(request, reply);
    return res;
  })

}
