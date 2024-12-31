import { useKakeibo } from '../context/KakeiboContext'; // Import useKakeibo
import { EXPENSE_CATEGORIES } from '../constants/categories'; // Import EXPENSE_CATEGORIES

export function ExpenseHistory() {
  const { state } = useKakeibo();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Expenses</h2>
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {state.expenses.slice().reverse().map(expense => (
          <div
            key={expense.id}
            className={`flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow ${
              EXPENSE_CATEGORIES[expense.category]?.color || ''
            }`}
          >
            <div>
              <h4 className="font-medium">{expense.description}</h4>
              <p className="text-sm text-gray-500">{expense.date}</p>
            </div>
            <p className="font-bold">
              {state.income.currency} {expense.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
