const express = require('express')
const router = express.Router()
const protect = require('../utilities/authMiddleware')

const {registerUser, loginUser, resetPassword, forgotPassword, resetPasswordWithToken, logoutUser, verifyAuth} = require('../controllers/authController');

router.post("/signup", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/reset", resetPassword)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPasswordWithToken)
router.get("/verify", protect, verifyAuth)

module.exports = router; 