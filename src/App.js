import { useEffect, useState } from 'react';
import { KakeiboProvider } from './context/KakeiboContext';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseHistory } from './components/ExpenseHistory';
import { BudgetAnalytics } from './components/BudgetAnalytics';
import { SavingsGoal } from './components/SavingsGoal';
import { useLocalStorage } from './hooks/useLocalStorage';

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  useLocalStorage();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-primary-dark text-white' : 'bg-primary-light text-gray-900'}`}>
      <header className="p-8 flex justify-center items-center relative">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="absolute right-8 cursor-pointer text-2xl"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <h1 className="text-3xl font-bold">Kakeibo</h1>
      </header>
      
      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <section className="widget">
          <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
          <ExpenseForm />
        </section>

        <section className="widget">
          <BudgetAnalytics />
        </section>

        <section className="widget">
          <SavingsGoal />
        </section>

        <section className="widget col-span-full">
          <ExpenseHistory />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <KakeiboProvider>
      <AppContent />
    </KakeiboProvider>
  );
}
