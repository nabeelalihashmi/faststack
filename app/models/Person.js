const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
  name: String,
  cnic: String
});

const PersonModel = mongoose.model('Pesrson', personSchema);

module.exports = PersonModel;