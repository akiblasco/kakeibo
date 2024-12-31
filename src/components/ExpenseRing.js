import { useEffect, useState } from "react";
import { useKakeibo } from "../context/KakeiboContext";

export function ExpenseRing() {
  const { state } = useKakeibo();
  const [segments, setSegments] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Tailwind gradient colors converted to actual hex color stops
  const EXPENSE_CATEGORIES = {
    Housing: { startColor: "#3b82f6", endColor: "#6366f1" }, // from-blue-500 to-indigo-500
    Subscriptions: { startColor: "#a855f7", endColor: "#ec4899" }, // from-purple-500 to-pink-500
    DailyNeeds: { startColor: "#22c55e", endColor: "#14b8a6" }, // from-green-400 to-teal-400
    Wants: { startColor: "#facc15", endColor: "#fb923c" }, // from-yellow-400 to-orange-500
    Leisure: { startColor: "#f472b6", endColor: "#ef4444" }, // from-pink-500 to-red-500
    Unexpected: { startColor: "#f87171", endColor: "#991b1b" }, // from-red-400 to-red-700
  };

  const size = 280; // Diameter of the ring
  const strokeWidth = 20; // Thickness of the ring
  const radius = (size - strokeWidth) / 2; // Radius of the inner circle
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const calculateSegments = () => {
      const combinedExpenses = [...state.expenses, ...state.recurringExpenses];
      const total = combinedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);

      if (total === 0) {
        setSegments([]);
        return;
      }

      const categoryTotals = combinedExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
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
          gradient: EXPENSE_CATEGORIES[category] || {
            startColor: "#cccccc",
            endColor: "#999999",
          },
          segmentLength,
          startOffset,
        };
      });

      setSegments(calculatedSegments);
    };

    calculateSegments();
  }, [state.expenses, state.recurringExpenses]);

  if (totalExpenses === 0 || segments.length === 0) {
    return <div className="text-center text-gray-500">No expenses to display</div>;
  }

  return (
    <div className="relative w-[280px] h-[280px] flex items-center justify-center">
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

        {segments.map((segment, index) => (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${index})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segment.segmentLength} ${circumference - segment.segmentLength}`}
            strokeDashoffset={-segment.startOffset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              transition: "stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease",
            }}
          />
        ))}
      </svg>

      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-light">
          {state.income?.currency || "$"}
          {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-sm text-gray-500">Monthly Spend</span>
      </div>
    </div>
  );
}
