const person = require('../models/Person')

const addPerson = async (request, reply) => {
}
const getPersonById = async (request, reply) => {
   return request.params.id;
}
const getAllPersons = async (request, reply) => {
   return 'Pink';
}

module.exports = { 
   addPerson,
   getPersonById,
   getAllPersons
}
