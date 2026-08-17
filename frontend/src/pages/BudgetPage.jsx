import React, { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Plus, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function BudgetPage() {
  const { budgets, isLoading, addBudget, deleteBudget } = useBudget();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">Budget Planner — {currentMonth}</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
          <Plus size={18} className="mr-2" /> Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Budgeted</h3>
          <p className="text-3xl font-bold text-white">₹{totalBudgeted.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Spent</h3>
          <p className="text-3xl font-bold text-white">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Overall Usage</h3>
          <div className="flex items-end space-x-2">
            <p className="text-3xl font-bold text-white">{overallPercentage.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
            <div className={`h-full ${overallPercentage > 100 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${Math.min(overallPercentage, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-40 rounded-xl shimmer"></div>)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl">
          <h2 className="text-xl text-white font-medium mb-2">Set your first budget</h2>
          <p className="text-gray-400 mb-4">Start tracking your spending limits to save more.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">Create Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => {
            const isOver = budget.spent > budget.amount;
            const pct = Math.min((budget.spent / budget.amount) * 100, 100);
            return (
              <div key={budget.id} className="glass-card p-5 rounded-xl relative group">
                <button onClick={() => deleteBudget(budget.id)} className="absolute top-4 right-4 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                <div className="flex items-center mb-4">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: budget.category?.color || '#6366f1' }}></span>
                  <h3 className="font-semibold text-white">{budget.category?.name || 'Category'}</h3>
                </div>
                
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Spent: ₹{budget.spent.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400">of ₹{budget.amount.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="w-full bg-gray-700 h-2 rounded-full mb-3 overflow-hidden">
                  <div className={`h-full ${isOver ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${pct}%` }}></div>
                </div>
                
                <div className="text-sm">
                  {isOver ? (
                    <span className="text-danger">Over budget by ₹{(budget.spent - budget.amount).toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="text-success">₹{(budget.amount - budget.spent).toLocaleString('en-IN')} left</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && <AddBudgetModal onClose={() => setIsModalOpen(false)} onAdd={addBudget} />}
    </div>
  );
}

function AddBudgetModal({ onClose, onAdd }) {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    onAdd(data, {
      onSuccess: () => { toast.success("Budget added"); onClose(); },
      onError: () => toast.error("Error adding budget")
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass-card w-full max-w-md p-6 rounded-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-xl font-bold mb-4 text-white">Add Budget</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Category ID (temp)</label>
            <input {...register('categoryId', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" placeholder="Category ID" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Amount</label>
            <input type="number" {...register('amount', { required: true, valueAsNumber: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition">Save Budget</button>
        </form>
      </div>
    </div>
  );
}
