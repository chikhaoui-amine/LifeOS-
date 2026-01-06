
import React, { useState, useMemo } from 'react';

// --- Shared Helpers ---
const generatePath = (points: {x: number, y: number}[], smooth = true) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      if (smooth) {
        // Control points for smooth cubic bezier
        const midX = (p0.x + p1.x) / 2;
        d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
      } else {
        d += ` L ${p1.x} ${p1.y}`;
      }
  }
  return d;
};

// --- Line Chart ---
interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  goalValue?: number;
  onSelect?: (index: number) => void;
  selectedIndex?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  labels, 
  color = '#6366f1', 
  height = 200,
  goalValue,
  onSelect,
  selectedIndex
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  if (data.length < 2) return null;

  // Dimensions & Padding
  const width = 800; 
  const chartHeight = 300; 
  const paddingLeft = 50; // Space for Y-axis labels
  const paddingRight = 20;
  const paddingBottom = 30; // Space for X-axis labels
  const paddingTop = 20;

  // Range Calculation
  let maxVal = Math.max(...data, goalValue || 0);
  let minVal = Math.min(...data, 0);
  
  // Add breathing room
  if (maxVal === minVal) maxVal += 10;
  const range = maxVal - minVal;

  // Generate Y-Axis Ticks (Dynamic)
  const ticks = useMemo(() => {
    // If range is small integer (e.g. 0-3), show exact integers
    if (range <= 5 && Number.isInteger(minVal) && Number.isInteger(maxVal)) {
       const integerTicks = [];
       for (let i = Math.floor(minVal); i <= Math.ceil(maxVal); i++) {
          integerTicks.push(i);
       }
       return integerTicks;
    }

    const count = 5;
    const step = range / (count - 1);
    return Array.from({ length: count }).map((_, i) => minVal + (step * i));
  }, [minVal, maxVal, range]);

  const getY = (val: number) => {
    // Protect against zero range
    const safeRange = range === 0 ? 1 : range;
    return chartHeight - paddingBottom - ((val - minVal) / safeRange) * (chartHeight - paddingBottom - paddingTop);
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const points = useMemo(() => data.map((val, i) => ({
    x: getX(i),
    y: getY(val),
    val
  })), [data, minVal, range]);

  const pathData = generatePath(points);
  const areaPath = `${pathData} L ${points[points.length-1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;

  const goalY = goalValue !== undefined ? getY(goalValue) : null;

  return (
    <div className="w-full relative" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-Axis Grid & Labels */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line 
              x1={paddingLeft} 
              y1={getY(tick)} 
              x2={width - paddingRight} 
              y2={getY(tick)} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
              className="dark:stroke-gray-800" 
            />
            <text 
              x={paddingLeft - 10} 
              y={getY(tick) + 4} 
              textAnchor="end" 
              className="fill-gray-400 text-[10px] font-medium"
              style={{ fontSize: '10px' }}
            >
              {Number.isInteger(tick) ? tick : tick.toFixed(1).replace(/\.0$/, '')}
            </text>
          </g>
        ))}
        
        {/* Goal Line */}
        {goalY !== null && (
            <g>
                <line 
                    x1={paddingLeft} 
                    y1={goalY} 
                    x2={width - paddingRight} 
                    y2={goalY} 
                    stroke="#94a3b8" 
                    strokeWidth="1" 
                    strokeDasharray="4,4" 
                    strokeOpacity="0.5"
                />
            </g>
        )}

        {/* Chart Lines */}
        <path d={areaPath} fill={`url(#gradient-${color.replace('#','')})`} />
        <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Layer */}
        {points.map((p, i) => {
          const isSelected = selectedIndex === i;
          const isHovered = hoverIndex === i;
          const isActive = isSelected || isHovered;

          return (
            <g 
                key={i} 
                onMouseEnter={() => setHoverIndex(i)} 
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => onSelect && onSelect(i)}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
            >
              {/* Invisible Hit Area */}
              <rect x={p.x - (width / data.length / 2)} y={0} width={width / data.length} height={chartHeight} fill="transparent" />

              {/* Point */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 6 : 3}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-200 dark:stroke-gray-800"
                style={{ opacity: isActive ? 1 : 0 }}
              />

              {/* X-Axis Label */}
              <text 
                x={p.x} 
                y={chartHeight - 5} 
                textAnchor="middle" 
                className={`text-[10px] transition-colors duration-200 ${isActive ? 'fill-gray-900 dark:fill-white font-bold' : 'fill-gray-400 dark:fill-gray-600 font-medium'}`}
                style={{ fontSize: '10px' }}
              >
                {labels[i]}
              </text>

              {/* Tooltip */}
              {isActive && (
                 <g pointerEvents="none" style={{ zIndex: 50 }}>
                    <rect x={p.x - 20} y={p.y - 45} width="40" height="25" rx="6" fill="#1e293b" className="dark:fill-gray-700" />
                    <text x={p.x} y={p.y - 28} textAnchor="middle" fill="white" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                       {p.val}
                    </text>
                 </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// --- Multi-Line Chart (For Finance) ---
export interface Dataset {
  label: string;
  data: number[];
  color: string;
}

interface MultiLineChartProps {
  datasets: Dataset[];
  labels: string[];
  height?: number;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({ 
  datasets,
  labels,
  height = 200,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (datasets.length === 0 || datasets[0].data.length < 2) return null;

  // Dimensions
  const width = 800; 
  const chartHeight = 300; 
  const paddingLeft = 60; // Extra space for potentially larger currency numbers
  const paddingRight = 20;
  const paddingBottom = 30;
  const paddingTop = 20;

  // Range
  const allValues = datasets.flatMap(d => d.data);
  let maxVal = Math.max(...allValues, 0);
  let minVal = Math.min(...allValues, 0);
  
  if (maxVal === minVal) maxVal += 100; // Avoid flatline 0 range
  const range = maxVal - minVal;

  const getY = (val: number) => {
    return chartHeight - paddingBottom - ((val - minVal) / range) * (chartHeight - paddingBottom - paddingTop);
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (labels.length - 1)) * (width - paddingLeft - paddingRight);
  };

  // Generate Ticks
  const ticks = useMemo(() => {
    const count = 5;
    const step = range / (count - 1);
    return Array.from({ length: count }).map((_, i) => minVal + (step * i));
  }, [minVal, range]);

  // Zero Line
  const zeroY = getY(0);

  const processedDatasets = datasets.map(ds => ({
    ...ds,
    points: ds.data.map((val, i) => ({
      x: getX(i),
      y: getY(val),
      val
    }))
  }));

  return (
    <div className="w-full relative" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        
        {/* Y-Axis Grid & Labels */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line 
              x1={paddingLeft} 
              y1={getY(tick)} 
              x2={width - paddingRight} 
              y2={getY(tick)} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
              className="dark:stroke-gray-800" 
            />
            <text 
              x={paddingLeft - 10} 
              y={getY(tick) + 4} 
              textAnchor="end" 
              className="fill-gray-400 text-[10px] font-medium"
              style={{ fontSize: '10px' }}
            >
              {Math.abs(tick) >= 1000 ? (tick / 1000).toFixed(1) + 'k' : Math.round(tick)}
            </text>
          </g>
        ))}

        {/* Zero Axis Line (if 0 is within range and not already drawn by ticks) */}
        {minVal < 0 && maxVal > 0 && (
           <line x1={paddingLeft} y1={zeroY} x2={width - paddingRight} y2={zeroY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" className="opacity-50" />
        )}

        {/* Lines */}
        {processedDatasets.map((ds, idx) => (
          <path
            key={idx}
            d={generatePath(ds.points)}
            fill="none"
            stroke={ds.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
        ))}

        {/* Interactive Overlay */}
        {processedDatasets[0].points.map((_, i) => {
          const isHovered = hoverIndex === i;
          const x = processedDatasets[0].points[i].x;

          return (
            <g 
                key={i} 
                onMouseEnter={() => setHoverIndex(i)} 
                onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Hit Area */}
              <rect x={x - (width / labels.length / 2)} y={0} width={width / labels.length} height={chartHeight} fill="transparent" />

              {/* X Axis Label */}
              <text 
                x={x} 
                y={chartHeight - 5} 
                textAnchor="middle" 
                className={`text-[10px] transition-colors duration-200 ${isHovered ? 'fill-gray-900 dark:fill-white font-bold' : 'fill-gray-400 dark:fill-gray-600 font-medium'}`}
                style={{ fontSize: '10px' }}
              >
                {labels[i]}
              </text>

              {/* Tooltip & Points (Only on Hover) */}
              {isHovered && (
                 <g style={{ zIndex: 50 }}>
                    {/* Vertical Line Guide */}
                    <line x1={x} y1={paddingTop} x2={x} y2={chartHeight - paddingBottom} stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-gray-700" />
                    
                    {/* Points for each dataset at this index */}
                    {processedDatasets.map((ds, idx) => {
                       const p = ds.points[i];
                       return (
                         <circle key={idx} cx={p.x} cy={p.y} r={5} fill={ds.color} stroke="white" strokeWidth="2" className="dark:stroke-gray-800" />
                       );
                    })}

                    {/* Floating Legend Tooltip */}
                    <foreignObject x={Math.min(x, width - 170)} y={paddingTop} width="160" height="200">
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 text-xs">
                           <p className="font-bold mb-2 text-gray-500">{labels[i]}</p>
                           {processedDatasets.map(ds => (
                              <div key={ds.label} className="flex justify-between items-center mb-1">
                                 <span className="flex items-center gap-1.5 font-medium" style={{color: ds.color}}>
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: ds.color}} />
                                    {ds.label}
                                 </span>
                                 <span className="font-bold dark:text-white">{ds.points[i].val}</span>
                              </div>
                           ))}
                        </div>
                    </foreignObject>
                 </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// --- Bar Chart ---
interface BarChartProps {
  data: { label: string; value: number; color: string; payload?: any }[];
  height?: number;
  onSelect?: (payload: any, index: number) => void;
  goalValue?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 200, onSelect, goalValue }) => {
  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), goalValue || 0, 1);

  return (
    <div className="w-full relative flex items-end justify-between gap-2" style={{ height }}>
      {/* Optional Goal Line */}
      {goalValue && (
         <div 
           className="absolute left-0 right-0 border-t border-dashed border-gray-400/20 z-0 pointer-events-none"
           style={{ bottom: `${(goalValue / max) * 100}%` }}
         >
            <span className="absolute right-0 -top-4 text-[8px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-1">Goal</span>
         </div>
      )}

      {data.map((item, i) => {
        const percent = (item.value / max) * 100;
        const isSelected = item.payload?.isSelected;

        return (
          <div 
            key={i} 
            className="flex-1 flex flex-col items-center group cursor-pointer z-10"
            onClick={() => onSelect?.(item.payload, i)}
          >
            <div className="relative w-full flex items-end justify-center h-full">
              {/* Hit target / Ghost bar */}
              <div className={`absolute inset-x-0 bottom-0 top-0 rounded-t-xl transition-all ${isSelected ? 'bg-indigo-500/5' : 'group-hover:bg-gray-100/50 dark:group-hover:bg-gray-800/30'}`} />
              
              <div 
                className="w-full max-w-[32px] rounded-t-lg transition-all duration-700 ease-out shadow-sm relative z-10"
                style={{ 
                  height: `${Math.max(2, percent)}%`, 
                  backgroundColor: item.color,
                  opacity: percent === 0 ? 0.2 : 1
                }}
              >
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl pointer-events-none">
                    {item.value}
                 </div>
              </div>
            </div>
            <span className={`text-[10px] font-black mt-3 truncate w-full text-center max-w-[60px] transition-colors uppercase tracking-tight ${isSelected ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-600'}`} title={item.label}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};


// --- Donut Chart ---
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  showCenterText?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160, thickness = 20, showCenterText = true }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;

  if (total === 0) return (
    <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: size }}>
       No data
    </div>
  );

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 42 42" className="transform -rotate-90">
        {data.map((item, i) => {
          const percentage = (item.value / total) * 100;
          const dashLength = percentage; // In SVG coordinate space approx (percent of 100)
          const gapLength = 100 - percentage;
          
          // Using standard dasharray trick for donut segments
          // 42 / 2 / PI approx 15.9155 radius for circumference 100
          
          const segment = (
            <circle
              key={i}
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke={item.color}
              strokeWidth={thickness / 4} // scale relative to viewBox
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeDashoffset={-currentAngle}
              className="transition-all duration-500 hover:opacity-80 cursor-pointer"
            >
              <title>{item.label}: {Math.round(percentage)}%</title>
            </circle>
          );
          currentAngle += percentage;
          return segment;
        })}
      </svg>
      
      {showCenterText && (
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{total}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Items</span>
        </div>
      )}
    </div>
  );
};
