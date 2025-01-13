const mongoose = require('mongoose'); // Erase if already required


// Declare the Schema of the Mongo model
var historyshareSchema = new mongoose.Schema({
    user_id:{
        type:String,
        // required:true,
    },
    phanquyen:{
        type:String,
        // required:true,
    },
    name:{
        type:String,
        // required:true,
    },
    idads:{
        type:String,
        required:true,
    },
    idpixel:{
        type:String,
        required:true,
    },
    trangthai:{
        type:String,
        required:true,
    },
    tokenbm: {
        type: String,
        required: false, // Không bắt buộc
    },
    
},{
    timestamps:true
});



//Export the model
module.exports = mongoose.model('historysharepixel', historyshareSchema);