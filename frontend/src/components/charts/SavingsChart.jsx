import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 border border-white/20">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.dataKey}: ₹{p.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SavingsChart({ data = [], prediction = null }) {
  const chartData = [...data];
  if (prediction) {
    chartData.push({ month: 'Next', savings: prediction.predicted_savings, isPrediction: true });
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
        <Line
          type="monotone"
          dataKey="savings"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
          strokeDasharray={(d) => d.isPrediction ? '8 4' : '0'}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
