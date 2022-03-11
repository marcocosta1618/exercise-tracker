const mongoose = require('mongoose')

const userDataSchema = new mongoose.Schema({
   username: String,
   count: Number,
   log: [{
      description: String,
      duration: Number,
      date: String
   }],
}) 

const userData = mongoose.model('userData', userDataSchema)

module.exports = userData