const Joi = require('@hapi/joi')

const authSchema = Joi.object({
   email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  mobileNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': `Mobile number must be a valid 10-digit Indian number`,
    }),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'store_manager', 'delivery_person').required(),
})



module.exports = {
  authSchema,
  registerSchema
}
