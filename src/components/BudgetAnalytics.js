import { Line } from 'react-chartjs-2';
import { useKakeibo } from '../context/KakeiboContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function BudgetAnalytics() {
  const { state } = useKakeibo();

  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Spending Trend',
        data: calculateWeeklySpending(state.expenses),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Monthly Spending Trend'
      }
    }
  };

  return (
    <div className="analytics-container">
      <Line options={options} data={data} />
    </div>
  );
}

function calculateWeeklySpending(expenses) {
  // Implementation for weekly calculations
  return [0, 0, 0, 0].map(() => Math.random() * 50000);
} 