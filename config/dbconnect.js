const {default:mongose} = require('mongoose')
mongose.set('strictQuery',false)
const dbConnect = async ()=>{
    try {
        const conn = await mongose.connect(process.env.MONGODB_URI)
        if(conn.connection.readyState ===1 ) console.log('DB connection is successfully')
            else console.log('db connecting');
            
        
    } catch (error) {
        console.log('Db Connect is failed');
        throw new Error(error)
        
    }
}

module.exports=dbConnect