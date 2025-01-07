import { useEffect, useState } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { motion, AnimatePresence } from "framer-motion";

export function ExpenseRing() {
  const { state } = useKakeibo();
  const [segments, setSegments] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const size = 280; // Diameter of the ring
  const strokeWidth = 20; // Thickness of the ring
  const radius = (size - strokeWidth) / 2; // Radius of the inner circle
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const calculateSegments = () => {
      const combinedExpenses = [...state.expenses, ...state.recurringExpenses];
      const total = combinedExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalExpenses(total);

      if (total === 0) {
        setSegments([]);
        return;
      }

      const categoryTotals = combinedExpenses.reduce((acc, expense) => {
        const category = expense.category?.toLowerCase();
        acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
        return acc;
      }, {});

      const gapDegrees = 10; // Space between segments
      const availableDegrees = 360 - Object.keys(categoryTotals).length * gapDegrees;

      let startAngle = 0;
      const calculatedSegments = Object.entries(categoryTotals).map(([category, amount]) => {
        const percentage = amount / total;
        const segmentDegrees = percentage * availableDegrees;
        const segmentLength = (segmentDegrees / 360) * circumference;
        const startOffset = (startAngle / 360) * circumference;
        startAngle += segmentDegrees + gapDegrees;

        return {
          category,
          gradient: {
            startColor: EXPENSE_CATEGORIES[category]?.startColor || "#cccccc",
            endColor: EXPENSE_CATEGORIES[category]?.endColor || "#999999",
          },
          segmentLength,
          startOffset,
        };
      });

      setSegments(calculatedSegments);
    };

    calculateSegments();
  }, [state.expenses, state.recurringExpenses, circumference]);

  if (totalExpenses === 0 || segments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-center text-gray-500"
      >
        No expenses to display
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        rotate: { duration: 0.7, ease: "anticipate" }
      }}
      className="relative w-[280px] h-[280px] flex items-center justify-center"
    >
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {segments.map((segment, index) => {
            const gradientId = `gradient-${index}`;
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={segment.gradient.startColor} />
                <stop offset="100%" stopColor={segment.gradient.endColor} />
              </linearGradient>
            );
          })}
        </defs>

        <AnimatePresence>
          {segments.map((segment, index) => (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={`url(#gradient-${index})`}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.segmentLength} ${circumference - segment.segmentLength}`}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: -segment.startOffset,
                transition: { 
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "circOut"
                }
              }}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
              }}
            />
          ))}
        </AnimatePresence>
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        className="absolute flex flex-col items-center justify-center text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          className="text-2xl font-light"
        >
          {state.income?.currency || "$"}
          {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-sm text-gray-500"
        >
          Monthly Spend
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
