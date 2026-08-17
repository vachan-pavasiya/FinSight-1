import os

base_dir = r'c:\Users\acer\OneDrive\Desktop\FinSight(1)\frontend'
src_dir = os.path.join(base_dir, 'src')

folders = [
    'components/layout', 'components/ui', 'components/charts', 'components/features', 
    'pages/auth', 'pages/admin', 'pages', 'api', 'context', 'hooks'
]

for folder in folders:
    os.makedirs(os.path.join(src_dir, folder), exist_ok=True)

files = {
    'src/components/layout/Sidebar.jsx': '''import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Receipt, Upload, Target, Trophy, Sparkles, FileText, Bell, Shield, User, LogOut } from "lucide-react";

const Sidebar = () => {
  const links = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Expenses", icon: Receipt, path: "/expenses" },
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
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
          >
            <link.icon size={20} />
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-glass-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-danger hover:bg-danger/10 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
''',
    'src/components/layout/Header.jsx': '''import React from "react";
import { Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 glass-card m-4 ml-0 rounded-xl">
      <h1 className="text-xl font-semibold">Overview</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-glass-border cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-text-muted">Pro Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
''',
    'src/components/layout/Layout.jsx': '''import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
''',
}

for path, content in files.items():
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

print("Layout files created.")
