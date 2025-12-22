const express = require('express')
const router = express.Router()

const {registerUser,loginUser,resetPassword} = require('../controllers/authController');

router.post("/signup",registerUser)
router.post("/login",loginUser)
router.post("/reset",resetPassword)

module.exports = router; 