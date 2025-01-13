const mongoose = require('mongoose'); // Erase if already required


// Declare the Schema of the Mongo model
var tokenfbSchema = new mongoose.Schema({
    tokenbm:{
        type:String,
        required:true,
    },
    bmid:{
        type:String,
        // required:true,
    },
},{
    timestamps:true
});

//Export the model
module.exports = mongoose.model('tokenfb', tokenfbSchema);