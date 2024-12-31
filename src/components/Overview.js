import { useState } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import { ExpenseRing } from "./ExpenseRing";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";

export function Overview() {
  const { state, dispatch } = useKakeibo();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
  });

  const EXPENSE_CATEGORIES = {
    Housing: { label: "Housing", startColor: "#3b82f6", endColor: "#6366f1" },
    Subscriptions: { label: "Subscriptions", startColor: "#a855f7", endColor: "#ec4899" },
    DailyNeeds: { label: "Daily Needs", startColor: "#22c55e", endColor: "#14b8a6" },
    Wants: { label: "Wants", startColor: "#facc15", endColor: "#fb923c" },
    Leisure: { label: "Leisure", startColor: "#f472b6", endColor: "#ef4444" },
    Unexpected: { label: "Unexpected", startColor: "#f87171", endColor: "#991b1b" },
  };

  // Combine one-time and recurring expenses
  const allExpenses = [...state.expenses, ...state.recurringExpenses];

  const totalSpent = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingSpendable = (state.income?.monthlySpendable || 0) - totalSpent;

  const spendingBreakdown = Object.entries(
    allExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({
    category,
    label: EXPENSE_CATEGORIES[category]?.label || category,
    amount,
    percentage: totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(2) : "0.00",
    gradient: {
      startColor: EXPENSE_CATEGORIES[category]?.startColor || "#cccccc",
      endColor: EXPENSE_CATEGORIES[category]?.endColor || "#999999",
    },
  }));

  const handleAddExpense = (event) => {
    event.preventDefault();
    const expenseData = {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      category: selectedCategory,
      date: newExpense.date,
    };

    if (newExpense.isRecurring) {
      dispatch({ type: "ADD_RECURRING_EXPENSE", payload: expenseData });
    } else {
      dispatch({ type: "ADD_EXPENSE", payload: expenseData });
    }

    setIsAddingExpense(false);
    setSelectedCategory(null);
    setNewExpense({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
    });
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-20">
      {/* Monthly Overview */}
      <motion.div className="widget" layout transition={{ duration: 0.3, ease: "easeInOut" }}>
        <h2 className="text-2xl font-semibold mb-8">Monthly Overview</h2>
        <motion.div
          className="flex flex-col items-center space-y-4"
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ExpenseRing />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Remaining Spendable</h3>
            <div
              className={`text-3xl font-bold ${
                remainingSpendable >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {state.income?.currency || "USD"} {remainingSpendable.toFixed(2)}
            </div>
          </div>

          {/* Spending Breakdown List */}
          {totalSpent > 0 && (
            <div className="mt-16 text-center">
              <h3 className="text-lg mb-4">Spending Breakdown</h3>
              <ul className="space-y-4">
                {spendingBreakdown.map(({ category, label, amount, percentage, gradient }) => (
                  <li
                    key={category}
                    className="grid grid-cols-3 items-center p-3 bg-gray-100 rounded-lg"
                  >
                    {/* Category Marker and Label */}
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${gradient.startColor}, ${gradient.endColor})`,
                        }}
                      ></div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>

                    {/* Amount */}
                    <div className="text-center">
                      <span className="text-sm font-semibold">
                        {state.income?.currency || "USD"} {amount.toFixed(2)}
                      </span>
                    </div>

                    {/* Percentage */}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">({percentage}%)</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Add Expense Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <motion.button
          onClick={() => setIsAddingExpense(true)}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <PlusIcon className="w-10 h-10 text-gray-700" />
          </div>
        </motion.button>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddingExpense && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingExpense(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-white shadow-2xl max-w-lg mx-auto p-6"
            >
              {!selectedCategory ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Select Category</h2>
                  <ul className="space-y-4">
                    {Object.entries(EXPENSE_CATEGORIES).map(([category, info]) => (
                      <motion.li
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className="p-4 rounded-lg flex items-center space-x-4 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div
                          className="w-10 h-10 rounded-full shadow-md"
                          style={{
                            background: `linear-gradient(to right, ${info.startColor}, ${info.endColor})`,
                          }}
                        />
                        <span className="font-medium text-gray-800">{info.label}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : (
                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      Add {EXPENSE_CATEGORIES[selectedCategory].label} Expense
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Back
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="number"
                      name="amount"
                      required
                      placeholder="Amount"
                      className="input-field"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                    <input
                      type="text"
                      name="description"
                      required
                      placeholder="Description"
                      className="input-field"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    />
                    <input
                      type="date"
                      name="date"
                      required
                      className="input-field"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newExpense.isRecurring}
                        onChange={(e) =>
                          setNewExpense({ ...newExpense, isRecurring: e.target.checked })
                        }
                      />
                      <span>Mark as recurring</span>
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                  >
                    Add Expense
                  </motion.button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
