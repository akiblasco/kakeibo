import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { SignIn } from './components/SignIn';
import { KakeiboProvider } from './context/KakeiboContext';
import { Overview } from './components/Overview';
import { Income } from './components/Income';
import { ExpenseTab } from './components/ExpenseTab';
import { WelcomeFlow } from './components/WelcomeFlow';
import { supabase } from './lib/supabase';

export function App() {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFirstTimeUser = useCallback(async () => {
    try {
      const { data: income, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setShowWelcome(!income);
      setLoading(false);
    } catch (error) {
      console.error('Error checking first time user:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkFirstTimeUser();
    }
  }, [user, checkFirstTimeUser]);

  if (!user) {
    return <SignIn />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <KakeiboProvider>
        <WelcomeFlow onComplete={() => setShowWelcome(false)} />
      </KakeiboProvider>
    );
  }

  return (
    <KakeiboProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <header className="bg-white shadow">
          <nav className="container mx-auto p-4 flex justify-between items-center">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveSection('overview')}
                className={`hover:underline ${
                  activeSection === 'overview' ? 'font-bold text-blue-600' : ''
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('income')}
                className={`hover:underline ${
                  activeSection === 'income' ? 'font-bold text-blue-600' : ''
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveSection('expenses')}
                className={`hover:underline ${
                  activeSection === 'expenses' ? 'font-bold text-blue-600' : ''
                }`}
              >
                Expenses
              </button>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </nav>
        </header>

        <main className="container mx-auto py-8 px-4">
          {activeSection === 'overview' && <Overview />}
          {activeSection === 'income' && <Income />}
          {activeSection === 'expenses' && <ExpenseTab />}
        </main>
      </div>
    </KakeiboProvider>
  );
}

export default App;
