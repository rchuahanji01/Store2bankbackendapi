
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
  getAllUsers: async (req, res, next) => {
  try {
    // Extract pagination params from body (or default)
    const { page = 1, limit = 10 } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find({}, '-password')
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments()
    ]);

    res.status(200).json({
      code: 200,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    next(createError.InternalServerError("Failed to fetch users"));
  }
},
 searchUsers: async (req, res, next) => {
    try {
      const { search = '', page = 1, limit = 10 } = req.body;

      const query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
        ]
      };

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query, '-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      res.status(200).json({
        code: 200,
        message: 'Users fetched successfully',
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('❌ Error in searchUsers:', error);
      next(createError.InternalServerError('Failed to search users'));
    }
  },
  // Delete user by ID from body
deleteUserByBody: async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return next(createError.BadRequest("User ID is required"));

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return next(createError.NotFound("User not found"));

    res.status(200).json({
      code: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(createError.InternalServerError("Failed to delete user"));
  }
},

// Update user by ID from body
updateUserByBody: async (req, res, next) => {
  try {
    const { id, name, email, mobileNumber, role } = req.body;
    if (!id) return next(createError.BadRequest("User ID is required"));

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, mobileNumber, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return next(createError.NotFound("User not found"));

    res.status(200).json({
      code: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(createError.InternalServerError("Failed to update user"));
  }
},


}
