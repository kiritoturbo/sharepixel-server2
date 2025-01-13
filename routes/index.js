const { init } = require('../models/user')
const userRouter=require('./user')
const tokenfbRouter=require('./tokenfb')
const { notFound, errHandler } = require('../middlewares/errHandler')

const initRoutes=(app)=>{
    app.use('/api/user',userRouter)
    app.use('/api/tokenfb',tokenfbRouter)


    
    app.use(notFound)
    app.use(errHandler)
    
}


module.exports=initRoutes