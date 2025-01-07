import React, { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { ProgressBar } from './ProgressBar';
import { motion } from 'framer-motion';

export function Expenses() {
  const { state, saveExpense } = useKakeibo();
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false
  });

  // Get yearly spendable amount (after tax and savings)
  const yearlySpendable = state.income?.yearlySpendable || 0;
  const yearlyNet = state.income?.yearlyNet || 0;
  
  // Calculate expenses for current year
  const currentYear = new Date().getFullYear();
  const oneTimeExpenses = state.expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear && !expense.is_recurring;
    })
    .reduce((total, expense) => total + parseFloat(expense.amount), 0);
  
  const recurringExpensesYearly = state.recurringExpenses.reduce((total, expense) => 
    total + (parseFloat(expense.amount) * 12), 0);
  
  // Calculate totals and remaining
  const totalExpenses = oneTimeExpenses + recurringExpensesYearly;
  const remainingSpendable = yearlySpendable - totalExpenses;
  const spendingProgress = (totalExpenses / yearlySpendable) * 100;

  // Group expenses by month
  const groupedExpenses = state.expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(expense);
    return groups;
  }, {});

  // Sort months in descending order
  const sortedMonths = Object.keys(groupedExpenses).sort().reverse();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: state.income?.currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'groceries': 'text-green-400',
      'entertainment': 'text-purple-400',
      'transportation': 'text-blue-400',
      'utilities': 'text-yellow-400',
      'housing': 'text-red-400',
      'healthcare': 'text-pink-400',
      'default': 'text-gray-400'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  return (
    <div className="space-y-8">
      {/* Income Breakdown */}
      <div className="widget p-6 bg-white/5 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">Yearly Income Breakdown</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Yearly Net Income</span>
            <span className="font-medium">{formatCurrency(yearlyNet)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Yearly Savings</span>
            <span className="font-medium text-blue-400">-{formatCurrency(yearlyNet - yearlySpendable)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Yearly Fixed Expenses</span>
            <span className="font-medium text-red-400">-{formatCurrency(recurringExpensesYearly)}</span>
          </div>
          <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
            <span>Available for Variable Expenses</span>
            <span className="font-medium text-green-400">{formatCurrency(remainingSpendable)}</span>
          </div>
        </div>
      </div>

      {/* Expense Tracker */}
      <div className="widget p-6 bg-white/5 rounded-xl space-y-6">
        <h2 className="text-2xl font-semibold">Expense Tracker</h2>
        
        <div className="space-y-4">
          {/* Main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-2">Variable Expenses (YTD)</h3>
              <p className="text-lg font-medium text-red-400">{formatCurrency(oneTimeExpenses)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-2">Fixed Expenses (Yearly)</h3>
              <p className="text-lg font-medium text-red-400">{formatCurrency(recurringExpensesYearly)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-2">Remaining Budget</h3>
              <p className="text-lg font-medium text-green-400">{formatCurrency(remainingSpendable)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <ProgressBar 
              progress={spendingProgress}
              colorClass={spendingProgress > 75 ? "bg-red-500" : "bg-blue-500"}
            />
            <div className="text-sm text-gray-400 text-center">
              {spendingProgress.toFixed(1)}% of yearly budget spent
            </div>
          </div>
        </div>
      </div>

      {/* Expense History */}
      <div className="widget p-6 bg-white/5 rounded-xl">
        <h2 className="text-2xl font-semibold mb-6">Expense History</h2>
        <div className="space-y-8">
          {sortedMonths.map(month => {
            const expenses = groupedExpenses[month];
            const monthlyTotal = expenses.reduce((sum, expense) => 
              sum + parseFloat(expense.amount), 0);
            const [year, monthNum] = month.split('-');
            const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });

            return (
              <div key={month} className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-medium">{monthName} {year}</h3>
                  <span className="text-red-400">{formatCurrency(monthlyTotal)}</span>
                </div>
                <div className="space-y-3">
                  {expenses.map(expense => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{expense.description || 'No description'}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                          <span className="text-sm text-gray-400">
                            {formatDate(expense.date)}
                          </span>
                        </div>
                      </div>
                      <span className="text-red-400 font-medium">
                        {formatCurrency(expense.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add your existing expense form component here */}
    </div>
  );
} 