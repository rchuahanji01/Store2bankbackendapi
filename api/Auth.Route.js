const express = require('express')
const router = express.Router()
const AuthController = require('../Controllers/Auth.Controller')

router.post('/register', AuthController.register)

router.post('/login', AuthController.login)

router.post('/refresh-token', AuthController.refreshToken)

router.post('/logout', AuthController.logout)

router.post('/users' ,AuthController.getAllUsers )

router.post('/users/search', AuthController.searchUsers);

router.post('/users/delete', AuthController.deleteUserByBody);

router.post('/users/update', AuthController.updateUserByBody);

module.exports = router
