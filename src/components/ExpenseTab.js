import React, { useState, useMemo } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const EXPENSE_CATEGORIES = {
  Housing: { startColor: "#3b82f6", endColor: "#6366f1" },
  Subscriptions: { startColor: "#a855f7", endColor: "#ec4899" },
  DailyNeeds: { startColor: "#22c55e", endColor: "#14b8a6" },
  Wants: { startColor: "#facc15", endColor: "#fb923c" },
  Leisure: { startColor: "#f472b6", endColor: "#ef4444" },
  Unexpected: { startColor: "#f87171", endColor: "#991b1b" },
};

export function ExpenseTab() {
  const { state } = useKakeibo();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Combine one-time and recurring expenses
  const allExpenses = useMemo(
    () => [...state.expenses, ...state.recurringExpenses],
    [state.expenses, state.recurringExpenses]
  );

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    return allExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date).toISOString().split("T")[0]; // Ensure consistent format
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense);
      return acc;
    }, {});
  }, [allExpenses]);

  // Generate calendar days for the current month only
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handlePreviousMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsDetailsPanelOpen(true);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
        <div>
          <button onClick={handlePreviousMonth}>&larr;</button>
          <button onClick={handleNextMonth}>&rarr;</button>
        </div>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-4">
        {calendarDays.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd"); // Ensure consistent formatting
          const hasExpenses = expensesByDate[dateStr]?.length > 0;

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`p-4 rounded-lg ${
                hasExpenses ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <div className="text-sm">{format(date, "d")}</div>
              {hasExpenses && (
                <div className="flex justify-center mt-2 space-x-1">
                  {expensesByDate[dateStr].map((expense, index) => {
                    const category = EXPENSE_CATEGORIES[expense.category];
                    if (category) {
                      return (
                        <div
                          key={index}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: `linear-gradient(to right, ${category.startColor}, ${category.endColor})`,
                          }}
                        ></div>
                      );
                    }
                    return (
                      <div
                        key={index}
                        className="w-2 h-2 rounded-full bg-gray-400"
                      ></div>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {isDetailsPanelOpen && selectedDate && (
          <motion.div
            className="fixed right-0 top-0 w-1/3 h-full bg-white shadow-lg overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
          >
            <button
              onClick={() => setIsDetailsPanelOpen(false)}
              className="absolute top-4 right-4"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold p-6">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <div className="p-6 space-y-4">
              {expensesByDate[format(selectedDate, "yyyy-MM-dd")]?.map(
                (expense, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-100 rounded-lg shadow"
                  >
                    <h3 className="font-medium">
                      {EXPENSE_CATEGORIES[expense.category]?.label || "Other"}
                    </h3>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                    <p className="font-bold">
                      {state.income?.currency || "$"}{" "}
                      {expense.amount.toLocaleString()}
                    </p>
                  </div>
                )
              )}
              {!expensesByDate[format(selectedDate, "yyyy-MM-dd")]?.length && (
                <p className="text-gray-500 text-center">No expenses for this day</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Expenses */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Recent Expenses</h2>
        <ul className="space-y-4">
          {allExpenses.slice(0, 5).map((expense, index) => (
            <li key={index} className="p-4 bg-gray-100 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{expense.description}</h3>
                  <p className="text-sm text-gray-600">{expense.date}</p>
                </div>
                <p className="font-bold">
                  {state.income?.currency || "$"} {expense.amount.toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
