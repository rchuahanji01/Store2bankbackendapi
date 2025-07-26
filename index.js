// const express = require('express')
// const app = express();
// const bodyParser = require('body-parser')
// app.use(bodyParser.json())
// const dotenv = require('dotenv')
// dotenv.config()
// const port =process.env.port || 4001

// app.get('/' , async (request , response , next)=>{
//     try{
//         response.send('hellow')
//     }catch(err){
//         response.status(500).json({Message:"something went wrong" , err})
//     }
// })

// app.listen(port , ()=>{
//     console.log(`server is running on http://localhost:${port} `)
// })

const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const { verifyAccessToken } = require('./helpers/jwt_helper')
// require('./helpers/init_redis')

const cors = require('cors');

// Allow requests from your React frontend
app.use(
  cors({
    origin: ['http://localhost:5173'], // ✅ allow React dev server
    credentials: true, // ✅ allow cookies if using them
  })
);


const AuthRoute = require('./api/Auth.Route')
console.log("down the authRoute")
const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', verifyAccessToken, async (req, res, next) => {
  res.send('Hello from express.')
})

app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
  next(createError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
