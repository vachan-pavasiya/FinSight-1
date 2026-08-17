import React, { useState, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { expensesAPI } from '../api/expenses';
import { TriangleAlert, Plus, X, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const { expenses, total, page, pages, isLoading, setFilters, filters, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories for modal & filter
  useEffect(() => {
    expensesAPI.getCategories()
      .then(res => setCategories(res.data.data || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Filters state
  const [localFilters, setLocalFilters] = useState({
    category: '', merchant: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '', paymentMode: ''
  });

  const handleApplyFilters = () => {
    setFilters({ ...filters, ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const emptyFilters = { category: '', merchant: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '', paymentMode: '' };
    setLocalFilters(emptyFilters);
    setFilters({ page: 1, limit: 20 });
  };

  const handleOpenModal = (expense = null) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id, {
        onSuccess: () => toast.success('Expense deleted'),
        onError: () => toast.error('Failed to delete expense')
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Expense Tracker</h1>
          <p className="text-text-secondary text-sm">View, filter, edit, or add manual expense transactions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium shadow-lg shadow-primary/20"
        >
          <Plus size={18} className="mr-2" /> Add Expense
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-xl space-y-4 border border-glass-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search merchant..."
            value={localFilters.merchant}
            onChange={(e) => setLocalFilters({ ...localFilters, merchant: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          <select
            value={localFilters.category}
            onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="date"
            value={localFilters.dateTo}
            onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          <select
            value={localFilters.paymentMode}
            onChange={(e) => setLocalFilters({ ...localFilters, paymentMode: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Payment Modes</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Netbanking</option>
          </select>
          <input
            type="number"
            placeholder="Min Amount"
            value={localFilters.amountMin}
            onChange={(e) => setLocalFilters({ ...localFilters, amountMin: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Max Amount"
            value={localFilters.amountMax}
            onChange={(e) => setLocalFilters({ ...localFilters, amountMax: e.target.value })}
            className="bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          <div className="flex space-x-2 md:col-span-1">
            <button onClick={handleApplyFilters} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition flex-1 text-sm font-medium">Apply</button>
            <button onClick={handleClearFilters} className="px-4 py-2 bg-white/10 text-text-secondary rounded-lg hover:bg-white/20 transition flex-1 text-sm">Clear</button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-xl overflow-hidden border border-glass-border">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="shimmer h-12 rounded w-full"></div>)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="text-xs uppercase bg-white/5 text-text-muted border-b border-glass-border">
                  <tr>
                    <th className="px-6 py-3.5">Merchant</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Payment Mode</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {expenses.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-text-muted">No expenses found matching filters</td></tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4 font-medium text-text-primary flex items-center">
                          {expense.merchant}
                          {expense.isAnomalous && <TriangleAlert size={16} className="text-warning ml-2" title="Flagged as anomalous" />}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: expense.category?.color || '#64748b' }}>
                            {expense.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-bold ${expense.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                          ₹{Math.abs(expense.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 capitalize">{expense.paymentMode}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(expense)}
                              className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition"
                              title="Edit expense"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition"
                              title="Delete expense"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-glass-border">
                <span className="text-xs text-text-muted">Showing page {page} of {pages} ({total} total)</span>
                <div className="flex space-x-2">
                  <button disabled={page === 1} onClick={() => setFilters({ ...filters, page: page - 1 })} className="p-2 rounded-lg bg-white/5 text-text-primary disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <button disabled={page === pages} onClick={() => setFilters({ ...filters, page: page + 1 })} className="p-2 rounded-lg bg-white/5 text-text-primary disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (editingExpense) {
              updateExpense({ id: editingExpense.id, ...data }, {
                onSuccess: () => {
                  toast.success('Expense updated');
                  setIsModalOpen(false);
                },
                onError: () => toast.error('Failed to update expense')
              });
            } else {
              addExpense(data, {
                onSuccess: () => {
                  toast.success('Expense added');
                  setIsModalOpen(false);
                },
                onError: () => toast.error('Failed to add expense')
              });
            }
          }}
        />
      )}
    </div>
  );
}

function ExpenseModal({ expense, categories, onClose, onSave }) {
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (expense) {
      setValue('merchant', expense.merchant);
      setValue('amount', Math.abs(expense.amount));
      setValue('categoryId', expense.categoryId || '');
      setValue('date', expense.date ? new Date(expense.date).toISOString().split('T')[0] : '');
      setValue('paymentMode', expense.paymentMode || 'card');
      setValue('description', expense.description || '');
    } else {
      setValue('date', new Date().toISOString().split('T')[0]);
      setValue('paymentMode', 'card');
    }
  }, [expense, setValue]);

  const onSubmit = (data) => {
    // Format amount as negative for expenses
    const formattedData = {
      ...data,
      amount: -Math.abs(parseFloat(data.amount)),
    };
    onSave(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="glass-card bg-bg-secondary w-full max-w-md p-6 rounded-xl border border-glass-border shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={20} /></button>
        <h2 className="text-xl font-bold mb-6 text-text-primary">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Merchant / Vendor *</label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Amazon, Uber"
              {...register('merchant', { required: true })}
              className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Category</label>
            <select
              {...register('categoryId')}
              className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="450"
                {...register('amount', { required: true, min: 0.01 })}
                className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Date *</label>
              <input
                type="date"
                {...register('date', { required: true })}
                className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Payment Mode</label>
            <select
              {...register('paymentMode')}
              className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="card">Credit / Debit Card</option>
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="cash">Cash</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Description (Optional)</label>
            <textarea
              rows="2"
              placeholder="Notes..."
              {...register('description')}
              className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 font-medium">
              {expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
