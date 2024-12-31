import { createContext, useContext, useReducer } from "react";

const initialState = {
  activeSection: "overview",
  income: {
    amount: 0,
    grossAmount: 0,
    taxRate: 0,
    frequency: "monthly",
    currency: "USD",
    monthlyNet: 0,
  },
  expenses: [],
  recurringExpenses: [],
  savings: {
    total: 0,
  },
  savingsGoals: [],
};

function kakeiboReducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_SECTION":
      return {
        ...state,
        activeSection: action.payload,
      };

    case "ADD_EXPENSE": {
      const newExpense = {
        id: "_" + Math.random().toString(36).substr(2, 9), // Generate a unique ID
        ...action.payload,
      };
      const updatedExpenses = [newExpense, ...state.expenses];

      return {
        ...state,
        expenses: updatedExpenses,
      };
    }

    case "ADD_RECURRING_EXPENSE": {
      const newRecurringExpense = {
        id: "_" + Math.random().toString(36).substr(2, 9),
        ...action.payload,
      };
      const updatedRecurringExpenses = [
        newRecurringExpense,
        ...state.recurringExpenses,
      ];

      return {
        ...state,
        recurringExpenses: updatedRecurringExpenses,
      };
    }

    case "SET_INCOME":
      return {
        ...state,
        income: action.payload,
      };

    case "ADJUST_SAVINGS": {
      const adjustment = action.payload.amount;
      const newTotal =
        action.payload.action === "add"
          ? state.savings.total + adjustment
          : state.savings.total - adjustment;

      if (newTotal < 0) {
        alert("Insufficient savings.");
        return state;
      }

      return {
        ...state,
        savings: {
          ...state.savings,
          total: newTotal,
        },
      };
    }

    case "ADD_SAVINGS_GOAL": {
      const newGoal = {
        id: "_" + Math.random().toString(36).substr(2, 9),
        currentAmount: 0,
        ...action.payload,
      };

      return {
        ...state,
        savingsGoals: [...state.savingsGoals, newGoal],
      };
    }

    case "UPDATE_SAVINGS_GOAL": {
      const { goalId, currentAmount } = action.payload;

      const updatedGoals = state.savingsGoals.map((goal) =>
        goal.id === goalId ? { ...goal, currentAmount } : goal
      );

      return {
        ...state,
        savingsGoals: updatedGoals,
      };
    }

    case "DELETE_SAVINGS_GOAL":
  return {
    ...state,
    savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
  };


    default:
      return state;
  }
}

const KakeiboContext = createContext(null);

export function KakeiboProvider({ children }) {
  const [state, dispatch] = useReducer(kakeiboReducer, initialState);
  return (
    <KakeiboContext.Provider value={{ state, dispatch }}>
      {children}
    </KakeiboContext.Provider>
  );
}

export function useKakeibo() {
  const context = useContext(KakeiboContext);
  if (!context) {
    throw new Error("useKakeibo must be used within a KakeiboProvider");
  }
  return context;
}
