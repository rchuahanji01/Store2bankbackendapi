const express = require('express')
const router = express.Router()
const AuthController = require('../Controllers/Auth.Controller')

router.post('/register', AuthController.register)

router.post('/login', AuthController.login)

router.post('/refresh-token', AuthController.refreshToken)

router.delete('/logout', AuthController.logout)

router.get('/users' ,AuthController.getAllUsers )

router.post('/users/search', AuthController.searchUsers);

router.delete('/users', AuthController.deleteUserByBody);

router.put('/users', AuthController.updateUserByBody);

module.exports = router
