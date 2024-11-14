import { createContext, useContext, useReducer } from 'react';

const KakeiboContext = createContext();

const initialState = {
  budget: 0,
  expenses: [],
  savingsGoal: 100000,
  savedAmount: 0,
  categories: {
    essentials: { name: 'Essentials', spent: 0, limit: 0 },
    wants: { name: 'Wants', spent: 0, limit: 0 },
    culture: { name: 'Culture', spent: 0, limit: 0 },
    extras: { name: 'Extras', spent: 0, limit: 0 }
  }
};

function kakeiboReducer(state, action) {
  switch (action.type) {
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'ADD_EXPENSE':
      const newExpenses = [...state.expenses, action.payload];
      const newCategories = { ...state.categories };
      newCategories[action.payload.category].spent += action.payload.amount;
      return { 
        ...state, 
        expenses: newExpenses,
        categories: newCategories
      };
    case 'UPDATE_SAVINGS':
      return { ...state, savedAmount: action.payload };
    default:
      return state;
  }
}

export function KakeiboProvider({ children }) {
  const [state, dispatch] = useReducer(kakeiboReducer, initialState);

  return (
    <KakeiboContext.Provider value={{ state, dispatch }}>
      {children}
    </KakeiboContext.Provider>
  );
}

export function useKakeibo() {
  return useContext(KakeiboContext);
} 