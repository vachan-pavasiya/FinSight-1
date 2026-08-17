import { motion } from 'framer-motion';

export default function Card({ children, title, subtitle, className = '', animate = true, ...props }) {
  const Tag = animate ? motion.div : 'div';
  const animProps = animate ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } } : {};

  return (
    <Tag
      className={`glass-card p-6 ${className}`}
      {...animProps}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </Tag>
  );
}
