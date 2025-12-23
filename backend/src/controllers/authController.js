/**
 * User Story 1: Account Creation and Authentication
 * Description: As a user, I should be able to create an account on Wealthwise and log in to the application.
 * 
 * Features:
 * - registerUser() - Create new user account with email and password
 * - loginUser() - Login with credentials and receive JWT token
 * - resetPassword() - Reset user password
 */

const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.registerUser = async(req,res) => {
    
    try{
        const {email,password} = req.body
      
        if(!email || !password) return res.status(400).json({error:"Email and password are required"});
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) return res.status(400).json({error:"Invalid email format"});
        
        // Password validation
        if(password.length < 6) return res.status(400).json({error:"Password must be at least 6 characters"});
        
        const userExists = await User.findOne({email})
        
        if(userExists) return res.status(400).json({error:"User already exists"})
        
        const hashPassword = await bcrypt.hash(password,10)

        const user = await User.create({   
            email,
            password:hashPassword
        }) 

        res.status(201).json({message:"User registered successfully"})
    }
    catch(error){ 
        res.status(400).json({error:"Invalid request body"})
    }
}

exports.loginUser = async(req,res) => {
    const {email,password} = req.body

    try{
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({error:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        
        if(!isMatch){
            return res.status(400).json({error:"Invalid credentials"})
        }

        const token = jwt.sign({id:user._id},
                               process.env.JWT_SECRET,
                               {expiresIn:"1d"});
        
        res.status(200).json({token}) 
    }
    catch(error){
        res.status(401).json({error:"Invalid credentials"})
    }
}


exports.resetPassword = async(req,res) => {
    const {email, newPassword} = req.body
    
    try{
        if(!email || !newPassword) return res.status(400).json({error:"Email and new password are required"})
        
        const user = await User.findOne({email})
        
        if(!user) return res.status(400).json({error:"User doesn't exist"})
        
        const hashPassword = await bcrypt.hash(newPassword, 10)
        
        user.password = hashPassword
        await user.save()
        
        res.status(200).json({message:"Password reset successfully"})
    }
    catch(error){
        res.status(400).json({error:"Failed to reset password"})
    }
}