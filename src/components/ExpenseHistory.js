import { useKakeibo } from '../context/KakeiboContext';

export function ExpenseHistory() {
  const { state } = useKakeibo();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Expenses</h2>
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {state.expenses.slice().reverse().map(expense => (
          <div 
            key={expense.id} 
            className={`flex justify-between items-center p-4 bg-white/5 rounded-lg border-l-4 transition-transform hover:translate-x-2
              ${expense.category === 'essentials' && 'border-category-essentials'}
              ${expense.category === 'wants' && 'border-category-wants'}
              ${expense.category === 'culture' && 'border-category-culture'}
              ${expense.category === 'extras' && 'border-category-extras'}
            `}
          >
            <div className="flex flex-col">
              <span className="font-medium">{expense.description}</span>
              <span className="text-sm opacity-70">{expense.date}</span>
            </div>
            <span className="font-semibold text-accent">
              ¥{expense.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 