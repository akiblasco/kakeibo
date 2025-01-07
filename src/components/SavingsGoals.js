import React, { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { ProgressBar } from "./ProgressBar";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export function SavingsGoals() {
  const { 
    state, 
    saveSavingsGoal, 
    updateSavingsGoal, 
    deleteSavingsGoal,
    updateSavingsPool,
    loadUserData
  } = useKakeibo();
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingToPool, setIsAddingToPool] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: new Date().toISOString().split("T")[0],
  });
  const [adjustments, setAdjustments] = useState({});
  const [poolAdjustment, setPoolAdjustment] = useState("");

  // Calculate totals
  const savingsPool = state.savingsPool || 0;
  const allocatedSavings = state.savingsGoals.reduce((total, goal) => 
    total + parseFloat(goal.current_amount || 0), 0);
  // Update total savings to be just the sum of allocated savings and pool
  const totalSavings = parseFloat(savingsPool) + parseFloat(allocatedSavings);

  // Get monthly savings target from income calculations
  const monthlySavingsTarget = state.income?.monthlySavings || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: state.income?.currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Add monthly savings to pool
  const handleAddMonthlySavings = async () => {
    if (!monthlySavingsTarget) {
      alert("No monthly savings target set. Please set your income first.");
      return;
    }

    try {
      // Add monthly savings to existing pool amount
      const newPoolAmount = parseFloat(savingsPool) + parseFloat(monthlySavingsTarget);
      console.log('Adding monthly savings to pool:', {
        currentPool: savingsPool,
        monthlySavingsTarget,
        newPoolAmount
      });
      await updateSavingsPool(newPoolAmount);
      
      // Reload data to ensure UI is updated
      await loadUserData();
    } catch (error) {
      console.error('Error adding monthly savings:', error);
      alert('Failed to add monthly savings. Please try again.');
    }
  };

  // Add New Savings Goal
  const handleAddGoal = async (event) => {
    event.preventDefault();

    if (!newGoal.name || !newGoal.targetAmount) {
      alert("Please fill in all required fields.");
      return;
    }

    const goalData = {
      name: newGoal.name,
      target_amount: parseFloat(newGoal.targetAmount),
      current_amount: 0,
      deadline: newGoal.deadline,
    };

    try {
      await saveSavingsGoal(goalData);
      setIsAddingGoal(false);
      setNewGoal({
        name: "",
        targetAmount: "",
        deadline: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save savings goal. Please try again.');
    }
  };

  // Allocate money from pool to goal
  const handleAllocateToGoal = async (goalId) => {
    const amount = Number(adjustments[goalId] || 0);

    if (amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (amount > savingsPool) {
      alert("Amount exceeds available funds in savings pool.");
      return;
    }

    const goal = state.savingsGoals.find((g) => g.id === goalId);
    if (!goal) {
      alert("Goal not found.");
      return;
    }

    try {
      // Update pool first to prevent race conditions
      const newPoolAmount = parseFloat(savingsPool) - parseFloat(amount);
      await updateSavingsPool(newPoolAmount);
      
      // Then update goal amount
      const newAmount = parseFloat(goal.current_amount || 0) + parseFloat(amount);
      await updateSavingsGoal(goalId, { current_amount: newAmount });
      
      // Clear adjustment input
      setAdjustments((prev) => ({ ...prev, [goalId]: "" }));
    } catch (error) {
      console.error('Error allocating to goal:', error);
      alert('Failed to allocate funds. Please try again.');
    }
  };

  // Return money from goal to pool
  const handleReturnToPool = async (goalId) => {
    const amount = Number(adjustments[goalId] || 0);
    const goal = state.savingsGoals.find((g) => g.id === goalId);

    if (amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (amount > (goal.current_amount || 0)) {
      alert("Cannot return more than the allocated amount.");
      return;
    }

    try {
      // Update goal amount first
      const newAmount = parseFloat(goal.current_amount || 0) - parseFloat(amount);
      await updateSavingsGoal(goalId, { current_amount: newAmount });
      
      // Then update pool
      const newPoolAmount = parseFloat(savingsPool) + parseFloat(amount);
      await updateSavingsPool(newPoolAmount);
      
      // Clear adjustment input
      setAdjustments((prev) => ({ ...prev, [goalId]: "" }));
    } catch (error) {
      console.error('Error returning to pool:', error);
      alert('Failed to return funds. Please try again.');
    }
  };

  // Handle Savings Pool
  const handleAdjustPool = async (actionType) => {
    const amount = Number(poolAdjustment);
    if (amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    let newPoolAmount;
    if (actionType === "add") {
      newPoolAmount = savingsPool + amount;
    } else {
      if (amount > savingsPool) {
        alert("Cannot withdraw more than available in pool.");
        return;
      }
      newPoolAmount = savingsPool - amount;
    }

    try {
      await updateSavingsPool(newPoolAmount);
      setPoolAdjustment("");
      setIsAddingToPool(false);
    } catch (error) {
      console.error('Error updating savings pool:', error);
      alert('Failed to update savings pool. Please try again.');
    }
  };

  // Delete Savings Goal
  const handleDeleteGoal = async (goalId) => {
    const goal = state.savingsGoals.find((g) => g.id === goalId);
    if (goal && goal.current_amount > 0) {
      // Return funds to savings pool first
      const newPoolAmount = savingsPool + goal.current_amount;
      await updateSavingsPool(newPoolAmount);
    }
    
    try {
      await deleteSavingsGoal(goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete savings goal. Please try again.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Savings Overview */}
      <div className="widget p-6 bg-white/5 rounded-xl">
        <h2 className="text-2xl font-semibold mb-6">Savings Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Total Savings</h3>
            <p className="text-lg font-medium text-green-400">
              {formatCurrency(totalSavings)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Monthly Target: {formatCurrency(monthlySavingsTarget)}
            </p>
            <button
              onClick={handleAddMonthlySavings}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Add Monthly Target to Pool
            </button>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Available in Pool</h3>
            <p className="text-lg font-medium text-green-400">
              {formatCurrency(savingsPool)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Allocated to Goals: {formatCurrency(allocatedSavings)}
            </p>
            <button
              onClick={() => setIsAddingToPool(true)}
              className="mt-4 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Adjust Pool
            </button>
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="widget p-6 bg-white/5 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Savings Goals</h2>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Goal
          </button>
        </div>

        <div className="space-y-6">
          {state.savingsGoals?.map((goal) => (
            <div key={goal.id} className="p-6 bg-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">{goal.name}</h3>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>

              <ProgressBar
                progress={((goal.current_amount || 0) / (goal.target_amount || 1)) * 100}
              />

              <div className="mt-2 flex justify-between items-center text-sm text-gray-400">
                <span>
                  {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount || 0)}
                </span>
                {goal.deadline && (
                  <span>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-4">
                <input
                  type="number"
                  value={adjustments[goal.id] || ''}
                  onChange={(e) => setAdjustments(prev => ({
                    ...prev,
                    [goal.id]: e.target.value
                  }))}
                  placeholder="Amount"
                  className="flex-1 input-field"
                />
                <button
                  onClick={() => handleAllocateToGoal(goal.id)}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Allocate from Pool
                </button>
                <button
                  onClick={() => handleReturnToPool(goal.id)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <MinusIcon className="w-5 h-5" />
                  Return to Pool
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAddingGoal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingGoal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-white shadow-2xl max-w-lg mx-auto p-6"
            >
              <form onSubmit={handleAddGoal} className="space-y-6">
                <h2 className="text-xl font-semibold">Add Savings Goal</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Goal Name"
                    className="input-field"
                    value={newGoal.name}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, name: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    name="targetAmount"
                    required
                    placeholder="Target Amount"
                    className="input-field"
                    value={newGoal.targetAmount}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetAmount: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    name="deadline"
                    className="input-field"
                    value={newGoal.deadline}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, deadline: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl shadow-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                  >
                    Add Goal
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="px-6 py-3 bg-gray-200 rounded-xl text-gray-800 font-semibold"
                    whileHover={{ scale: 1.02 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Adjust Pool Modal */}
      <AnimatePresence>
        {isAddingToPool && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingToPool(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-white shadow-2xl max-w-lg mx-auto p-6"
            >
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Adjust Savings Pool</h2>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    className="input-field"
                    value={poolAdjustment}
                    onChange={(e) => setPoolAdjustment(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => handleAdjustPool('add')}
                      className="flex-1 py-3 bg-green-600 rounded-xl text-white font-semibold"
                      whileHover={{ scale: 1.02 }}
                    >
                      Add to Pool
                    </motion.button>
                    <motion.button
                      onClick={() => handleAdjustPool('subtract')}
                      className="flex-1 py-3 bg-red-600 rounded-xl text-white font-semibold"
                      whileHover={{ scale: 1.02 }}
                    >
                      Withdraw from Pool
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsAddingToPool(false)}
                  className="w-full py-3 bg-gray-200 rounded-xl text-gray-800 font-semibold"
                  whileHover={{ scale: 1.02 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
