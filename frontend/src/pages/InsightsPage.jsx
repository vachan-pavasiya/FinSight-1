import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InsightsPage() {
  const { insights, anomalies, predictions, isLoading } = useAnalytics();
  const [activeTab, setActiveTab] = useState('insights');

  const tabs = [
    { id: 'insights', label: 'Smart Insights' },
    { id: 'anomalies', label: 'Anomaly Detection' },
    { id: 'prediction', label: 'Savings Prediction' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold gradient-text">Insights & Analytics</h1>
        <div className="flex space-x-4 mb-6">
          {[1, 2, 3].map(i => <div key={i} className="shimmer h-10 w-32 rounded-lg"></div>)}
        </div>
        <div className="shimmer h-64 w-full rounded-xl"></div>
      </div>
    );
  }

  // insights, anomalies, predictions already destructured above

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Insights & Analytics</h1>
      
      <div className="flex space-x-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.length === 0 ? (
            <div className="col-span-full text-center p-12 text-gray-500">No insights available at the moment.</div>
          ) : insights.map((insight, i) => (
            <div key={i} className="glass-card p-6 rounded-xl flex items-start space-x-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                {insight.type === 'spending_up' ? <TrendingUp className="text-danger" /> :
                 insight.type === 'spending_down' ? <TrendingDown className="text-success" /> :
                 <Lightbulb className="text-warning" />}
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{insight.title || 'Insight'}</h3>
                <p className="text-sm text-gray-400 mb-2">{insight.message}</p>
                {insight.category && <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded">{insight.category}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="glass-card rounded-xl overflow-hidden">
          {anomalies.length === 0 ? (
            <div className="p-12 text-center text-success flex flex-col items-center">
              <CheckCircle size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No unusual activity detected</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Merchant</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Risk Score</th>
                    <th className="px-6 py-3">Reasons</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((a, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium text-white">{a.merchant}</td>
                      <td className="px-6 py-4 text-danger font-bold">₹{a.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{a.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs text-white ${a.riskScore > 80 ? 'bg-danger' : 'bg-warning'}`}>
                          {a.riskScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {a.reasons?.map((r, ri) => <span key={ri} className="px-2 py-1 bg-gray-700 rounded text-xs">{r}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prediction' && (
        <div className="space-y-6">
          {predictions ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Predicted Savings Next Month</p>
                  <p className="text-3xl font-bold text-primary">₹{predictions.predictedSavings.toLocaleString('en-IN')}</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Expected Income</p>
                  <p className="text-3xl font-bold text-success">₹{predictions.predictedIncome.toLocaleString('en-IN')}</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Expected Expenses</p>
                  <p className="text-3xl font-bold text-danger">₹{predictions.predictedExpenses.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Savings Trend</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    Confidence: <span className="ml-2 px-2 py-1 bg-gray-800 text-white rounded">{predictions.confidence}%</span>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Historical" />
                      <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center text-gray-500 rounded-xl">Not enough data for predictions yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
