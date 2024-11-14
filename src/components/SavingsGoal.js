import { useKakeibo } from '../context/KakeiboContext';

export function SavingsGoal() {
  const { state, dispatch } = useKakeibo();
  
  const handleUpdateGoal = (amount) => {
    dispatch({
      type: 'UPDATE_SAVINGS',
      payload: amount
    });
  };

  const progress = (state.savedAmount / state.savingsGoal) * 100;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Savings Goal</h3>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-accent transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-lg">
        <span>¥{state.savedAmount.toLocaleString()}</span>
        <span>¥{state.savingsGoal.toLocaleString()}</span>
      </div>
      <button 
        className="w-full bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-accent/90 transition-colors"
        onClick={() => {
          const amount = prompt('Enter amount to add to savings:');
          if (amount) handleUpdateGoal(Number(amount));
        }}
      >
        Add to Savings
      </button>
    </div>
  );
} 