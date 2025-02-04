const mongoose = require('mongoose'); // Erase if already required
const moment = require('moment'); 

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
// Middleware trước khi lưu để điều chỉnh thời gian theo UTC-7
historyshareSchema.pre('save', function (next) {
    // Sử dụng Moment.js để chuyển đổi thời gian sang UTC-7
    const currentTimeUTC7 = moment().utcOffset('-07:00').toDate();
    
    // Cập nhật giá trị createdAt và updatedAt
    this.createdAt = currentTimeUTC7;
    this.updatedAt = currentTimeUTC7;

    next(); // Tiến hành lưu dữ liệu
});


//Export the model
module.exports = mongoose.model('historysharepixel', historyshareSchema);