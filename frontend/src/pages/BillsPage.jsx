import React, { useState } from 'react';
import { useBills } from '../hooks/useBills';
import { Wifi, Smartphone, Film, Zap, Droplet, Flame, FileText, Plus, X, Trash2, Edit2, Calendar, RefreshCw, Power } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  mobile: Smartphone,
  broadband: Wifi,
  ott: Film,
  electricity: Zap,
  water: Droplet,
  gas: Flame,
  utility: FileText,
};

const CATEGORY_COLORS = {
  mobile: '#3b82f6',
  broadband: '#06b6d4',
  ott: '#ec4899',
  electricity: '#f59e0b',
  water: '#3b82f6',
  gas: '#ef4444',
  utility: '#8b5cf6',
};

export default function BillsPage() {
  const { bills, summary, isLoading, addBill, updateBill, deleteBill } = useBills();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const filteredBills = selectedCategory === 'all'
    ? bills
    : bills.filter(b => b.categoryType === selectedCategory);

  const handleOpenModal = (bill = null) => {
    setEditingBill(bill);
    if (bill) {
      setValue('title', bill.title);
      setValue('categoryType', bill.categoryType);
      setValue('provider', bill.provider || '');
      setValue('amount', bill.amount);
      setValue('isAutoRecurring', bill.isAutoRecurring);
      setValue('frequency', bill.frequency);
      setValue('dueDay', bill.dueDay);
      setValue('paymentMode', bill.paymentMode || 'upi');
      setValue('notes', bill.notes || '');
    } else {
      reset({
        title: '',
        categoryType: 'broadband',
        provider: '',
        amount: '',
        isAutoRecurring: true,
        frequency: 'monthly',
        dueDay: 5,
        paymentMode: 'upi',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingBill) {
      updateBill(
        { id: editingBill.id, ...data },
        {
          onSuccess: () => {
            toast.success('Bill / Subscription updated!');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Failed to update entry'),
        }
      );
    } else {
      addBill(data, {
        onSuccess: () => {
          toast.success('New Bill / Subscription added!');
          setIsModalOpen(false);
        },
        onError: () => toast.error('Failed to add entry'),
      });
    }
  };

  const handleToggleStatus = (bill) => {
    const newStatus = bill.status === 'active' ? 'paused' : 'active';
    updateBill(
      { id: bill.id, status: newStatus },
      {
        onSuccess: () => toast.success(`Bill subscription ${newStatus}`),
      }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bill subscription?')) {
      deleteBill(id, {
        onSuccess: () => toast.success('Deleted successfully'),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <RefreshCw className="text-secondary animate-spin-slow" /> Bills & Subscriptions Manager
          </h1>
          <p className="text-text-secondary text-sm">
            Automated monthly tracking for Mobile Recharge, Broadband, OTT (Netflix/Spotify), Electricity, Water, and Gas bills.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 font-medium text-sm"
        >
          <Plus size={18} /> Add Bill / Subscription
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Total Monthly Bill Obligations</div>
          <div className="text-3xl font-bold text-secondary mt-2">
            ₹{summary.totalMonthlyBills.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-text-muted mt-1">Auto-factored every month unless edited</div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Active Subscriptions & Bills</div>
          <div className="text-3xl font-bold text-text-primary mt-2">
            {summary.totalActiveBills}
          </div>
          <div className="text-xs text-text-muted mt-1">Mobile, Wi-Fi, OTT & Utilities</div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Auto-Monthly Adjustment</div>
          <div className="text-3xl font-bold text-success mt-2 flex items-center gap-2">
            <RefreshCw size={24} /> Enabled
          </div>
          <div className="text-xs text-text-muted mt-1">Adjusted automatically on plan due date</div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-glass-border">
        {[
          { id: 'all', label: 'All Bills', icon: FileText },
          { id: 'mobile', label: 'Mobile Recharge', icon: Smartphone },
          { id: 'broadband', label: 'Broadband', icon: Wifi },
          { id: 'ott', label: 'OTT & Streaming', icon: Film },
          { id: 'electricity', label: 'Electricity', icon: Zap },
          { id: 'water', label: 'Water', icon: Droplet },
          { id: 'gas', label: 'Gas', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                  : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-48 rounded-xl shimmer"></div>
          ))}
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl border border-glass-border">
          <RefreshCw size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text-primary">No bills found for selected category</h3>
          <p className="text-text-secondary text-sm mt-1 mb-6">
            Add your Jio mobile plan, Airtel broadband, Netflix subscription, or Electricity bill.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition inline-flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Add Bill / Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => {
            const IconComponent = CATEGORY_ICONS[bill.categoryType] || FileText;
            const badgeColor = CATEGORY_COLORS[bill.categoryType] || '#6366f1';
            const isPaused = bill.status === 'paused';

            return (
              <div
                key={bill.id}
                className={`glass-card p-6 rounded-xl border border-glass-border relative transition ${
                  isPaused ? 'opacity-60 bg-white/2' : ''
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-lg border flex items-center justify-center"
                      style={{ backgroundColor: `${badgeColor}15`, borderColor: `${badgeColor}40`, color: badgeColor }}
                    >
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-text-primary line-clamp-1">{bill.title}</h3>
                      <span className="inline-block text-xs text-text-secondary capitalize font-medium">
                        {bill.provider ? `${bill.provider} • ` : ''}{bill.categoryType}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(bill)}
                      className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition"
                      title="Edit bill / subscription"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(bill)}
                      className={`p-1.5 rounded-lg transition ${isPaused ? 'text-text-muted' : 'text-success hover:bg-success/10'}`}
                      title={isPaused ? 'Activate subscription' : 'Pause subscription'}
                    >
                      <Power size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition"
                      title="Delete bill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Amount & Schedule */}
                <div className="my-4">
                  <div className="text-2xl font-bold text-text-primary">
                    ₹{bill.amount.toLocaleString('en-IN')}{' '}
                    <span className="text-xs text-text-muted font-normal">/ {bill.frequency}</span>
                  </div>
                  <div className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                    <Calendar size={14} className="text-secondary" /> Due on day {bill.dueDay} of every month
                  </div>
                </div>

                {/* Auto Adjustment Badge */}
                <div className="pt-3 border-t border-glass-border flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <RefreshCw size={12} /> Auto-adjusted monthly
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-text-muted capitalize">
                    {bill.paymentMode}
                  </span>
                </div>

                {bill.notes && (
                  <p className="text-xs text-text-muted mt-2 line-clamp-1">
                    {bill.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-bg-secondary w-full max-w-md p-6 rounded-xl border border-glass-border shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {editingBill ? 'Edit Bill / Subscription' : 'Add Bill / Subscription'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Title / Service Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jio 5G Recharge, Airtel Broadband, Netflix"
                  {...register('title', { required: true })}
                  className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Category Type
                  </label>
                  <select
                    {...register('categoryType')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                  >
                    <option value="mobile">Mobile Recharge 📱</option>
                    <option value="broadband">Broadband Wi-Fi 📶</option>
                    <option value="ott">OTT / Streaming 🎬</option>
                    <option value="electricity">Electricity Bill ⚡</option>
                    <option value="water">Water Bill 💧</option>
                    <option value="gas">Gas Bill 🛢️</option>
                    <option value="utility">Other Utility 📄</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jio, Airtel, BESCOM"
                    {...register('provider')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="999"
                    {...register('amount', { required: true, min: 1 })}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Due Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="5"
                    {...register('dueDay', { required: true, min: 1, max: 31 })}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Billing Cycle
                  </label>
                  <select
                    {...register('frequency')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Payment Mode
                  </label>
                  <select
                    {...register('paymentMode')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                  >
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="auto_debit">Auto-Debit</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Notes / Plan Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 200Mbps unlimited fiber plan"
                  {...register('notes')}
                  className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-secondary text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 font-medium text-sm"
                >
                  {editingBill ? 'Save Changes' : 'Add Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
