import { useState } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import { ExpenseRing } from "./ExpenseRing";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function Overview() {
  const { state, saveExpense } = useKakeibo();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
  });

  const EXPENSE_CATEGORIES = {
    housing: { label: "Housing", startColor: "#3b82f6", endColor: "#6366f1" },
    subscriptions: { label: "Subscriptions", startColor: "#a855f7", endColor: "#ec4899" },
    "daily needs": { label: "Daily Needs", startColor: "#22c55e", endColor: "#14b8a6" },
    wants: { label: "Wants", startColor: "#facc15", endColor: "#fb923c" },
    leisure: { label: "Leisure", startColor: "#f472b6", endColor: "#ef4444" },
    unexpected: { label: "Unexpected", startColor: "#f87171", endColor: "#991b1b" },
  };

  // Combine one-time and recurring expenses
  const allExpenses = [...state.expenses, ...state.recurringExpenses];

  const totalSpent = allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remainingSpendable = (state.income?.monthlySpendable || 0) - totalSpent;

  const spendingBreakdown = Object.entries(
    allExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
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

  const handleAddExpense = async (event) => {
    event.preventDefault();
    const expenseData = {
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      category: selectedCategory.toLowerCase(),
      date: newExpense.date,
      is_recurring: newExpense.isRecurring
    };

    try {
      await saveExpense(expenseData, newExpense.isRecurring);
      setIsAddingExpense(false);
      setSelectedCategory(null);
      setNewExpense({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false,
      });
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 max-w-2xl mx-auto pb-20"
    >
      {/* Monthly Overview */}
      <motion.div
        variants={itemVariants}
        className="widget"
      >
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-semibold mb-8"
        >
          Monthly Overview
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center space-y-4"
        >
          <ExpenseRing />
          <motion.div
            variants={itemVariants}
            className="text-center space-y-2"
          >
            <h3 className="text-lg font-medium">Remaining Spendable</h3>
            <div
              className={`text-3xl font-bold ${
                remainingSpendable >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {state.income?.currency || "USD"} {remainingSpendable.toFixed(2)}
            </div>
          </motion.div>

          {/* Spending Breakdown List */}
          {totalSpent > 0 && (
            <motion.div
              variants={itemVariants}
              className="mt-16 text-center w-full"
            >
              <h3 className="text-lg mb-4">Spending Breakdown</h3>
              <motion.ul
                variants={containerVariants}
                className="space-y-4"
              >
                {spendingBreakdown.map(({ category, label, amount, percentage, gradient }, index) => (
                  <motion.li
                    key={category}
                    variants={listItemVariants}
                    custom={index}
                    className="grid grid-cols-3 items-center p-3 bg-gray-100 rounded-lg transform hover:scale-102 transition-transform duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${gradient.startColor}, ${gradient.endColor})`,
                        }}
                        whileHover={{ scale: 1.2 }}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </div>

                    <div className="text-center">
                      <span className="text-sm font-semibold">
                        {state.income?.currency || "USD"} {amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-gray-500">({percentage}%)</span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Add Expense Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
      >
        <motion.button
          onClick={() => setIsAddingExpense(true)}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md opacity-70 group-hover:opacity-100 transition-opacity"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <PlusIcon className="w-10 h-10 text-gray-700" />
          </div>
        </motion.button>
      </motion.div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddingExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsAddingExpense(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="fixed inset-x-4 top-20 z-50 rounded-3xl bg-white shadow-2xl max-w-lg mx-auto p-6"
            >
              {!selectedCategory ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Select Category</h2>
                  <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([category, info], index) => (
                      <motion.li
                        key={category}
                        variants={listItemVariants}
                        custom={index}
                        onClick={() => setSelectedCategory(category)}
                        className="p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02, x: 10 }}
                      >
                        <motion.div
                          className="w-10 h-10 rounded-full shadow-md"
                          style={{
                            background: `linear-gradient(to right, ${info.startColor}, ${info.endColor})`,
                          }}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="font-medium text-gray-800">{info.label}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleAddExpense}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      Add {EXPENSE_CATEGORIES[selectedCategory].label} Expense
                    </h2>
                    <motion.button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-gray-500 hover:text-gray-700"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <motion.input
                      variants={itemVariants}
                      type="number"
                      name="amount"
                      required
                      placeholder="Amount"
                      className="input-field"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                    <motion.input
                      variants={itemVariants}
                      type="text"
                      name="description"
                      required
                      placeholder="Description"
                      className="input-field"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    />
                    <motion.input
                      variants={itemVariants}
                      type="date"
                      name="date"
                      required
                      className="input-field"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                    <motion.label
                      variants={itemVariants}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={newExpense.isRecurring}
                        onChange={(e) =>
                          setNewExpense({ ...newExpense, isRecurring: e.target.checked })
                        }
                      />
                      <span>Mark as recurring</span>
                    </motion.label>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Expense
                  </motion.button>
                </motion.form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
