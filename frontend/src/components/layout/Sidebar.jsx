import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, Wallet, CreditCard, RefreshCw, Upload, Target, Trophy, Sparkles, FileText, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Income", icon: Wallet, path: "/income" },
    { name: "Expenses", icon: Receipt, path: "/expenses" },
    { name: "Bills & Subscriptions", icon: RefreshCw, path: "/bills" },
    { name: "Loans & EMIs", icon: CreditCard, path: "/loans" },
    { name: "Upload", icon: Upload, path: "/upload" },
    { name: "Budget", icon: Target, path: "/budget" },
    { name: "Goals", icon: Trophy, path: "/goals" },
    { name: "Insights", icon: Sparkles, path: "/insights" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Notifications", icon: Bell, path: "/notifications" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="w-64 glass-card m-4 hidden md:flex flex-col border border-glass-border rounded-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold gradient-text">FinSight</h2>
      </div>
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/20 text-text-primary border border-primary/30 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <link.icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-glass-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-danger hover:bg-danger/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
