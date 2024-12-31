import { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export function ExpenseForm() {
  const { dispatch } = useKakeibo();
  const [expense, setExpense] = useState({
    amount: '',
    category: 'essentials',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        ...expense,
        amount: parseFloat(expense.amount),
        id: Date.now()
      }
    });
    setExpense({
      amount: '',
      category: 'essentials',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="number"
        value={expense.amount}
        onChange={(e) => setExpense({...expense, amount: e.target.value})}
        placeholder="Amount"
        className="p-3 rounded-lg bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-accent outline-none"
        required
      />
      <select
        value={expense.category}
        onChange={(e) => setExpense({...expense, category: e.target.value})}
        className="p-3 rounded-lg bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-accent outline-none"
      >
        <option value="essentials">Essentials</option>
        <option value="wants">Wants</option>
        <option value="culture">Culture</option>
        <option value="extras">Extras</option>
      </select>
      <input
        type="text"
        value={expense.description}
        onChange={(e) => setExpense({...expense, description: e.target.value})}
        placeholder="Description"
        className="p-3 rounded-lg bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-accent outline-none"
        required
      />
      <input
        type="date"
        value={expense.date}
        onChange={(e) => setExpense({...expense, date: e.target.value})}
        className="p-3 rounded-lg bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-accent outline-none"
      />
      <button 
        type="submit"
        className="bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-accent/90 transition-colors"
      >
        Add Expense
      </button>
    </form>
  );
} 