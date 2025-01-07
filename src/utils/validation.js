export const validateIncome = (incomeData) => {
  const errors = {};
  
  if (!incomeData.amount || isNaN(parseFloat(incomeData.amount)) || parseFloat(incomeData.amount) <= 0) {
    errors.amount = 'Amount must be a valid number greater than 0';
  }
  
  if (!incomeData.income_type) {
    errors.income_type = 'Income type is required';
  }
  
  if (incomeData.tax_rate === undefined || isNaN(parseFloat(incomeData.tax_rate)) || 
      parseFloat(incomeData.tax_rate) < 0 || parseFloat(incomeData.tax_rate) > 100) {
    errors.tax_rate = 'Tax rate must be between 0 and 100';
  }
  
  if (incomeData.savings_percentage === undefined || isNaN(parseFloat(incomeData.savings_percentage)) || 
      parseFloat(incomeData.savings_percentage) < 0 || parseFloat(incomeData.savings_percentage) > 100) {
    errors.savings_percentage = 'Savings percentage must be between 0 and 100';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateExpense = (expenseData) => {
  const errors = {};
  
  if (!expenseData.amount || isNaN(parseFloat(expenseData.amount)) || parseFloat(expenseData.amount) <= 0) {
    errors.amount = 'Amount must be a valid number greater than 0';
  }
  
  if (!expenseData.category) {
    errors.category = 'Category is required';
  }
  
  if (!expenseData.date) {
    errors.date = 'Date is required';
  } else {
    const dateObj = new Date(expenseData.date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Invalid date format';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 