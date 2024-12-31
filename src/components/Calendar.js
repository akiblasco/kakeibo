import { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';

export function Calendar() {
  const { state } = useKakeibo();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState('right');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  
  const getDaysInMonth = (date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (date) => {
    const events = [];
    
    // Add expenses
    state.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (isSameDay(date, expenseDate)) {
        events.push({
          type: 'expense',
          title: expense.description,
          amount: expense.amount,
          category: expense.category,
          color: EXPENSE_CATEGORIES[expense.category].color
        });
      }
    });

    // Add savings goals deadlines
    state.savingsGoals?.forEach(goal => {
      const deadlineDate = new Date(goal.deadline);
      if (isSameDay(date, deadlineDate)) {
        events.push({
          type: 'savings-goal',
          title: goal.name,
          amount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          color: 'bg-purple-500'
        });
      }
    });

    return events;
  };

  const handlePreviousMonth = () => {
    setSlideDirection('left');
    setCurrentDate(date => subMonths(date, 1));
  };

  const handleNextMonth = () => {
    setSlideDirection('right');
    setCurrentDate(date => addMonths(date, 1));
  };

  const handleToday = () => {
    setSlideDirection(currentDate > new Date() ? 'left' : 'right');
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsDetailsPanelOpen(true);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="relative">
      <div className="widget">
        <div className="flex justify-between items-center mb-6">
          <AnimatePresence mode="wait">
            <motion.h2
              key={format(currentDate, 'MMMM yyyy')}
              initial={{ y: slideDirection === 'right' ? 20 : -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: slideDirection === 'right' ? -20 : 20, opacity: 0 }}
              className="text-2xl font-semibold"
            >
              {format(currentDate, 'MMMM yyyy')}
            </motion.h2>
          </AnimatePresence>
          
          <div className="flex gap-2">
            <button onClick={handlePreviousMonth} className="btn btn-secondary">
              Previous
            </button>
            <button onClick={handleToday} className="btn btn-secondary">
              Today
            </button>
            <button onClick={handleNextMonth} className="btn btn-secondary">
              Next
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentDate, 'yyyy-MM')}
            initial={{ x: slideDirection === 'right' ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDirection === 'right' ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-7 gap-2"
          >
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium opacity-70 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map(date => {
              const events = getEventsForDay(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    aspect-square rounded-lg p-2 relative
                    ${isCurrentMonth ? 'bg-white/5' : 'bg-white/2 opacity-50'}
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                    ${isToday(date) ? 'font-bold' : ''}
                    hover:bg-white/10 transition-colors
                  `}
                >
                  <span className="text-sm">{format(date, 'd')}</span>
                  {events.length > 0 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {events.map((event, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${event.color}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {isDetailsPanelOpen && selectedDate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsPanelOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-96 bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDetailsPanelOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <span className="sr-only">Close panel</span>
                    ×
                  </button>
                </div>

                {/* Expenses List */}
                <div className="space-y-4">
                  {state.expenses
                    .filter(expense => isSameDay(new Date(expense.date), selectedDate))
                    .map(expense => (
                      <div
                        key={expense.id}
                        className="p-4 rounded-lg bg-gray-800 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${EXPENSE_CATEGORIES[expense.category].color} flex items-center justify-center`}>
                            {/* You can add category icons here if needed */}
                          </div>
                          <div>
                            <div className="font-medium">
                              {EXPENSE_CATEGORIES[expense.category].label}
                            </div>
                            <div className="text-sm text-gray-400">
                              {expense.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-semibold">
                          {state.income.currency} {expense.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}

                  {state.expenses.filter(expense => 
                    isSameDay(new Date(expense.date), selectedDate)
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No expenses for this date
                    </div>
                  )}
                </div>

                {/* Total for the day */}
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total for the day</span>
                    <span className="text-xl font-bold">
                      {state.income.currency} {state.expenses
                        .filter(expense => isSameDay(new Date(expense.date), selectedDate))
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 