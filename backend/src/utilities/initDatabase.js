const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../model/User');
const Expense = require('../model/Expense');
const Budget = require('../model/Budget');
const Goal = require('../model/Goal');

dotenv.config();

/**
 * Database Initialization Script for Wealthwise
 * This script initializes MongoDB collections with dummy data for testing
 */

const initDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Optional: Clear existing data (uncomment if you want fresh start)
        // await clearDatabase();

        // Create dummy data
        const users = await createUsers();
        await createExpenses(users);
        await createBudgets(users);
        await createGoals(users);

        console.log('✅ Database initialization completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users created: ${users.length}`);
        console.log(`   - Expenses created for each user`);
        console.log(`   - Budgets set for multiple categories`);
        console.log(`   - Financial goals created`);
        console.log('\n🔐 Test Users:');
        console.log('   Email: john.doe@example.com | Password: password123');
        console.log('   Email: jane.smith@example.com | Password: password123');
        console.log('   Email: mike.johnson@example.com | Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
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
        console.log('🗑️  Cleared existing data from all collections');
    } catch (error) {
        console.error('Error clearing database:', error.message);
    }
};

/**
 * Create dummy users
 */
const createUsers = async () => {
    try {
        const password = await bcrypt.hash('password123', 10);

        const usersData = [
            { email: 'john.doe@example.com', password },
            { email: 'jane.smith@example.com', password },
            { email: 'mike.johnson@example.com', password }
        ];

        // Check if users already exist, if not create them
        const createdUsers = [];
        for (const userData of usersData) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = await User.create(userData);
                console.log(`✓ Created user: ${userData.email}`);
            } else {
                console.log(`⚠️  User already exists: ${userData.email}`);
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
 * Create dummy expenses for users
 */
const createExpenses = async (users) => {
    try {
        const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
        
        // Generate expenses for the last 30 days
        const today = new Date();
        const expensesData = [];

        for (const user of users) {
            // Create 20-30 random expenses per user
            const numExpenses = Math.floor(Math.random() * 11) + 20;

            for (let i = 0; i < numExpenses; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const expenseDate = new Date(today);
                expenseDate.setDate(expenseDate.getDate() - daysAgo);

                const category = categories[Math.floor(Math.random() * categories.length)];
                
                // Different amount ranges for different categories
                let amount;
                switch (category) {
                    case 'Food':
                        amount = Math.floor(Math.random() * 500) + 100; // 100-600
                        break;
                    case 'Travel':
                        amount = Math.floor(Math.random() * 1000) + 200; // 200-1200
                        break;
                    case 'Shopping':
                        amount = Math.floor(Math.random() * 2000) + 300; // 300-2300
                        break;
                    case 'Bills':
                        amount = Math.floor(Math.random() * 3000) + 500; // 500-3500
                        break;
                    case 'Other':
                        amount = Math.floor(Math.random() * 800) + 100; // 100-900
                        break;
                    default:
                        amount = Math.floor(Math.random() * 500) + 100;
                }

                expensesData.push({
                    user: user._id,
                    amount,
                    date: expenseDate,
                    category,
                    description: getExpenseDescription(category),
                    merchant: getMerchantName(category)
                });
            }
        }

        // Insert all expenses
        const expenses = await Expense.insertMany(expensesData);
        console.log(`✓ Created ${expenses.length} expenses across ${users.length} users`);

        return expenses;
    } catch (error) {
        console.error('Error creating expenses:', error.message);
        throw error;
    }
};

/**
 * Get random merchant based on category
 */
const getMerchantName = (category) => {
    const merchants = {
        Food: [
            'Walmart Supermarket',
            'McDonald\'s',
            'Starbucks',
            'Domino\'s Pizza',
            'Zomato',
            'Swiggy',
            'Local Restaurant',
            'Whole Foods'
        ],
        Travel: [
            'Uber',
            'Ola Cabs',
            'Shell Gas Station',
            'Amtrak',
            'Indian Railways',
            'Local Bus Service',
            'BP Petrol Pump',
            'Airport Parking'
        ],
        Shopping: [
            'Amazon',
            'Flipkart',
            'Target',
            'Best Buy',
            'Walmart',
            'Nike Store',
            'Clothing Boutique',
            'Electronics Mall'
        ],
        Bills: [
            'Electric Company',
            'Comcast Internet',
            'T-Mobile',
            'Water Authority',
            'Landlord',
            'State Farm Insurance',
            'Netflix',
            'Spotify'
        ],
        Other: [
            'CVS Pharmacy',
            'Local Gym',
            'Pet Store',
            'Entertainment Venue',
            'Healthcare Provider',
            'Charity Organization',
            'Miscellaneous',
            'General Store'
        ]
    };

    const categoryMerchants = merchants[category] || merchants.Other;
    return categoryMerchants[Math.floor(Math.random() * categoryMerchants.length)];
};

/**
 * Get random description based on category
 */
const getExpenseDescription = (category) => {
    const descriptions = {
        Food: [
            'Grocery shopping at supermarket',
            'Restaurant dinner',
            'Coffee and breakfast',
            'Lunch at cafe',
            'Fast food delivery',
            'Weekly groceries',
            'Dinner with friends',
            'Food supplies'
        ],
        Travel: [
            'Uber ride to office',
            'Gas station refill',
            'Train ticket',
            'Parking fee',
            'Taxi fare',
            'Bus pass',
            'Car maintenance',
            'Airport transfer'
        ],
        Shopping: [
            'Clothing purchase',
            'Electronics store',
            'Online shopping',
            'Home decor items',
            'Books and magazines',
            'Sports equipment',
            'Gift purchase',
            'Shoes and accessories'
        ],
        Bills: [
            'Electricity bill',
            'Internet bill',
            'Mobile phone bill',
            'Water bill',
            'Rent payment',
            'Insurance premium',
            'Credit card payment',
            'Subscription services'
        ],
        Other: [
            'Miscellaneous expense',
            'Healthcare cost',
            'Medicine',
            'Entertainment',
            'Gym membership',
            'Pet supplies',
            'Charity donation',
            'Unexpected expense'
        ]
    };

    const categoryDescriptions = descriptions[category] || descriptions.Other;
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
};

/**
 * Create budgets for users
 */
const createBudgets = async (users) => {
    try {
        const budgetData = [
            { category: 'Food', budget_amount: 10000 },
            { category: 'Travel', budget_amount: 15000 },
            { category: 'Shopping', budget_amount: 20000 },
            { category: 'Bills', budget_amount: 25000 },
            { category: 'Other', budget_amount: 8000 }
        ];

        const budgets = [];
        for (const user of users) {
            for (const budget of budgetData) {
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

        console.log(`✓ Created ${budgets.length} budget entries across ${users.length} users`);
        return budgets;
    } catch (error) {
        console.error('Error creating budgets:', error.message);
        throw error;
    }
};

/**
 * Create financial goals for users
 */
const createGoals = async (users) => {
    try {
        const goalsTemplates = [
            { goal: 'Emergency Fund', target_amount: '100000' },
            { goal: 'Vacation Savings', target_amount: '50000' },
            { goal: 'New Laptop', target_amount: '75000' },
            { goal: 'Home Down Payment', target_amount: '500000' },
            { goal: 'Wedding Fund', target_amount: '300000' },
            { goal: 'Investment Portfolio', target_amount: '200000' }
        ];

        const goals = [];
        for (const user of users) {
            // Each user gets 2-3 random goals
            const numGoals = Math.floor(Math.random() * 2) + 2;
            const shuffled = [...goalsTemplates].sort(() => 0.5 - Math.random());
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

        console.log(`✓ Created ${goals.length} financial goals across ${users.length} users`);
        return goals;
    } catch (error) {
        console.error('Error creating goals:', error.message);
        throw error;
    }
};

// Execute the initialization
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase, clearDatabase };
