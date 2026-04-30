interface DonutChartProps {
  value: number; // 0-100
  label: string;
  color: string;
  size?: number;
}

export const DonutChart = ({ value, label, color, size = 200 }: DonutChartProps) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(clampedValue / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200">
          {/* Background circle */}
          <circle cx="100" cy="100" r="45" fill="none" stroke="#e5e7eb" strokeWidth="20" />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-500 ease-in-out"
          />
          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-3xl font-bold"
            fill="#111827"
          >
            {Math.round(clampedValue)}%
          </text>
          <text
            x="100"
            y="120"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-sm"
            fill="#6b7280"
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
};
