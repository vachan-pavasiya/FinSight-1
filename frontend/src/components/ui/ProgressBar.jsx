export default function ProgressBar({ value = 0, max = 100, color = 'primary', showLabel = true, height = 'sm', animate = true }) {
  const pct = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  const colors = {
    primary: 'from-indigo-500 to-cyan-500',
    success: 'from-emerald-500 to-teal-500',
    danger: 'from-red-500 to-orange-500',
    warning: 'from-amber-500 to-yellow-500',
  };

  const heights = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const resolvedColor = isOver ? colors.danger : colors[color] || colors.primary;

  return (
    <div className="w-full">
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`h-full bg-gradient-to-r ${resolvedColor} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
            {isOver ? 'Over budget!' : `${pct.toFixed(0)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
