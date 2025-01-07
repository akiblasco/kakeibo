import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure you have a .env file with:\n' +
    'REACT_APP_SUPABASE_URL=your_supabase_project_url\n' +
    'REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const db = {
  async getIncome(userId) {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateIncome(userId, incomeData) {
    const { data, error } = await supabase
      .from('income')
      .upsert({
        user_id: userId,
        ...incomeData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSavingsGoals(userId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async addSavingsGoal(userId, goalData) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        ...goalData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}; 