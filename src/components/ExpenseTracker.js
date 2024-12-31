import { Calendar } from './Calendar';
import { ExpenseHistory } from './ExpenseHistory';

export function ExpenseTracker() {
  return (
    <div className="space-y-6">
      <Calendar />
      <ExpenseHistory />
    </div>
  );
} 