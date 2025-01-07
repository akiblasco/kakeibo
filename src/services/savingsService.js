import { supabase } from '../lib/supabase';

export const savingsService = {
  async getSavingsPool(userId) {
    const { data, error } = await supabase
      .from('savings_pool')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.amount || 0;
  },

  async updateSavingsPool(userId, amount) {
    const { data, error } = await supabase
      .from('savings_pool')
      .upsert({
        user_id: userId,
        amount: amount
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSavingsGoal(userId, { name, targetAmount, deadline }) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name,
        target_amount: targetAmount,
        current_amount: 0,
        deadline
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async allocateToGoal(goalId, amount) {
    const { data, error } = await supabase
      .rpc('handle_savings_goal_operation', {
        p_goal_id: goalId,
        p_amount: amount,
        p_operation: 'allocate'
      });

    if (error) throw error;
    return data;
  },

  async returnToPool(goalId, amount) {
    const { data, error } = await supabase
      .rpc('handle_savings_goal_operation', {
        p_goal_id: goalId,
        p_amount: amount,
        p_operation: 'return'
      });

    if (error) throw error;
    return data;
  },

  async deleteSavingsGoal(goalId) {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  }
}; 