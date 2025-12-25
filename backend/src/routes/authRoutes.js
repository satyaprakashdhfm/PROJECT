const express = require('express')
const router = express.Router()

const {registerUser, loginUser, resetPassword, logoutUser} = require('../controllers/authController');

router.post("/signup", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/reset", resetPassword)

module.exports = router; 