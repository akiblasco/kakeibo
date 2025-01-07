import React, { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { ProgressBar } from './ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export function ExpenseTab() {
  const { state, updateExpense, deleteExpense } = useKakeibo();
  const { user } = useAuth();
  const [editingExpense, setEditingExpense] = useState(null);

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
  const groupedExpenses = [...state.expenses, ...state.recurringExpenses].reduce((groups, expense) => {
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
      'housing': 'text-red-400',
      'subscriptions': 'text-blue-400',
      'daily needs': 'text-green-400',
      'wants': 'text-purple-400',
      'leisure': 'text-yellow-400',
      'unexpected': 'text-orange-400'
    };
    return colors[category?.toLowerCase()] || 'text-gray-400';
  };

  // Handle expense update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense.is_recurring) {
        const confirmed = window.confirm(
          'This is a recurring expense. Updating it will affect your monthly fixed expenses. Are you sure you want to continue?'
        );
        if (!confirmed) return;
      }

      // Format the data before sending to the API
      const formattedExpense = {
        ...editingExpense,
        amount: parseFloat(editingExpense.amount),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      await updateExpense(editingExpense.id, formattedExpense);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  // Handle expense deletion
  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
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
            const monthlyTotal = expenses.reduce((sum, expense) => {
              const amount = parseFloat(expense.amount);
              return sum + amount;
            }, 0);
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
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{expense.description || 'No description'}</p>
                          {expense.is_recurring && (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              Fixed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                          <span className="text-sm text-gray-400">
                            {formatDate(expense.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-red-400 font-medium">
                          {formatCurrency(expense.amount)}
                        </span>
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {editingExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingExpense(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-white shadow-2xl max-w-lg mx-auto p-6"
            >
              <form onSubmit={handleUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold">Edit Expense</h2>
                <div className="space-y-4">
                  <input
                    type="number"
                    required
                    placeholder="Amount"
                    className="input-field"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      amount: e.target.value
                    })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Description"
                    className="input-field"
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      description: e.target.value
                    })}
                  />
                  <select
                    required
                    className="input-field"
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      category: e.target.value
                    })}
                  >
                    <option value="">Select Category</option>
                    <option value="housing">Housing</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="daily needs">Daily Needs</option>
                    <option value="wants">Wants</option>
                    <option value="leisure">Leisure</option>
                    <option value="unexpected">Unexpected</option>
                  </select>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      date: e.target.value
                    })}
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingExpense.is_recurring}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        is_recurring: e.target.checked
                      })}
                    />
                    <span>Recurring Expense</span>
                  </label>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="flex-1 py-3 bg-gray-500 rounded-xl shadow-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl shadow-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
