import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKakeibo } from '../context/KakeiboContext';
import { EXPENSE_CATEGORIES } from '../constants/categories';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const backgrounds = {
  currency: `linear-gradient(135deg, ${EXPENSE_CATEGORIES.wants.startColor}, ${EXPENSE_CATEGORIES.wants.endColor})`,
  income: `linear-gradient(135deg, ${EXPENSE_CATEGORIES.leisure.startColor}, ${EXPENSE_CATEGORIES.leisure.endColor})`,
  tax: `linear-gradient(135deg, ${EXPENSE_CATEGORIES.subscriptions.startColor}, ${EXPENSE_CATEGORIES.subscriptions.endColor})`,
  savings: `linear-gradient(135deg, ${EXPENSE_CATEGORIES["daily needs"].startColor}, ${EXPENSE_CATEGORIES["daily needs"].endColor})`
};

export function WelcomeFlow({ onComplete }) {
  const { saveIncome } = useKakeibo();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState({
    currency: 'USD',
    yearlyIncome: '',
    taxRate: '',
    savingsGoal: ''
  });

  const handleNext = () => {
    if (step < 3) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const yearlyGross = parseFloat(formData.yearlyIncome);
      const monthlyGross = yearlyGross / 12;
      const taxRate = parseFloat(formData.taxRate) / 100;
      const savingsRate = parseFloat(formData.savingsGoal) / 100;
      
      const monthlyTax = monthlyGross * taxRate;
      const yearlyTax = monthlyTax * 12;
      const monthlyNet = monthlyGross - monthlyTax;
      const yearlyNet = monthlyNet * 12;
      const monthlySavings = monthlyNet * savingsRate;
      const yearlySavings = monthlySavings * 12;
      const monthlySpendable = monthlyNet - monthlySavings;
      const yearlySpendable = monthlySpendable * 12;

      const incomeData = {
        amount: yearlyGross,
        income_type: 'salary',
        currency: formData.currency,
        tax_rate: taxRate,
        savings_percentage: savingsRate,
        monthly_gross: monthlyGross,
        yearly_gross: yearlyGross,
        monthly_tax: monthlyTax,
        yearly_tax: yearlyTax,
        monthly_net: monthlyNet,
        yearly_net: yearlyNet,
        monthly_savings: monthlySavings,
        yearly_savings: yearlySavings,
        monthly_spendable: monthlySpendable,
        yearly_spendable: yearlySpendable
      };

      await saveIncome(incomeData);
      onComplete();
    } catch (error) {
      console.error('Error saving initial setup:', error);
      alert('Failed to save your settings. Please try again.');
    }
  };

  const questions = [
    {
      key: 'currency',
      title: 'What currency do you use?',
      subtitle: 'Select your preferred currency for tracking expenses',
      background: backgrounds.currency,
      component: (
        <select
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          className="w-full p-4 bg-white/20 backdrop-blur-md rounded-lg text-white placeholder-white/70 border-2 border-white/30 focus:border-white/50 outline-none"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          {/* Add more currencies as needed */}
        </select>
      )
    },
    {
      key: 'yearlyIncome',
      title: 'What is your yearly income?',
      subtitle: 'Enter your gross yearly income before taxes',
      background: backgrounds.income,
      component: (
        <input
          type="number"
          value={formData.yearlyIncome}
          onChange={(e) => setFormData({ ...formData, yearlyIncome: e.target.value })}
          placeholder="Enter amount"
          className="w-full p-4 bg-white/20 backdrop-blur-md rounded-lg text-white placeholder-white/70 border-2 border-white/30 focus:border-white/50 outline-none"
        />
      )
    },
    {
      key: 'taxRate',
      title: 'What is your tax rate?',
      subtitle: 'Enter your estimated tax rate as a percentage',
      background: backgrounds.tax,
      component: (
        <div className="relative w-full">
          <input
            type="number"
            value={formData.taxRate}
            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
            placeholder="Enter percentage"
            min="0"
            max="100"
            className="w-full p-4 bg-white/20 backdrop-blur-md rounded-lg text-white placeholder-white/70 border-2 border-white/30 focus:border-white/50 outline-none"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">%</span>
        </div>
      )
    },
    {
      key: 'savingsGoal',
      title: 'What is your savings goal?',
      subtitle: 'What percentage of your income would you like to save?',
      background: backgrounds.savings,
      component: (
        <div className="relative w-full">
          <input
            type="number"
            value={formData.savingsGoal}
            onChange={(e) => setFormData({ ...formData, savingsGoal: e.target.value })}
            placeholder="Enter percentage"
            min="0"
            max="100"
            className="w-full p-4 bg-white/20 backdrop-blur-md rounded-lg text-white placeholder-white/70 border-2 border-white/30 focus:border-white/50 outline-none"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">%</span>
        </div>
      )
    }
  ];

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full max-w-lg mx-4"
          style={{ position: 'absolute' }}
        >
          <div
            className="w-full p-8 rounded-2xl shadow-2xl"
            style={{
              background: currentQuestion.background,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {currentQuestion.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 mb-8"
            >
              {currentQuestion.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {currentQuestion.component}

              <div className="flex justify-between pt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className={`px-6 py-2 rounded-lg text-white border-2 border-white/30 hover:border-white/50 ${
                    step === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={step === 0}
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90"
                  disabled={!formData[currentQuestion.key]}
                >
                  {step === questions.length - 1 ? 'Complete' : 'Next'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 