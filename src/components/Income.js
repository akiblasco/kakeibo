import { useState } from "react";
import { useKakeibo } from "../context/KakeiboContext";
import { CurrencyDollarIcon, ChartPieIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export function Income() {
  const { state, saveIncome } = useKakeibo();
  const [isEditing, setIsEditing] = useState(!state.income);
  const [formValues, setFormValues] = useState({
    amount: state.income?.amount || 0,
    incomeType: state.income?.incomeType || "monthly",
    currency: state.income?.currency || "USD",
    taxRate: state.income?.taxRate || 20,
    savingsPercentage: state.income?.savingsPercentage || 20,
  });

  const recurringExpensesTotal = (state.recurringExpenses || []).reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const recurringExpensesMonthly = parseFloat(recurringExpensesTotal.toFixed(2));
  const recurringExpensesYearly = parseFloat((recurringExpensesTotal * 12).toFixed(2));

  const remainingMonthlyIncome = state.income?.monthlyNet - recurringExpensesMonthly || 0;
  const remainingYearlyIncome = state.income?.yearlyNet - recurringExpensesYearly || 0;

  const remainingMonthlyAfterSavings =
    state.income?.monthlySpendable - recurringExpensesMonthly || 0;
  const remainingYearlyAfterSavings =
    state.income?.yearlySpendable - recurringExpensesYearly || 0;

  const inputClass =
    "w-full p-3 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: parseFloat(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monthlyGross =
      formValues.incomeType === "yearly" ? formValues.amount / 12 : formValues.amount;
    const yearlyGross =
      formValues.incomeType === "monthly" ? formValues.amount * 12 : formValues.amount;
    const monthlyTax = monthlyGross * (formValues.taxRate / 100);
    const yearlyTax = yearlyGross * (formValues.taxRate / 100);
    const monthlyNet = monthlyGross - monthlyTax;
    const yearlyNet = yearlyGross - yearlyTax;
    const monthlySavings = monthlyNet * (formValues.savingsPercentage / 100);
    const yearlySavings = yearlyNet * (formValues.savingsPercentage / 100);
    const monthlySpendable = monthlyNet - monthlySavings;
    const yearlySpendable = yearlyNet - yearlySavings;

    const incomeData = {
      amount: parseFloat(formValues.amount),
      income_type: formValues.incomeType,
      currency: formValues.currency,
      tax_rate: parseFloat(formValues.taxRate),
      savings_percentage: parseFloat(formValues.savingsPercentage),
      monthly_gross: parseFloat(monthlyGross.toFixed(2)),
      yearly_gross: parseFloat(yearlyGross.toFixed(2)),
      monthly_tax: parseFloat(monthlyTax.toFixed(2)),
      yearly_tax: parseFloat(yearlyTax.toFixed(2)),
      monthly_net: parseFloat(monthlyNet.toFixed(2)),
      yearly_net: parseFloat(yearlyNet.toFixed(2)),
      monthly_savings: parseFloat(monthlySavings.toFixed(2)),
      yearly_savings: parseFloat(yearlySavings.toFixed(2)),
      monthly_spendable: parseFloat(monthlySpendable.toFixed(2)),
      yearly_spendable: parseFloat(yearlySpendable.toFixed(2))
    };

    try {
      console.log('Submitting income data:', incomeData);
      await saveIncome(incomeData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income data. Please try again. Error: ' + error.message);
    }
  };

  const renderRow = (icon, label, value, color = "text-gray-800") => (
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 text-blue-500">{icon}</div>
      <div className="flex-1 text-sm text-gray-500">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );

  if (isEditing || !state.income) {
    return (
      <div className="space-y-6">
        <div className="widget">
          <h2 className="text-2xl font-semibold mb-6">Income Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Income Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Income Type</label>
                  <select
                    name="incomeType"
                    value={formValues.incomeType}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="monthly">Monthly Income</option>
                    <option value="yearly">Yearly Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formValues.currency}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formValues.incomeType === "yearly" ? "Yearly" : "Monthly"} Gross Income
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formValues.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder={`Enter your ${formValues.incomeType} income`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tax & Savings</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <input
                  type="range"
                  name="taxRate"
                  value={formValues.taxRate}
                  onChange={handleRangeChange}
                  min="0"
                  max="50"
                  step="0.5"
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-sm">{formValues.taxRate}%</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Savings Target (% of net income)
                </label>
                <input
                  type="range"
                  name="savingsPercentage"
                  value={formValues.savingsPercentage}
                  onChange={handleRangeChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-sm">{formValues.savingsPercentage}%</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1 p-3">
                Save Income Settings
              </button>
              {state.income && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary p-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="widget">
        <h2 className="text-2xl font-semibold mb-6">Income Overview</h2>
        <div className="space-y-8">
          {/* Monthly Breakdown */}
          <div>
            <h3 className="text-lg font-medium mb-4">Monthly Breakdown</h3>
            <div className="space-y-4">
              {renderRow(
                <CurrencyDollarIcon />,
                "Gross Monthly Income",
                `${state.income.currency} ${state.income.monthlyGross?.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChevronDownIcon />,
                "Monthly Income After Tax",
                `${state.income.currency} ${state.income.monthlyNet?.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChartPieIcon />,
                "Savings (Monthly)",
                `${state.income.currency} ${state.income.monthlySavings?.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChevronUpIcon />,
                "Recurring Expenses (Monthly)",
                `${state.income.currency} ${recurringExpensesMonthly.toLocaleString()}`,
                "text-red-500"
              )}
              {renderRow(
                <ChevronUpIcon />,
                "Remaining Monthly Income",
                `${state.income.currency} ${remainingMonthlyIncome.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChartPieIcon />,
                "Remaining Monthly Income After Savings",
                `${state.income.currency} ${remainingMonthlyAfterSavings.toLocaleString() || "0"}`
              )}
            </div>
          </div>

          {/* Yearly Breakdown */}
          <div>
            <h3 className="text-lg font-medium mb-4">Yearly Breakdown</h3>
            <div className="space-y-4">
              {renderRow(
                <CurrencyDollarIcon />,
                "Gross Yearly Income",
                `${state.income.currency} ${state.income.yearlyGross?.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChevronDownIcon />,
                "Yearly Income After Tax",
                `${state.income.currency} ${state.income.yearlyNet?.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChartPieIcon />,
                "Savings (Yearly)",
                `${state.income.currency} ${state.income.yearlySavings?.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChevronUpIcon />,
                "Recurring Expenses (Yearly)",
                `${state.income.currency} ${recurringExpensesYearly.toLocaleString()}`,
                "text-red-500"
              )}
              {renderRow(
                <ChevronUpIcon />,
                "Remaining Yearly Income",
                `${state.income.currency} ${remainingYearlyIncome.toLocaleString() || "0"}`
              )}
              {renderRow(
                <ChartPieIcon />,
                "Remaining Yearly Income After Savings",
                `${state.income.currency} ${remainingYearlyAfterSavings.toLocaleString() || "0"}`
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary p-3 mt-4"
          >
            Edit Income Settings
          </button>
        </div>
      </div>
    </div>
  );
}
