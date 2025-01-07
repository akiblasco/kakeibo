-- Create income table
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL NOT NULL,
  income_type VARCHAR NOT NULL,
  currency VARCHAR NOT NULL,
  tax_rate DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create Row Level Security (RLS) policies
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own income"
ON income FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own expenses"
ON expenses FOR ALL USING (auth.uid() = user_id);

-- Modify income table to include all fields
ALTER TABLE income ADD COLUMN IF NOT EXISTS income_type VARCHAR;
ALTER TABLE income ADD COLUMN IF NOT EXISTS monthly_gross DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS yearly_gross DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS monthly_tax DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS yearly_tax DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS monthly_net DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS yearly_net DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS monthly_spendable DECIMAL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS yearly_spendable DECIMAL; 