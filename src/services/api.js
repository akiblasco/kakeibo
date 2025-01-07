import { supabase } from '../lib/supabase';
import { handleDatabaseError, KakeiboError } from '../utils/errorHandling';
import { validateIncome, validateExpense } from '../utils/validation';

export class KakeiboAPI {
  static async getIncome(userId) {
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async saveIncome(userId, incomeData) {
    try {
      const { isValid, errors } = validateIncome(incomeData);
      if (!isValid) {
        throw new KakeiboError('Invalid income data', 'VALIDATION_ERROR', errors);
      }

      // Delete existing income
      await supabase
        .from('income')
        .delete()
        .eq('user_id', userId);

      // Insert new income
      const { data, error } = await supabase
        .from('income')
        .insert({
          user_id: userId,
          ...incomeData,
          created_by: userId,
          updated_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async saveExpense(userId, expenseData, isRecurring = false) {
    try {
      const { isValid, errors } = validateExpense(expenseData);
      if (!isValid) {
        throw new KakeiboError('Invalid expense data', 'VALIDATION_ERROR', errors);
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          ...expenseData,
          is_recurring: isRecurring,
          created_by: userId,
          updated_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async saveSavingsGoal(userId, goalData) {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: userId,
          ...goalData,
          created_by: userId,
          updated_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async updateSavingsGoal(userId, goalId, updates) {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update({
          ...updates,
          updated_by: userId
        })
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
} 