import React, { useState } from 'react';
import { useLoans } from '../hooks/useLoans';
import { CreditCard, Home, Car, Smartphone, Laptop, DollarSign, Plus, X, Trash2, CheckCircle2, Calendar, Percent, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const LOAN_ICONS = {
  home: Home,
  car: Car,
  mobile: Smartphone,
  electronics: Laptop,
  personal: CreditCard,
  education: DollarSign,
};

export default function LoansPage() {
  const { loans, summary, isLoading, addLoan, updateLoan, payEmi, deleteLoan, isPayingEmi } = useLoans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const handleOpenModal = (loan = null) => {
    setEditingLoan(loan);
    if (loan) {
      setValue('title', loan.title);
      setValue('loanType', loan.loanType);
      setValue('principalAmount', loan.principalAmount);
      setValue('emiAmount', loan.emiAmount);
      setValue('interestRate', loan.interestRate);
      setValue('tenureMonths', loan.tenureMonths);
      setValue('emisPaid', loan.emisPaid);
      setValue('dueDate', loan.dueDate);
    } else {
      reset({
        title: '',
        loanType: 'home',
        principalAmount: '',
        emiAmount: '',
        interestRate: 0,
        tenureMonths: 12,
        emisPaid: 0,
        dueDate: 10,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingLoan) {
      updateLoan(
        { id: editingLoan.id, ...data },
        {
          onSuccess: () => {
            toast.success('Loan / EMI details updated!');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Failed to update loan details'),
        }
      );
    } else {
      addLoan(data, {
        onSuccess: () => {
          toast.success('New Loan / EMI added!');
          setIsModalOpen(false);
        },
        onError: () => toast.error('Failed to add loan'),
      });
    }
  };

  const handlePayEmi = (loan) => {
    payEmi(loan.id, {
      onSuccess: (res) => {
        toast.success(res.data?.message || 'EMI installment marked as paid!');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Failed to record EMI payment');
      },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this loan entry?')) {
      deleteLoan(id, {
        onSuccess: () => toast.success('Loan deleted'),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <CreditCard className="text-primary" /> Loans & EMI Tracker
          </h1>
          <p className="text-text-secondary text-sm">
            Track EMIs for Home, Car, Mobile Phone, and Loans distinctly separated from regular category expenses.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 font-medium"
        >
          <Plus size={18} /> Add Loan / EMI
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Total Monthly EMI Obligations</div>
          <div className="text-3xl font-bold text-warning mt-2">
            ₹{summary.totalEmiObligation.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-text-muted mt-1">Deducted monthly from net disposable income</div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Active Loans & EMIs</div>
          <div className="text-3xl font-bold text-text-primary mt-2">
            {summary.totalActiveLoans}
          </div>
          <div className="text-xs text-text-muted mt-1">Ongoing active loan accounts</div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-glass-border">
          <div className="text-text-secondary text-sm">Total Principal Remaining</div>
          <div className="text-3xl font-bold text-secondary mt-2">
            ₹{summary.totalPrincipalRemaining.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-text-muted mt-1">Total outstanding debt balance</div>
        </div>
      </div>

      {/* Loans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-64 rounded-xl shimmer"></div>
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl border border-glass-border">
          <CreditCard size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text-primary">No loans or EMIs recorded</h3>
          <p className="text-text-secondary text-sm mt-1 mb-6">
            Add your Home loan, Car loan, or Phone EMI to track installment progress without diluting daily expenses.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition inline-flex items-center gap-2"
          >
            <Plus size={18} /> Add Your First Loan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => {
            const IconComponent = LOAN_ICONS[loan.loanType] || CreditCard;
            const isClosed = loan.status === 'closed' || loan.emisPaid >= loan.tenureMonths;

            return (
              <div
                key={loan.id}
                className={`glass-card p-6 rounded-xl border border-glass-border relative transition ${
                  isClosed ? 'bg-success/5 border-success/30' : ''
                }`}
              >
                {/* Top Badge & Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-text-primary line-clamp-1">{loan.title}</h3>
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-white/5 text-text-secondary rounded-full uppercase">
                        {loan.loanType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(loan)}
                      className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition"
                      title="Edit loan details"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition"
                      title="Delete loan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Amount & EMI Info */}
                <div className="my-4 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-text-secondary text-xs">Monthly EMI</span>
                    <span className="text-xl font-bold text-warning">
                      ₹{loan.emiAmount.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-text-muted">Total Loan: ₹{loan.principalAmount.toLocaleString('en-IN')}</span>
                    <span className="text-text-muted">{loan.interestRate > 0 ? `${loan.interestRate}% p.a.` : '0% Interest'}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-secondary">
                      {loan.emisPaid} of {loan.tenureMonths} EMIs Paid
                    </span>
                    <span className="text-primary font-bold">{loan.progressPct}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-glass-border">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isClosed ? 'bg-success' : 'bg-gradient-to-r from-primary to-secondary'
                      }`}
                      style={{ width: `${loan.progressPct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted pt-1">
                    <span>Due: Day {loan.dueDate}</span>
                    <span>Bal: ₹{loan.remainingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Pay EMI Action Button */}
                <div className="pt-3 border-t border-glass-border flex justify-between items-center">
                  {isClosed ? (
                    <div className="flex items-center gap-2 text-success text-xs font-semibold">
                      <CheckCircle2 size={16} /> Fully Paid & Closed
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePayEmi(loan)}
                      disabled={isPayingEmi}
                      className="w-full py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-white transition font-medium text-xs flex items-center justify-center gap-2"
                    >
                      <CreditCard size={14} /> Pay This Month's EMI
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-bg-secondary w-full max-w-lg p-6 rounded-xl border border-glass-border shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {editingLoan ? 'Edit Loan / EMI' : 'Add New Loan / EMI'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Loan / Purchase Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Home Loan, iPhone 15 Pro EMI"
                  {...register('title', { required: true })}
                  className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Loan Type
                  </label>
                  <select
                    {...register('loanType')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="home">Home Loan 🏠</option>
                    <option value="car">Car / Vehicle Loan 🚗</option>
                    <option value="mobile">Mobile Phone EMI 📱</option>
                    <option value="electronics">Electronics EMI 💻</option>
                    <option value="personal">Personal Loan 💳</option>
                    <option value="education">Education Loan 🎓</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Total Principal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="1200000"
                    {...register('principalAmount', { required: true, min: 1 })}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Monthly EMI Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="18500"
                    {...register('emiAmount', { required: true, min: 1 })}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="8.5"
                    {...register('interestRate')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Tenure (Months) *
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    {...register('tenureMonths', { required: true, min: 1 })}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    EMIs Paid So Far
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="12"
                    {...register('emisPaid')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="10"
                    {...register('dueDate')}
                    className="w-full bg-bg-card border border-glass-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
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
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 font-medium"
                >
                  {editingLoan ? 'Save Changes' : 'Add Loan Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
