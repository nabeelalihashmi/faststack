const Person = require('../models/Person')

const addPerson = async (request, reply) => {
   const newPerson = new Person({
      name: request.params.name, 
      cnic: request.params.cnic, 
   });

   p = await newPerson.save(); 
   return p;
}

const addRealPerson = async (request, reply) => {
   const newPerson = new Person({
      name: request.body.name, 
      cnic: request.body.cnic, 
   });

   p = await newPerson.save(); 
   return  {p};
}
const getPersonById = async (request, reply) => {
   const person = await Person.find({ _id: request.params.id });
   return person;
}
const getAllPersons = async (request, reply) => {
   const users = await Person.find({});
   return users;
}

module.exports = { 
   addPerson,
   getPersonById,
   getAllPersons,
   addRealPerson
}
