// const redis = require('redis')

// const client = redis.createClient({
//   port: 6379,
//   host: '127.0.0.1',
// })

// client.on('connect', () => {
//   console.log('Client connected to redis...')
// })

// client.on('ready', () => {
//   console.log('Client connected to redis and ready to use...')
// })

// client.on('error', (err) => {
//   console.log(err.message)
// })

// client.on('end', () => {
//   console.log('Client disconnected from redis')
// })

// process.on('SIGINT', () => {
//   client.quit()
// })

// module.exports = client

// helpers/init_redis.js
const { createClient } = require('redis')

const client = createClient()

client.on('error', (err) => console.error('❌ Redis Client Error:', err))

;(async () => {
  try {
    if (!client.isOpen) {
      await client.connect()
      console.log('✅ Redis connected.')
    }
  } catch (err) {
    console.error('Failed to connect Redis:', err.message)
  }
})()

module.exports = client
