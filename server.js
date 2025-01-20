const express = require('express')
require('dotenv').config()
const dbConnect=require('./config/dbconnect')
const initRoutes = require('./routes')
const cookieParser= require('cookie-parser')
const cors = require('cors');


const app = express()
app.use(cookieParser())
const port = process.env.PORT || 8888


// Cấu hình CORS
app.use(cors({
    // origin: 'https://sharepixel-ui.web.app', // URL của frontend
    origin: 'https://truestorepixel.com', // URL của frontend
    // origin: 'http://localhost:3000', // URL của frontend
    // credentials: true, // Cho phép cookie
}));
app.use(express.json())//cho express đọc được dạng json
app.use(express.urlencoded({extended:true}))

dbConnect()
initRoutes(app)

app.use('/',(req,res)=>{
    res.send('SERVER onnnnn')
})


app.listen(port,()=>{
    console.log('server running on the port '+ port)
})