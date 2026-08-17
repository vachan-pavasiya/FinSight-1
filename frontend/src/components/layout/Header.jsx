import React from "react";
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
