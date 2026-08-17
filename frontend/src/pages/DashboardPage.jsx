import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Percent, AlertTriangle, Lightbulb, ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { useExpenses } from '../hooks/useExpenses';
import { useBudget } from '../hooks/useBudget';
import CashFlowChart from '../components/charts/CashFlowChart';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import ProgressBar from '../components/ui/ProgressBar';
import Spinner from '../components/ui/Spinner';
import { format } from 'date-fns';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function StatCard({ title, value, icon: Icon, trend, color, loading, subtitle }) {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">{title}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-24 shimmer rounded" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      {subtitle && !loading && (
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      )}
      {trend !== undefined && !loading && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { summary, trends, insights, predictions, summaryLoading, trendsLoading, insightsLoading, predictionsLoading } = useAnalytics();
  const { expenses, isLoading: expLoading } = useExpenses({ limit: 5 });
  const { budgets, isLoading: budgetLoading } = useBudget();

  const current = summary?.currentMonth || {};
  const monthlySummary = summary?.monthlySummary || [];
  const categoryBreakdown = summary?.categoryBreakdown || [];
  const dailyTrend = trends?.daily || [];

  const savingsRate = current.income > 0 ? Math.round((current.savings / current.income) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">{format(new Date(), 'MMMM yyyy')} overview</p>
        </div>
      </div>

      {/* Stats row with Income, Regular Expenses, EMI Dues, and Net Savings */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Income" value={fmt(current.income)} icon={TrendingUp} color="#22c55e" loading={summaryLoading} subtitle="Automated & manual" />
        <StatCard title="Regular Expenses" value={fmt(current.expenses)} icon={TrendingDown} color="#ef4444" loading={summaryLoading} subtitle="Category spending" />
        <StatCard title="EMI Dues" value={fmt(current.emiObligation)} icon={CreditCard} color="#f59e0b" loading={summaryLoading} subtitle="Separate loan EMIs" />
        <StatCard title="Net Savings" value={fmt(current.savings)} icon={Wallet} color="#6366f1" loading={summaryLoading} subtitle="After expenses & EMIs" />
        <StatCard title="Savings Rate" value={`${savingsRate}%`} icon={Percent} color="#06b6d4" loading={summaryLoading} subtitle="Target: >20%" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Cash Flow (6 months)</h3>
          {summaryLoading ? <div className="h-56 shimmer rounded-lg" /> : <CashFlowChart data={monthlySummary} />}
        </div>
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Spending by Category</h3>
          {summaryLoading ? <div className="h-56 shimmer rounded-lg" /> : <SpendingPieChart data={categoryBreakdown} />}
        </div>
      </div>

      {/* Trends + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Daily Spending (30 days)</h3>
          {trendsLoading ? <div className="h-44 shimmer rounded-lg" /> : <TrendLineChart data={dailyTrend} />}
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Budget Overview</h3>
            <Link to="/budget" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {budgetLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 shimmer rounded" />)}</div>
          ) : budgets?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No budgets set yet</p>
              <Link to="/budget" className="text-indigo-400 text-sm mt-2 block hover:text-indigo-300">Create budget →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(budgets || []).slice(0, 4).map(b => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{b.category?.name}</span>
                    <span className="text-xs text-slate-400">{fmt(b.spent)} / {fmt(b.amount)}</span>
                  </div>
                  <ProgressBar value={b.spent} max={parseFloat(b.amount)} showLabel={false} height="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights + Predictions + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Insights */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Smart Insights</h3>
            <Link to="/insights" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">All <ArrowRight size={12} /></Link>
          </div>
          {insightsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded" />)}</div>
          ) : insights.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">Upload expenses to get insights</div>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">{insight.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Prediction */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Next Month Prediction</h3>
          {predictionsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 shimmer rounded" />)}</div>
          ) : predictions?.next_month ? (
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-slate-400 mb-1">Predicted Savings</div>
                <div className="text-2xl font-bold text-emerald-400">{fmt(predictions.next_month.predicted_savings)}</div>
                <div className={`text-xs mt-1 ${predictions.trend === 'improving' ? 'text-emerald-400' : predictions.trend === 'declining' ? 'text-red-400' : 'text-slate-400'}`}>
                  {predictions.trend === 'improving' ? '↑ Improving trend' : predictions.trend === 'declining' ? '↓ Declining trend' : '→ Stable trend'}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Income', value: predictions.next_month.predicted_income, color: 'text-emerald-400' },
                  { label: 'Expenses', value: predictions.next_month.predicted_expenses, color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-medium ${color}`}>{fmt(value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Confidence</span>
                  <span>{Math.round((predictions.confidence || 0) * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">Add more data for predictions</div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Expenses</h3>
            <Link to="/expenses" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">All <ArrowRight size={12} /></Link>
          </div>
          {expLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 shimmer rounded" />)}</div>
          ) : (expenses?.expenses || []).length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              <p>No expenses yet</p>
              <Link to="/upload" className="text-indigo-400 text-sm mt-2 block hover:text-indigo-300">Upload statement →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(expenses?.expenses || []).slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{e.merchant}</div>
                    <div className="text-xs text-slate-500">{e.category?.name}</div>
                  </div>
                  <div className={`text-sm font-medium ml-4 ${parseFloat(e.amount) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {parseFloat(e.amount) > 0 ? '+' : ''}{fmt(Math.abs(e.amount))}
                    {e.isAnomalous && <AlertTriangle size={10} className="text-amber-400 inline ml-1" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
