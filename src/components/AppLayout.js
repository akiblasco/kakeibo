import { useState } from 'react';
import { Income } from './Income';
import { SavingsGoals } from './SavingsGoals';
import { useKakeibo } from '../context/KakeiboContext';

export function AppLayout() {
  const { state, dispatch } = useKakeibo();
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: tab });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('income')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'income'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => handleTabChange('savings')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'savings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Savings
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'income' && <Income />}
        {activeTab === 'savings' && <SavingsGoals />}
        {activeTab === 'overview' && <div>Overview Content</div>}
      </main>
    </div>
  );
} 