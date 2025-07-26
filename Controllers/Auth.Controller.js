

// const createError = require('http-errors')
// const User = require('../Models/User.model')
// const { authSchema ,registerSchema } = require('../helpers/validation_schema')
// const {
//   signAccessToken,
//   signRefreshToken,
//   verifyRefreshToken,
// } = require('../helpers/jwt_helper')

// module.exports = {
//   register: async (req, res, next) => {
//     try {
//       const result = await registerSchema.validateAsync(req.body)

//       const doesExist = await User.findOne({ email: result.email })
//       if (doesExist)
//         throw createError.Conflict(`${result.email} is already registered`)

//       const user = new User(result)
//       const savedUser = await user.save()
//       const accessToken = await signAccessToken(savedUser.id)
//       const refreshToken = await signRefreshToken(savedUser.id)

//       res.send({ accessToken, refreshToken })
//     } catch (error) {
//       if (error.isJoi === true) error.status = 422
//       next(error)
//     }
//   },

//   login: async (req, res, next) => {
//     try {
//       const result = await authSchema.validateAsync(req.body)
//       const user = await User.findOne({ email: result.email })
//       if (!user) throw createError.NotFound('User not registered')

//       const isMatch = await user.isValidPassword(result.password)
//       if (!isMatch)
//         throw createError.Unauthorized('Username/password not valid')

//       const accessToken = await signAccessToken(user.id)
//       const refreshToken = await signRefreshToken(user.id)

//       res.send({ accessToken, refreshToken })
//     } catch (error) {
//       if (error.isJoi === true)
//         return next(createError.BadRequest('Invalid Username/Password'))
//       next(error)
//     }
//   },

//   refreshToken: async (req, res, next) => {
//     try {
//       const { refreshToken } = req.body
//       if (!refreshToken) throw createError.BadRequest()
//       const userId = await verifyRefreshToken(refreshToken)

//       const accessToken = await signAccessToken(userId)
//       const newRefreshToken = await signRefreshToken(userId)
//       res.send({ accessToken, refreshToken: newRefreshToken })
//     } catch (error) {
//       next(error)
//     }
//   },

//   logout: async (req, res, next) => {
//     try {
//       // In this simplified version, we don't invalidate refresh tokens
//       // To truly logout, you'd store blacklisted tokens in DB or Redis
//       res.sendStatus(204)
//     } catch (error) {
//       next(error)
//     }
//   },
// }


const createError = require('http-errors')
const User = require('../Models/User.model')
const { authSchema, registerSchema } = require('../helpers/validation_schema')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_helper')

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await registerSchema.validateAsync(req.body)

      const existingEmail = await User.findOne({ email: result.email })
      if (existingEmail)
        throw createError.Conflict(`${result.email} is already registered`)

      const existingMobile = await User.findOne({ mobileNumber: result.mobileNumber })
      if (existingMobile)
        throw createError.Conflict(`Mobile ${result.mobileNumber} is already registered`)

      const user = new User(result)
      const savedUser = await user.save()

      const accessToken = await signAccessToken(savedUser.id)
      const refreshToken = await signRefreshToken(savedUser.id)

      res.status(201).send({ accessToken, refreshToken })
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body)

      const user = await User.findOne({ email: result.email })
      if (!user) throw createError.NotFound('User not registered')

      const isMatch = await user.isValidPassword(result.password)
      if (!isMatch)
        throw createError.Unauthorized('Username/password not valid')

      const accessToken = await signAccessToken(user.id)
      const refreshToken = await signRefreshToken(user.id)

      res.send({ accessToken, refreshToken })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Username/Password'))
      next(error)
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()

      const userId = await verifyRefreshToken(refreshToken)

      const accessToken = await signAccessToken(userId)
      const newRefreshToken = await signRefreshToken(userId)

      res.send({ accessToken, refreshToken: newRefreshToken })
    } catch (error) {
      next(error)
    }
  },

  logout: async (req, res, next) => {
    try {
      // If Redis/DB token storage is added, invalidate refresh token here
      res.status(200).send({ message: 'User logged out successfully' })
    } catch (error) {
      next(error)
    }
  },
}
