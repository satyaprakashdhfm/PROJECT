const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('../model/User');
const Expense = require('../model/Expense');
const Budget = require('../model/Budget');
const Goal = require('../model/Goal');

// dotenv.config();

// Load sample data from db.json
const sampleData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8')
);

/**
 * Database Initialization Script for Wealthwise
 * This script initializes MongoDB collections with dummy data from db.json
 */

const initDatabase = async () => {
    try {
        // Connect to MongoDB
        // await mongoose.connect(process.env.MONGO_URI);
        // console.log('Connected to MongoDB');

        // Optional: Clear existing data (uncomment if you want fresh start)
        await clearDatabase();

        // Create dummy data
        const users = await createUsers();
        await createExpenses(users);
        await createBudgets(users);
        await createGoals(users);

        console.log('Database initialization completed successfully!');
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
};

/**
 * Clear all collections (optional)
 */
const clearDatabase = async () => {
    try {
        await User.deleteMany({});
        await Expense.deleteMany({});
        await Budget.deleteMany({});
        await Goal.deleteMany({});
    } catch (error) {
        console.error('Error clearing database:', error.message);
    }
};

/**
 * Create dummy users from db.json
 */
const createUsers = async () => {
    try {
        const password = await bcrypt.hash(sampleData.users[0].password, 10);

        const createdUsers = [];
        for (const userData of sampleData.users) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = await User.create({
                    username: userData.username,
                    email: userData.email,
                    password
                });
                console.log(`Created user: ${userData.username} (${userData.email})`);
            } else {
                console.log(`User already exists: ${userData.email}`);
            }
            createdUsers.push(user);
        }

        return createdUsers;
    } catch (error) {
        console.error('Error creating users:', error.message);
        throw error;
    }
};

/**
 * Create dummy expenses for users using data from db.json
 */
const createExpenses = async (users) => {
    try {
        const today = new Date();
        const expensesData = [];

        // Map expense templates to actual user IDs
        for (const expenseTemplate of sampleData.expenses) {
            const user = users[expenseTemplate.userIndex];
            
            if (user) {
                const expenseDate = new Date(today);
                expenseDate.setDate(expenseDate.getDate() - expenseTemplate.daysAgo);

                expensesData.push({
                    user: user._id,
                    amount: expenseTemplate.amount,
                    date: expenseDate,
                    category: expenseTemplate.category,
                    description: expenseTemplate.description,
                    merchant: expenseTemplate.merchant
                });
            }
        }

        // Insert all expenses
        const expenses = await Expense.insertMany(expensesData);
        console.log(`Created ${expenses.length} expenses across ${users.length} users`);

        return expenses;
    } catch (error) {
        console.error('Error creating expenses:', error.message);
        throw error;
    }
};

/**
 * Create budgets for users from db.json
 */
const createBudgets = async (users) => {
    try {
        const budgets = [];
        for (const user of users) {
            for (const budget of sampleData.budgets) {
                const existingBudget = await Budget.findOne({
                    userId: user._id,
                    category: budget.category
                });

                if (!existingBudget) {
                    const newBudget = await Budget.create({
                        userId: user._id,
                        ...budget
                    });
                    budgets.push(newBudget);
                }
            }
        }

        console.log(`Created ${budgets.length} budget entries across ${users.length} users`);
        return budgets;
    } catch (error) {
        console.error('Error creating budgets:', error.message);
        throw error;
    }
};

/**
 * Create financial goals for users from db.json
 */
const createGoals = async (users) => {
    try {
        const goals = [];
        for (const user of users) {
            // Each user gets 2-3 random goals
            const numGoals = Math.floor(Math.random() * 2) + 2;
            
            const shuffled = [...sampleData.goals].sort(() => 0.5 - Math.random());
            const selectedGoals = shuffled.slice(0, numGoals);

            for (const goalTemplate of selectedGoals) {
                const existingGoal = await Goal.findOne({
                    userId: user._id,
                    goal: goalTemplate.goal
                });

                if (!existingGoal) {
                    const newGoal = await Goal.create({
                        userId: user._id,
                        ...goalTemplate
                    });
                    goals.push(newGoal);
                }
            }
        }

        console.log(`Created ${goals.length} financial goals across ${users.length} users`);
        return goals;
    } catch (error) {
        console.error('Error creating goals:', error.message);
        throw error;
    }
};

// Execute the initialization (only when run directly, not when imported)
if (require.main === module) {
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    
    dotenv.config();
    
    const runInit = async () => {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('Connected to MongoDB');
            
            await initDatabase();
            
            console.log('\nDatabase initialization completed! You can now start the server.');
            process.exit(0);
        } catch (error) {
            console.error('Initialization failed:', error.message);
            process.exit(1);
        }
    };
    
    runInit();
}

module.exports = initDatabase
