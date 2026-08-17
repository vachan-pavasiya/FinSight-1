import React, { useState } from 'react';
import { useIncome } from '../hooks/useIncome';
import { Wallet, Plus, X, Trash2, Calendar, CheckCircle2, Clock, Power, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function IncomePage() {
  const { incomes, totalMonthlyIncome, isLoading, addIncome, updateIncome, deleteIncome } = useIncome();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const handleOpenModal = (income = null) => {
    setEditingIncome(income);
    if (income) {
      setValue('source', income.source);
      setValue('amount', income.amount);
      setValue('frequency', income.frequency);
      setValue('payoutDay', income.payoutDay);
      setValue('description', income.description || '');
    } else {
      reset({ source: '', amount: '', frequency: 'monthly', payoutDay: 1, description: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingIncome) {
      updateIncome(
        { id: editingIncome.id, ...data },
        {
          onSuccess: () => {
            toast.success('Income source updated!');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Failed to update income source'),
        }
      );
    } else {
      addIncome(data, {
        onSuccess: () => {
          toast.success('Recurring income added!');
          setIsModalOpen(false);
        },
        onError: () => toast.error('Failed to add income source'),
      });
    }
  };

  const handleToggleActive = (income) => {
    updateIncome(
      { id: income.id, isActive: !income.isActive },
      {
        onSuccess: () => toast.success(income.isActive ? 'Income source paused' : 'Income source activated'),
      }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      deleteIncome(id, {
        onSuccess: () => toast.success('Income source deleted'),
      });
    }
  };

  const activeCount = incomes.filter(i => i.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Wallet className="text-success" /> Recurring Income Manager
          </h1>
          <p className="text-text-secondary text-sm">
            Configure automated monthly income sources (Salary, Freelance, Rent) — no manual entry required each month.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition shadow-lg shadow-success/20 font-medium"
        >
          <Plus size={18} /> Add Income Source
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Total Monthly Income</div>
          <div className="text-3xl font-bold text-success mt-2">
            ₹{totalMonthlyIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-text-muted mt-1">Auto-credited every month</div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Active Income Sources</div>
          <div className="text-3xl font-bold text-text-primary mt-2">
            {activeCount} <span className="text-sm font-normal text-text-secondary">/ {incomes.length} total</span>
          </div>
          <div className="text-xs text-text-muted mt-1">Active recurring streams</div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Primary Payout Day</div>
          <div className="text-3xl font-bold text-secondary mt-2">
            {incomes.length > 0 ? `Day ${incomes[0].payoutDay}` : 'N/A'}
          </div>
          <div className="text-xs text-text-muted mt-1">Monthly credit schedule</div>
        </div>
      </div>

      {/* Income List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-48 rounded-xl shimmer"></div>
          ))}
        </div>
      ) : incomes.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl border border-glass-border">
          <Wallet size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text-primary">No recurring income sources configured</h3>
          <p className="text-text-secondary text-sm mt-1 mb-6">
            Add your monthly salary or rental income to automate monthly financial projections.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition inline-flex items-center gap-2"
          >
            <Plus size={18} /> Setup First Income Source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incomes.map((income) => (
            <div
              key={income.id}
              className={`glass-card p-6 rounded-xl border border-glass-border relative transition ${
                !income.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-text-primary">{income.source}</h3>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success rounded-full mt-1 border border-success/20">
                    {income.frequency.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(income)}
                    className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition"
                    title="Edit income"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(income)}
                    title={income.isActive ? 'Pause income' : 'Activate income'}
                    className={`p-1.5 rounded-lg transition ${
                      income.isActive ? 'text-success hover:bg-success/10' : 'text-text-muted hover:bg-white/10'
                    }`}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition"
                    title="Delete income"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="my-4">
                <div className="text-2xl font-bold text-success">
                  ₹{income.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                  <Calendar size={14} className="text-secondary" /> Credited on day {income.payoutDay} of every month
                </div>
              </div>

              {income.description && (
                <p className="text-xs text-text-muted border-t border-glass-border pt-3 mt-2 line-clamp-2">
                  {income.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-bg-secondary w-full max-w-md p-6 rounded-xl border border-glass-border shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {editingIncome ? 'Edit Income Source' : 'Add Recurring Income'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Income Source Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Salary, House Rent"
                  {...register('source', { required: true })}
                  className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-success"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="85000"
                  {...register('amount', { required: true, min: 1 })}
                  className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-success"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Frequency
                  </label>
                  <select
                    {...register('frequency')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-success"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Payout Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    {...register('payoutDay', { required: true, min: 1, max: 31 })}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-success"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Direct bank deposit from employer"
                  {...register('description')}
                  className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-success"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition shadow-lg shadow-success/20 font-medium"
                >
                  {editingIncome ? 'Save Changes' : 'Add Income Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
