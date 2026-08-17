import os

base_dir = r'c:\Users\acer\OneDrive\Desktop\FinSight(1)\frontend'
src_dir = os.path.join(base_dir, 'src')

files = {
    'src/components/charts/CashFlowChart.jsx': '''import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", income: 4000, expenses: 2400 },
  { name: "Feb", income: 3000, expenses: 1398 },
  { name: "Mar", income: 2000, expenses: 9800 },
  { name: "Apr", income: 2780, expenses: 3908 },
  { name: "May", income: 1890, expenses: 4800 },
  { name: "Jun", income: 2390, expenses: 3800 },
];

export default function CashFlowChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
          <XAxis dataKey="name" stroke="#a0aec0" />
          <YAxis stroke="#a0aec0" />
          <Tooltip contentStyle={{ backgroundColor: "#1a202c", borderColor: "#2d3748" }} />
          <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
''',
    'src/pages/DashboardPage.jsx': '''import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import CashFlowChart from '../components/charts/CashFlowChart';
import { ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

const DashboardPage = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Income', value: '₹1,24,500', trend: '+12%', icon: ArrowUpRight, color: 'text-success' },
            { label: 'Total Expenses', value: '₹42,300', trend: '-5%', icon: ArrowDownRight, color: 'text-danger' },
            { label: 'Net Savings', value: '₹82,200', trend: '+8%', icon: ArrowUpRight, color: 'text-success' },
            { label: 'Savings Rate', value: '66%', trend: '+2%', icon: IndianRupee, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary">{stat.label}</h3>
                  <div className="mt-2 text-3xl font-bold">{stat.value}</div>
                </div>
                <div className={p-2 rounded-full bg-white/5 }>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={stat.color}>{stat.trend}</span>
                <span className="text-text-muted ml-2">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Cash Flow</h3>
            <CashFlowChart />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {i}
                    </div>
                    <div>
                      <p className="font-medium">Transaction {i}</p>
                      <p className="text-sm text-text-muted">Today at 10:00 AM</p>
                    </div>
                  </div>
                  <div className="font-semibold text-danger">-₹1,200</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default DashboardPage;
''',
    'src/App.jsx': '''import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";

const queryClient = new QueryClient();

// A simple mock auth wrapper for now to allow viewing the dashboard directly
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: "#16213e",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
          }
        }}/>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
'''
}

for path, content in files.items():
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

print("Generated Dashboard files.")
