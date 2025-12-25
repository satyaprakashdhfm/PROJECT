const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDb = require('./utilities/db')
const authRoute = require('./routes/authRoutes')
const expenseRoute = require('./routes/expenseRoutes')
const importRoute = require('./routes/importRoutes')
const budgetRoute = require('./routes/budgetRoutes')
const dashboardRoute = require('./routes/dashboardRoutes')
const exportRoute = require('./routes/exportRoutes')
const goalRoute = require('./routes/goalRoutes')

dotenv.config()
connectDb()
const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.originalUrl}`)
    console.log('📦 Body:', JSON.stringify(req.body))
    console.log('🔑 Headers:', req.headers.authorization ? 'Token Present' : 'No Token')
    
    // Capture response
    const originalSend = res.send
    res.send = function(data) {
        console.log('✅ Response:', typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200))
        console.log('---')
        originalSend.call(this, data)
    }
    
    next()
})

app.use('/api/v1/auth',authRoute) 
app.use('/api/v1/expense',expenseRoute)
app.use('/api/v1/import',importRoute)
app.use('/api/v1/budgets',budgetRoute)
app.use('/api/v1/dashboard',dashboardRoute)
app.use('/api/v1/export',exportRoute)
app.use('/api/v1/goals',goalRoute)

app.get("/",(req,res)=>{
    res.send("Wealthwise API Running");
})

const PORT = process.env.PORT || 3000  
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
});


