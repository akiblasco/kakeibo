import { useState, useMemo } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import { ProgressBar } from "./ProgressBar";
import { motion, AnimatePresence } from "framer-motion";

export function SavingsGoals() {
  const { state, dispatch } = useKakeibo();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: new Date().toISOString().split("T")[0],
  });
  const [adjustments, setAdjustments] = useState({}); // Track input values for each goal

  // Calculate Total Recurring and Regular Expenses
  const recurringExpensesTotal = useMemo(
    () =>
      (state.recurringExpenses || []).reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
    [state.recurringExpenses]
  );

  const regularExpensesTotal = useMemo(
    () =>
      (state.expenses || []).reduce((sum, expense) => sum + expense.amount, 0),
    [state.expenses]
  );

  const totalExpenses = recurringExpensesTotal + regularExpensesTotal;

  // Remaining Monthly Income After Tax and Savings
  const remainingMonthlyIncome =
    state.income?.monthlyNet - recurringExpensesTotal || 0;
  const remainingMonthlyAfterSavings =
    state.income?.monthlySpendable - recurringExpensesTotal || 0;

  // Available for Savings
  const totalSaved = state.savings?.total || 0;
  const availableForSavings = Math.max(remainingMonthlyAfterSavings - totalSaved, 0);

  // Add New Savings Goal
  const handleAddGoal = (event) => {
    event.preventDefault();

    if (!newGoal.name || !newGoal.targetAmount) {
      alert("Please fill in all required fields.");
      return;
    }

    const goal = {
      id: "_" + Math.random().toString(36).substr(2, 9), // Generate a unique ID
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
    };

    dispatch({ type: "ADD_SAVINGS_GOAL", payload: goal });
    setIsAddingGoal(false);
    setNewGoal({
      name: "",
      targetAmount: "",
      deadline: new Date().toISOString().split("T")[0],
    });
  };

  // Adjust Savings for Goals
  const handleAdjustGoal = (goalId, actionType) => {
    const amount = Number(adjustments[goalId] || 0);

    if (amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const goal = state.savingsGoals.find((g) => g.id === goalId);

    if (!goal) {
      alert("Goal not found.");
      return;
    }

    const updatedAmount =
      actionType === "add"
        ? goal.currentAmount + amount
        : goal.currentAmount - amount;

    if (updatedAmount < 0) {
      alert("Cannot subtract more than the current saved amount.");
      return;
    }

    dispatch({
      type: "UPDATE_SAVINGS_GOAL",
      payload: {
        goalId,
        currentAmount: updatedAmount,
      },
    });

    setAdjustments((prev) => ({ ...prev, [goalId]: "" })); // Reset input value for the specific goal
  };

  // Delete Savings Goal
  const handleDeleteGoal = (goalId) => {
    dispatch({ type: "DELETE_SAVINGS_GOAL", payload: goalId });
  };

  return (
    <div className="space-y-12">
      {/* Savings Overview */}
      <div className="widget">
        <h2 className="text-2xl font-semibold">Savings Overview</h2>
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-1 grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-lg font-bold text-red-500">
                {state.income.currency} {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500">
                Remaining Monthly Income After Tax
              </p>
              <p
                className={`text-lg font-bold ${
                  remainingMonthlyIncome >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {state.income.currency} {remainingMonthlyIncome.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500">
                Available for Savings
              </p>
              <p
                className={`text-lg font-bold ${
                  availableForSavings >= 0 ? "text-blue-500" : "text-red-500"
                }`}
              >
                {state.income.currency} {availableForSavings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="widget">
        <h2 className="text-2xl font-semibold">Savings Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {state.savingsGoals.length > 0 ? (
            state.savingsGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-gray-50 p-4 rounded-lg shadow space-y-4"
              >
                <h3 className="text-lg font-semibold">{goal.name}</h3>
                <ProgressBar
                  progress={Math.min(
                    (goal.currentAmount / goal.targetAmount) * 100 || 0,
                    100
                  )}
                />
                <p className="text-sm text-gray-600">
                  {goal.currentAmount.toLocaleString()} /{" "}
                  {goal.targetAmount.toLocaleString()} {state.income.currency}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="number"
                    value={adjustments[goal.id] || ""}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        [goal.id]: e.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    className="input-field flex-1"
                    required
                    style={{ padding: "0.5rem" }}
                  />
                  <button
                    onClick={() => handleAdjustGoal(goal.id, "add")}
                    className="btn btn-primary px-3 py-1"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleAdjustGoal(goal.id, "subtract")}
                    className="btn btn-secondary px-3 py-1"
                  >
                    −
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-red-500 text-sm mt-2"
                >
                  Delete Goal
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No savings goals added yet.</p>
          )}
        </div>
        <div className="mt-4 text-center">
          <motion.button
            onClick={() => setIsAddingGoal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600"
          >
            Add Savings Goal
          </motion.button>
        </div>
      </div>

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
                <motion.button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl shadow-lg text-white font-semibold"
                  whileHover={{ scale: 1.02 }}
                >
                  Add Goal
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
