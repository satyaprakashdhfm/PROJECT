const express = require('express')
const router = express.Router()
const protect = require('../utilities/authMiddleware')

const {registerUser, loginUser, resetPassword, logoutUser, verifyAuth} = require('../controllers/authController');

router.post("/signup", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/reset", resetPassword)
router.get("/verify", protect, verifyAuth)

module.exports = router; 