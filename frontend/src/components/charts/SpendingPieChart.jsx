import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Entertainment: '#ec4899',
  Bills: '#ef4444',
  Health: '#10b981',
  Education: '#06b6d4',
  Travel: '#f97316',
  Income: '#22c55e',
  Uncategorized: '#94a3b8',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="glass-card px-3 py-2 border border-white/20">
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-sm text-slate-300">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

export default function SpendingPieChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="amount"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
