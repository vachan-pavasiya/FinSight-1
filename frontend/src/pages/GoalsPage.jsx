import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const { goals, isLoading, addGoal, deleteGoal, updateGoal } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fundingGoal, setFundingGoal] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">Financial Goals</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
          <Plus size={18} className="mr-2" /> New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 rounded-xl shimmer"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(0);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            
            const radius = 50;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            let deadlineText = 'No deadline';
            if (goal.deadline) {
              const days = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              deadlineText = days < 0 ? 'Overdue!' : `${days} days remaining`;
            }

            return (
              <div key={goal.id} className="glass-card p-6 rounded-xl relative">
                {isCompleted && (
                  <div className="absolute inset-0 bg-success/10 rounded-xl flex items-center justify-center backdrop-blur-[1px] z-10">
                    <div className="bg-gray-900 p-3 rounded-full text-success shadow-lg">
                      <CheckCircle2 size={32} />
                    </div>
                  </div>
                )}
                
                <button onClick={() => deleteGoal(goal.id)} className="absolute top-4 right-4 text-gray-500 hover:text-danger z-20"><Trash2 size={16} /></button>
                
                <h3 className="font-semibold text-lg text-white mb-4">{goal.name}</h3>
                
                <div className="flex justify-center mb-6">
                  <svg viewBox="0 0 120 120" className="w-32 h-32">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#6366f1" strokeWidth="8"
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round" transform="rotate(-90 60 60)" className="transition-all duration-700" />
                    <text x="60" y="65" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{pct}%</text>
                  </svg>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-xl font-bold text-white">₹{goal.currentAmount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-400">of ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                  <p className={`text-xs mt-2 ${deadlineText === 'Overdue!' ? 'text-danger' : 'text-secondary'}`}>{deadlineText}</p>
                </div>

                {!isCompleted && (
                  <button onClick={() => setFundingGoal(goal)} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition z-20 relative">
                    Add Funds
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && <AddGoalModal onClose={() => setIsModalOpen(false)} onAdd={addGoal} />}
      {fundingGoal && <AddFundsModal goal={fundingGoal} onClose={() => setFundingGoal(null)} onUpdate={updateGoal} />}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }) {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    onAdd({ ...data, currentAmount: 0 }, { onSuccess: () => { toast.success("Goal added"); onClose(); } });
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass-card w-full max-w-md p-6 rounded-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-xl font-bold mb-4 text-white">New Goal</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm text-gray-300 mb-1">Name</label><input {...register('name', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" /></div>
          <div><label className="block text-sm text-gray-300 mb-1">Target Amount</label><input type="number" {...register('targetAmount', { required: true, valueAsNumber: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" /></div>
          <div><label className="block text-sm text-gray-300 mb-1">Deadline (Optional)</label><input type="date" {...register('deadline')} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" /></div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition">Save Goal</button>
        </form>
      </div>
    </div>
  );
}

function AddFundsModal({ goal, onClose, onUpdate }) {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    onUpdate({ id: goal.id, currentAmount: goal.currentAmount + data.amount }, { onSuccess: () => { toast.success("Funds added"); onClose(); } });
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass-card w-full max-w-sm p-6 rounded-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-xl font-bold mb-4 text-white">Add Funds to {goal.name}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm text-gray-300 mb-1">Amount</label><input type="number" {...register('amount', { required: true, valueAsNumber: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" /></div>
          <button type="submit" className="w-full bg-success text-white py-2 rounded hover:bg-success/90 transition">Add Funds</button>
        </form>
      </div>
    </div>
  );
}
