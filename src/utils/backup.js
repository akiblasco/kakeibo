export const exportUserData = async (userId) => {
  try {
    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId);
      
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
      
    const { data: savingsGoals } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);
      
    const backup = {
      timestamp: new Date().toISOString(),
      userId,
      data: {
        income,
        expenses,
        savingsGoals
      }
    };
    
    // Download as JSON file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kakeibo-backup-${new Date().toISOString()}.json`;
    a.click();
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}; 