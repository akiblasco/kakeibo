import { useKakeibo } from '../context/KakeiboContext';

export function IncomeInput() {
  const { state, dispatch } = useKakeibo();

  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const frequency = formData.get('frequency');

    dispatch({
      type: 'SET_INCOME',
      payload: {
        amount,
        frequency,
        currency: state.currency
      }
    });
  };

  return (
    <div className="widget">
      <h3 className="text-xl font-semibold mb-4">Income</h3>
      <form onSubmit={handleIncomeSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="flex-1 bg-white/5 rounded-lg px-4 py-2"
            required
          />
          <select 
            name="frequency"
            className="bg-white/5 rounded-lg px-4 py-2"
            defaultValue="monthly"
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-accent/90 transition-colors"
        >
          Update Income
        </button>
      </form>
    </div>
  );
} 