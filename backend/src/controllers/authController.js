const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.registerUser = async(req,res) => {
    
    try{
        const {username, email, password} = req.body
      
        if(!username || !email || !password) return res.status(400).json({error:"Username, email and password are required"});
        
        // Username validation
        if(username.length < 3) return res.status(400).json({error:"Username must be at least 3 characters"});
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) return res.status(400).json({error:"Invalid email format"});
        
        // Password validation
        if(password.length < 6) return res.status(400).json({error:"Password must be at least 6 characters"});
        
        // Check if username or email already exists
        const usernameExists = await User.findOne({username})
        if(usernameExists) return res.status(400).json({error:"Username already taken"})
        
        const emailExists = await User.findOne({email})
        if(emailExists) return res.status(400).json({error:"Email already exists"})
        
        const hashPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            username,
            email,
            password:hashPassword
        }) 

        // Create token and set cookie for immediate login after signup
        const token = jwt.sign({id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: "1d"});
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({message:"User registered successfully", username: user.username});
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

        const token = jwt.sign({id:user._id, username: user.username},
                               process.env.JWT_SECRET,
                               {expiresIn:"1d"});
        
        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        
        res.status(200).json({message: "Login successful", username: user.username});
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

exports.logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({message: "Logout successful"});
}

// Verify if user is authenticated (for protected routes)
exports.verifyAuth = async (req, res) => {
    try {
        // Fetch user from database to get username
        const user = await User.findById(req.user.id).select('username email');
        
        if (!user) {
            return res.status(401).json({authenticated: false});
        }
        
        // If middleware passed, user is authenticated
        res.status(200).json({
            authenticated: true,
            user: {
                id: req.user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(401).json({authenticated: false});
    }
}