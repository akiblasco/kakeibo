import React from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { ProgressBar } from './ProgressBar';

export function RemainingIncomeTracker() {
  const { state } = useKakeibo();
  
  // Get yearly spendable amount (after tax and savings)
  const yearlySpendable = state.income?.yearlySpendable || 0;
  
  // Calculate total one-time expenses for the current year
  const currentYear = new Date().getFullYear();
  const oneTimeExpenses = state.expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear && !expense.is_recurring;
    })
    .reduce((total, expense) => total + parseFloat(expense.amount), 0);
  
  // Calculate remaining spendable income
  const remainingSpendable = yearlySpendable - oneTimeExpenses;
  const spendingProgress = (oneTimeExpenses / yearlySpendable) * 100;
  
  // Calculate monthly averages
  const currentMonth = new Date().getMonth();
  const monthlySpendingAverage = oneTimeExpenses / (currentMonth + 1);
  const projectedYearlySpending = monthlySpendingAverage * 12;
  const monthlyRemaining = remainingSpendable / (12 - (currentMonth + 1));

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: state.income?.currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="widget p-6 bg-white/5 rounded-xl space-y-6">
      <h2 className="text-2xl font-semibold">Yearly Income Tracker</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Yearly Spendable Income</span>
            <span className="font-medium">{formatCurrency(yearlySpendable)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Total Expenses This Year</span>
            <span className="font-medium text-red-400">{formatCurrency(oneTimeExpenses)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Remaining Income</span>
            <span className="font-medium text-green-400">{formatCurrency(remainingSpendable)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <ProgressBar 
            progress={spendingProgress}
            colorClass={spendingProgress > 75 ? "bg-red-500" : "bg-blue-500"}
          />
          <div className="text-sm text-gray-400 text-center">
            {spendingProgress.toFixed(1)}% of yearly budget spent
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Monthly Average Spending</h3>
            <p className="text-lg font-medium">{formatCurrency(monthlySpendingAverage)}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Monthly Budget Remaining</h3>
            <p className="text-lg font-medium">{formatCurrency(monthlyRemaining)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Projected Yearly Spending</h3>
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium">{formatCurrency(projectedYearlySpending)}</p>
              <span className={`text-sm ${projectedYearlySpending > yearlySpendable ? 'text-red-400' : 'text-green-400'}`}>
                {projectedYearlySpending > yearlySpendable 
                  ? `${formatCurrency(projectedYearlySpending - yearlySpendable)} over budget`
                  : `${formatCurrency(yearlySpendable - projectedYearlySpending)} under budget`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 