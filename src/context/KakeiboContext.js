import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import { KakeiboAPI } from '../services/api';

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
  savingsPool: 0,
  savingsGoals: []
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
        income: {
          amount: action.payload.amount || 0,
          incomeType: action.payload.income_type || "monthly",
          currency: action.payload.currency || "USD",
          taxRate: action.payload.tax_rate || 0,
          savingsPercentage: action.payload.savings_percentage || 0,
          monthlyGross: action.payload.monthly_gross || 0,
          yearlyGross: action.payload.yearly_gross || 0,
          monthlyTax: action.payload.monthly_tax || 0,
          yearlyTax: action.payload.yearly_tax || 0,
          monthlyNet: action.payload.monthly_net || 0,
          yearlyNet: action.payload.yearly_net || 0,
          monthlySavings: action.payload.monthly_savings || 0,
          yearlySavings: action.payload.yearly_savings || 0,
          monthlySpendable: action.payload.monthly_spendable || 0,
          yearlySpendable: action.payload.yearly_spendable || 0,
        },
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
      const updatedGoals = state.savingsGoals.map((goal) =>
        goal.id === action.payload.id ? action.payload : goal
      );

      return {
        ...state,
        savingsGoals: updatedGoals
      };
    }

    case "DELETE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
      };

    case "LOAD_USER_DATA":
      return {
        ...state,
        ...action.payload,
      };

    case "UPDATE_EXPENSE": {
      const updatedExpenses = state.expenses.map(expense =>
        expense.id === action.payload.id ? action.payload : expense
      );
      return {
        ...state,
        expenses: updatedExpenses
      };
    }

    case "UPDATE_RECURRING_EXPENSE": {
      const updatedRecurringExpenses = state.recurringExpenses.map(expense =>
        expense.id === action.payload.id ? action.payload : expense
      );
      return {
        ...state,
        recurringExpenses: updatedRecurringExpenses
      };
    }

    case "UPDATE_SAVINGS_POOL":
      return {
        ...state,
        savingsPool: action.payload
      };

    default:
      return state;
  }
}

const KakeiboContext = createContext(null);

export function KakeiboProvider({ children }) {
  const [state, dispatch] = useReducer(kakeiboReducer, initialState);
  const { user } = useAuth();

  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Load all data in parallel
      const [
        { data: income, error: incomeError },
        { data: expenses, error: expensesError },
        { data: recurringExpenses, error: recurringError },
        { data: savingsGoals, error: savingsError },
        { data: savingsPool, error: poolError }
      ] = await Promise.all([
        supabase.from('income').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('expenses').select('*').eq('user_id', user.id).eq('is_recurring', false),
        supabase.from('expenses').select('*').eq('user_id', user.id).eq('is_recurring', true),
        supabase.from('savings_goals').select('*').eq('user_id', user.id),
        supabase.from('savings_pool').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      // Handle any errors
      if (incomeError) console.error('Error loading income:', incomeError);
      if (expensesError) console.error('Error loading expenses:', expensesError);
      if (recurringError) console.error('Error loading recurring expenses:', recurringError);
      if (savingsError) console.error('Error loading savings goals:', savingsError);
      if (poolError) console.error('Error loading savings pool:', poolError);

      // Transform income data
      const transformedIncome = income ? {
        amount: income.amount,
        incomeType: income.income_type,
        currency: income.currency,
        taxRate: income.tax_rate,
        savingsPercentage: income.savings_percentage,
        monthlyGross: income.monthly_gross,
        yearlyGross: income.yearly_gross,
        monthlyTax: income.monthly_tax,
        yearlyTax: income.yearly_tax,
        monthlyNet: income.monthly_net,
        yearlyNet: income.yearly_net,
        monthlySavings: income.monthly_savings,
        yearlySavings: income.yearly_savings,
        monthlySpendable: income.monthly_spendable,
        yearlySpendable: income.yearly_spendable,
      } : initialState.income;

      dispatch({
        type: "LOAD_USER_DATA",
        payload: {
          income: transformedIncome,
          expenses: expenses || [],
          recurringExpenses: recurringExpenses || [],
          savingsGoals: savingsGoals || [],
          savingsPool: savingsPool?.amount || 0
        },
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Add real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to income changes
    const incomeSubscription = supabase
      .channel('income_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'income', filter: `user_id=eq.${user.id}` },
        (payload) => {
          loadUserData();
      })
      .subscribe();

    // Subscribe to expenses changes
    const expensesSubscription = supabase
      .channel('expenses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` },
        (payload) => {
          loadUserData();
      })
      .subscribe();

    // Subscribe to savings goals changes
    const goalsSubscription = supabase
      .channel('goals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${user.id}` },
        (payload) => {
          loadUserData();
      })
      .subscribe();

    return () => {
      incomeSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
      goalsSubscription.unsubscribe();
    };
  }, [user, loadUserData]);

  // Add real-time subscription for savings pool
  useEffect(() => {
    if (!user) return;

    const poolSubscription = supabase
      .channel('pool_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'savings_pool', filter: `user_id=eq.${user.id}` },
        (payload) => {
          loadUserData();
      })
      .subscribe();

    return () => {
      poolSubscription.unsubscribe();
    };
  }, [user, loadUserData]);

  // Database operations
  const saveIncome = async (incomeData) => {
    try {
      const data = await KakeiboAPI.saveIncome(user.id, incomeData);
      
      // Transform the data before dispatching
      const transformedData = {
        amount: data.amount,
        incomeType: data.income_type,
        currency: data.currency,
        taxRate: data.tax_rate,
        savingsPercentage: data.savings_percentage,
        monthlyGross: data.monthly_gross,
        yearlyGross: data.yearly_gross,
        monthlyTax: data.monthly_tax,
        yearlyTax: data.yearly_tax,
        monthlyNet: data.monthly_net,
        yearlyNet: data.yearly_net,
        monthlySavings: data.monthly_savings,
        yearlySavings: data.yearly_savings,
        monthlySpendable: data.monthly_spendable,
        yearlySpendable: data.yearly_spendable,
      };

      dispatch({ type: 'SET_INCOME', payload: transformedData });
      await loadUserData();
    } catch (error) {
      console.error('Error saving income:', error);
      throw error;
    }
  };

  const saveExpense = async (expenseData, isRecurring = false) => {
    try {
      console.log('Saving expense data:', { ...expenseData, is_recurring: isRecurring });
      
      // Format the data to match the database schema
      const formattedExpense = {
        user_id: user.id,
        amount: parseFloat(expenseData.amount),
        description: expenseData.description || '',
        category: expenseData.category,
        date: expenseData.date,
        is_recurring: isRecurring
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(formattedExpense)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      dispatch({
        type: isRecurring ? 'ADD_RECURRING_EXPENSE' : 'ADD_EXPENSE',
        payload: data
      });

      return data;
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  };

  const saveSavingsGoal = async (goalData) => {
    try {
      console.log('Saving savings goal:', goalData);
      
      const formattedGoal = {
        user_id: user.id,
        name: goalData.name,
        target_amount: parseFloat(goalData.target_amount),
        current_amount: 0,
        deadline: goalData.deadline
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .insert(formattedGoal)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Make sure we're dispatching with the correct data structure
      dispatch({
        type: 'ADD_SAVINGS_GOAL',
        payload: {
          id: data.id,
          name: data.name,
          targetAmount: data.target_amount,
          currentAmount: data.current_amount,
          deadline: data.deadline
        }
      });

      return data;
    } catch (error) {
      console.error('Error saving savings goal:', error);
      throw error;
    }
  };

  const updateSavingsGoal = async (goalId, updates) => {
    try {
      console.log('Updating savings goal:', { goalId, updates });
      
      // Ensure numeric values are properly parsed
      const formattedUpdates = {
        ...updates,
        current_amount: updates.current_amount !== undefined ? parseFloat(updates.current_amount) : undefined,
        target_amount: updates.target_amount !== undefined ? parseFloat(updates.target_amount) : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .update(formattedUpdates)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform the data to match the frontend structure
      const transformedData = {
        id: data.id,
        name: data.name,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        deadline: data.deadline
      };
      
      dispatch({
        type: 'UPDATE_SAVINGS_GOAL',
        payload: transformedData
      });

      return transformedData;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  };

  const deleteSavingsGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: goalId });
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      throw error;
    }
  };

  const updateExpense = async (expenseId, updates) => {
    try {
      // Format the data
      const formattedUpdates = {
        amount: parseFloat(updates.amount),
        description: updates.description,
        category: updates.category,
        date: updates.date,
        is_recurring: updates.is_recurring,
        updated_at: new Date().toISOString(),
        user_id: user.id // Ensure we have the user ID
      };

      const { data, error } = await supabase
        .from('expenses')
        .update(formattedUpdates)
        .eq('id', expenseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state based on whether it's a recurring expense
      dispatch({
        type: updates.is_recurring ? 'UPDATE_RECURRING_EXPENSE' : 'UPDATE_EXPENSE',
        payload: data
      });

      // Reload data to ensure everything is in sync
      await loadUserData();

      return data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      dispatch({
        type: 'DELETE_EXPENSE',
        payload: expenseId
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const updateSavingsPool = async (newAmount) => {
    try {
      console.log('Updating savings pool:', { newAmount });
      
      const { data, error } = await supabase
        .from('savings_pool')
        .upsert({
          user_id: user.id,
          amount: parseFloat(newAmount),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      dispatch({
        type: 'UPDATE_SAVINGS_POOL',
        payload: parseFloat(data.amount)
      });

      return data;
    } catch (error) {
      console.error('Error updating savings pool:', error);
      throw error;
    }
  };

  return (
    <KakeiboContext.Provider 
      value={{ 
        state, 
        dispatch,
        saveIncome,
        saveExpense,
        updateExpense,
        deleteExpense,
        saveSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        loadUserData,
        updateSavingsPool
      }}
    >
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
