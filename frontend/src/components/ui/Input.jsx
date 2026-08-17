import React, { forwardRef } from "react";

const Input = forwardRef(({ label, error, icon: Icon, className = "", ...props }, ref) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 bg-bg-primary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted transition-colors
            ${Icon ? 'pl-10' : ''} 
            ${error ? 'border-danger focus:ring-danger' : ''} 
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-danger mt-1">{error.message || error}</p>}
    </div>
  );
});
Input.displayName = "Input";
export default Input;
