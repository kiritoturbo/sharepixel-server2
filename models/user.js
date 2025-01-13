const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto')

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,//ko được trùng
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:'user',
    },
    isSharePixelRole:{
        type:String,
        default:1,//1 là ko có quyền share
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    isAccess:{
        type:Boolean,
        default:false,
    },
    refreshToken:{
        type:String,
    },
    passwordChangedAt:{
        type:String
    },
    passwordResetToken:{
        type:String
    },
    passwordRestExpires:{
        type:String
    }
},{
    timestamps:true
});

//ko sử dụng được arrow function
userSchema.pre('save', async function (next) {//thực hiện trước khi lưu dữ liệu
    if (!this.isModified('password')) {
        next()
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
})
userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    },
    createPasswordChangedToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000
        return resetToken
    }
}

//Export the model
module.exports = mongoose.model('User', userSchema);