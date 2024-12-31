import { useState, useMemo } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import { startOfMonth, endOfMonth } from "date-fns";
import { ProgressBar } from "./ProgressBar";
import { DonutChart } from "./DonutChart";

export function SavingsGoals() {
  const { state, dispatch } = useKakeibo();
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [isAllocatingSavings, setIsAllocatingSavings] = useState(false);

  const currentMonthIncome = state.income?.amount || 0;
  const monthlyAllocation = state.income?.monthlyAllocation || 0;

  const currentMonthExpenses = state.expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= startOfMonth(new Date()) &&
        expenseDate <= endOfMonth(new Date())
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const availableForSavings = useMemo(() => {
    return currentMonthIncome - currentMonthExpenses - monthlyAllocation;
  }, [currentMonthIncome, currentMonthExpenses, monthlyAllocation]);

  const totalSaved = state.savingsGoals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );

  const handleAddGoal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newGoal = {
      id: crypto.randomUUID(),
      name: formData.get("name"),
      targetAmount: Number(formData.get("targetAmount")),
      currentAmount: 0,
      deadline: formData.get("deadline"),
      category: formData.get("category"),
      description: formData.get("description"),
    };

    dispatch({
      type: "ADD_SAVINGS_GOAL",
      payload: newGoal,
    });

    setShowAddGoalForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Savings Overview */}
      <div className="widget">
        <h2 className="text-2xl font-semibold">Savings Overview</h2>
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <DonutChart
            data={state.savingsGoals.map((goal) => ({
              label: goal.name,
              value: goal.currentAmount,
              color: goal.category === "emergency" ? "#22c55e" : "#3b82f6",
            }))}
          />
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-70">Total Savings</p>
              <p className="text-xl font-semibold">
                {state.income?.currency || "USD"} {totalSaved.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-70">Available for Savings</p>
              <p
                className={`text-xl font-semibold ${
                  availableForSavings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {state.income?.currency || "USD"}{" "}
                {availableForSavings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="widget">
        <h2 className="text-2xl font-semibold">Savings Goals</h2>
        {showAddGoalForm ? (
          <form onSubmit={handleAddGoal} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Goal Name"
              required
              className="input-field"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="targetAmount"
                placeholder="Target Amount"
                required
                className="input-field"
              />
              <input
                type="date"
                name="deadline"
                required
                className="input-field"
              />
            </div>
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="input-field"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Add Goal
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddGoalForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.savingsGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white/5 p-4 rounded-lg space-y-2"
                >
                  <h3 className="text-lg font-semibold">{goal.name}</h3>
                  <ProgressBar
                    progress={(goal.currentAmount / goal.targetAmount) * 100}
                  />
                  <div className="text-sm opacity-70">
                    <p>
                      {state.income?.currency || "USD"}{" "}
                      {goal.currentAmount.toLocaleString()} /{" "}
                      {goal.targetAmount.toLocaleString()}
                    </p>
                    <p>Deadline: {goal.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={() => setShowAddGoalForm(true)}
            >
              Add New Goal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
