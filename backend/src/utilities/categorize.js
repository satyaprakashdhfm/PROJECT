/**
 * Simple auto-categorization logic for imported bank transactions
 * Maps transaction descriptions to expense categories
 */

const categorizeExpense = (description) => {
    if(!description) return "Other";
    
    const desc = description.toLowerCase();
    
    // Food keywords
    if(desc.includes('restaurant') || desc.includes('food') || desc.includes('cafe') || 
       desc.includes('pizza') || desc.includes('burger') || desc.includes('swiggy') || 
       desc.includes('zomato') || desc.includes('grocery') || desc.includes('supermarket')){
        return "Food";
    }
    
    // Travel keywords
    if(desc.includes('uber') || desc.includes('ola') || desc.includes('taxi') || 
       desc.includes('flight') || desc.includes('train') || desc.includes('bus') || 
       desc.includes('fuel') || desc.includes('petrol') || desc.includes('gas')){
        return "Travel";
    }
    
    // Shopping keywords
    if(desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shop') || 
       desc.includes('mall') || desc.includes('store') || desc.includes('clothing') || 
       desc.includes('electronics')){
        return "Shopping";
    }
    
    // Bills keywords
    if(desc.includes('electric') || desc.includes('water') || desc.includes('internet') || 
       desc.includes('mobile') || desc.includes('rent') || desc.includes('bill') || 
       desc.includes('insurance') || desc.includes('subscription')){
        return "Bills";
    }
    
    // Default category
    return "Other";
};

module.exports = categorizeExpense;
