import { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { format } from 'date-fns';

const RECURRENCE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
  { value: 'custom', label: 'Custom' }
];

export function FixedCosts() {
  const { state, dispatch } = useKakeibo();
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [customRecurrence, setCustomRecurrence] = useState('');

  const handleAddCost = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const recurrenceType = formData.get('recurrenceType');
    const recurrenceData = {
      type: recurrenceType,
      dayOfMonth: formData.get('dayOfMonth'),
      dayOfWeek: formData.get('dayOfWeek'),
      months: Array.from(formData.getAll('months')),
      customPattern: formData.get('customPattern')
    };

    dispatch({
      type: 'ADD_FIXED_COST',
      payload: {
        name: formData.get('name'),
        amount: Number(formData.get('amount')),
        recurrence: recurrenceData,
        category: formData.get('category'),
        nextDueDate: formData.get('nextDueDate'),
        notes: formData.get('notes')
      }
    });
    
    setIsAddingCost(false);
    e.target.reset();
  };

  const getNextDueDate = (cost) => {
    // Implementation of next due date calculation based on recurrence pattern
    // This is a simplified version
    return new Date(cost.nextDueDate);
  };

  return (
    <div className="widget">
      <h2 className="text-2xl font-semibold mb-4">Fixed Costs</h2>
      
      <div className="space-y-6">
        {state.fixedCosts.map((cost, index) => (
          <div 
            key={index}
            className="bg-white/5 p-4 rounded-lg space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{cost.name}</h3>
                <p className="text-sm opacity-70">
                  Next due: {format(getNextDueDate(cost), 'MMM d, yyyy')}
                </p>
                {cost.notes && (
                  <p className="text-sm opacity-70">{cost.notes}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {state.income.currency} {cost.amount.toLocaleString()}
                </p>
                <p className="text-sm opacity-70">
                  {cost.recurrence.type === 'custom' 
                    ? cost.recurrence.customPattern 
                    : cost.recurrence.type}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isAddingCost ? (
          <form onSubmit={handleAddCost} className="space-y-4 bg-white/5 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Expense name"
                className="input-field"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                className="input-field"
                required
              />
              
              <select
                name="recurrenceType"
                className="input-field"
                onChange={(e) => setCustomRecurrence(e.target.value)}
                required
              >
                {RECURRENCE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {customRecurrence === 'monthly' && (
                <select name="dayOfMonth" className="input-field">
                  {Array.from({length: 31}, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Day {i + 1}
                    </option>
                  ))}
                </select>
              )}

              {customRecurrence === 'custom' && (
                <input
                  type="text"
                  name="customPattern"
                  placeholder="e.g., Every 2 weeks"
                  className="input-field"
                />
              )}

              <input
                type="date"
                name="nextDueDate"
                className="input-field"
                required
              />
              
              <select name="category" className="input-field" required>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent/Mortgage</option>
                <option value="insurance">Insurance</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="other">Other</option>
              </select>
            </div>

            <textarea
              name="notes"
              placeholder="Additional notes"
              className="input-field w-full h-20 resize-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                Add Fixed Cost
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCost(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCost(true)}
            className="btn btn-primary w-full"
          >
            Add New Fixed Cost
          </button>
        )}
      </div>
    </div>
  );
} 