import { useState, useMemo } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { motion, AnimatePresence } from "framer-motion";

export function ExpenseCalendar() {
  const { state } = useKakeibo();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Combine regular and recurring expenses
  const allExpenses = useMemo(
    () => [...state.expenses, ...state.recurringExpenses],
    [state.expenses, state.recurringExpenses]
  );

  // Get calendar dates including padding
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    return allExpenses.reduce((acc, expense) => {
      const date = format(new Date(expense.date), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense);
      return acc;
    }, {});
  }, [allExpenses]);

  const monthlyTotal = useMemo(() => {
    return allExpenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentDate.getMonth() &&
          expenseDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [allExpenses, currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsDetailsPanelOpen(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 bg-gray-200 rounded"
          >
            Previous
          </button>
          <button onClick={handleNextMonth} className="p-2 bg-gray-200 rounded">
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar Dates */}
        {calendarDays.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const hasExpenses = expensesByDate[dateStr]?.length > 0;
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`p-4 rounded-lg ${
                hasExpenses ? "bg-white/10" : "bg-gray-100"
              } ${
                isSelected ? "ring-2 ring-blue-500" : ""
              } hover:bg-white/20 transition-colors ${
                isCurrentMonth ? "text-black" : "text-gray-400"
              }`}
            >
              <div>{format(date, "d")}</div>
              {hasExpenses && (
                <div className="flex justify-center mt-1">
                  {expensesByDate[dateStr].map((expense) => (
                    <div
                      key={expense.id}
                      className={`w-2 h-2 rounded-full ${
                        EXPENSE_CATEGORIES[expense.category]?.color || "bg-gray-500"
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Side Menu */}
      <AnimatePresence>
        {isDetailsPanelOpen && selectedDate && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="fixed right-0 top-0 h-full w-1/3 bg-gray-900 text-white p-6"
          >
            <button
              onClick={() => setIsDetailsPanelOpen(false)}
              className="absolute top-4 right-4 text-lg font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl mb-4">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <div>
              {expensesByDate[format(selectedDate, "yyyy-MM-dd")]?.map(
                (expense) => (
                  <div
                    key={expense.id}
                    className="p-4 mb-4 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {EXPENSE_CATEGORIES[expense.category]?.label}
                      </span>
                      <span>
                        {state.income.currency} {expense.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-400">{expense.description}</p>
                  </div>
                )
              )}
              {!expensesByDate[format(selectedDate, "yyyy-MM-dd")]?.length && (
                <div className="text-center text-gray-500">
                  No expenses for this day
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
