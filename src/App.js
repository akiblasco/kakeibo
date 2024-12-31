import { useKakeibo } from './context/KakeiboContext';
import { Overview } from './components/Overview';
import { Income } from './components/Income';
import { ExpenseTab, ExpenseTracker } from './components/ExpenseTab';
import { SavingsGoals } from './components/SavingsGoals';

export function App() {
  const { state, dispatch } = useKakeibo();

  const navigateTo = (section) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow">
        <nav className="container mx-auto p-4 flex space-x-6">
          <button
            onClick={() => navigateTo('overview')}
            className={`hover:underline ${
              state.activeSection === 'overview' ? 'font-bold text-blue-600' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => navigateTo('income')}
            className={`hover:underline ${
              state.activeSection === 'income' ? 'font-bold text-blue-600' : ''
            }`}
          >
            Income
          </button>
          <button
            onClick={() => navigateTo('expenses')}
            className={`hover:underline ${
              state.activeSection === 'expenses' ? 'font-bold text-blue-600' : ''
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => navigateTo('savings')}
            className={`hover:underline ${
              state.activeSection === 'savings' ? 'font-bold text-blue-600' : ''
            }`}
          >
            Savings
          </button>
        </nav>
      </header>

      <main className="container mx-auto p-6">
        {state.activeSection === 'overview' && <Overview />}
        {state.activeSection === 'income' && <Income />}
        {state.activeSection === 'expenses' && <ExpenseTab />}
        {state.activeSection === 'savings' && <SavingsGoals />}
      </main>
    </div>
  );
}

export default App;
