import { useState } from 'react';
import { useKakeibo } from '../context/KakeiboContext';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { startOfMonth, endOfMonth } from 'date-fns';

export function SegmentedDonutChart() {
  const { state } = useKakeibo();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Calculate expenses for the current month
  const currentMonthExpenses = state.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(new Date()) && 
           expenseDate <= endOfMonth(new Date());
  });

  // Calculate total expenses
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => 
    sum + expense.amount, 0
  );

  // Calculate expenses by category
  const expensesByCategory = Object.keys(EXPENSE_CATEGORIES).reduce((acc, category) => {
    acc[category] = currentMonthExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return acc;
  }, {});

  // SVG parameters
  const size = 300;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gap = 0.02; // Gap between segments

  // Generate segments
  let startAngle = 0;
  const segments = Object.entries(expensesByCategory).map(([category, amount]) => {
    const percentage = totalExpenses ? (amount / totalExpenses) : 0;
    const angle = 2 * Math.PI * percentage - gap;
    
    // Calculate SVG arc path with rounded ends
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(startAngle + angle);
    const y2 = center + radius * Math.sin(startAngle + angle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`, // Move to start point
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Draw arc
      `L ${center} ${center}`, // Line to center
      `Z` // Close path
    ].join(' ');

    const segment = {
      category,
      amount,
      percentage,
      pathData,
      startAngle,
      angle
    };
    
    startAngle += angle + gap;
    return segment;
  });

  return (
    <div className="relative w-[300px] h-[300px]">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Category segments */}
        {segments.map((segment, index) => {
          const categoryInfo = EXPENSE_CATEGORIES[segment.category];
          return (
            <g key={segment.category}>
              <path
                d={segment.pathData}
                fill={categoryInfo.color.replace('bg-', 'var(--color-')}
                className={`transition-all duration-300 ${
                  hoveredCategory === segment.category 
                    ? 'opacity-100' 
                    : hoveredCategory 
                      ? 'opacity-40' 
                      : 'opacity-80'
                }`}
                onMouseEnter={() => setHoveredCategory(segment.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-sm opacity-70">Total Expenses</p>
        <p className="text-2xl font-semibold">
          {state.income.currency} {totalExpenses.toLocaleString()}
        </p>
      </div>

      {/* Hover details */}
      {hoveredCategory && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-center min-w-[200px]">
          <p className="font-medium">{EXPENSE_CATEGORIES[hoveredCategory].label}</p>
          <p className="text-xl font-semibold">
            {state.income.currency} {expensesByCategory[hoveredCategory].toLocaleString()}
          </p>
          <p className="text-sm opacity-70">
            {((expensesByCategory[hoveredCategory] / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      )}
    </div>
  );
} 