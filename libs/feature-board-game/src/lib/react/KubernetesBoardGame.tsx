import React from 'react';

// ============================================================================
// KUBERNETES BOARD GAME PATH - V13
// Fully dynamic - generates entire board from data
// ============================================================================

const SECTION_COLORS = [
  { fill: '#e8f5e9', stroke: '#a5d6a7', accent: '#4caf50' }, // Green
  { fill: '#e3f2fd', stroke: '#90caf9', accent: '#2196f3' }, // Blue
  { fill: '#fff3e0', stroke: '#ffcc80', accent: '#ff9800' }, // Orange
  { fill: '#f3e5f5', stroke: '#ce93d8', accent: '#9c27b0' }, // Purple
  { fill: '#e0f7fa', stroke: '#80deea', accent: '#00bcd4' }, // Cyan
  { fill: '#fce4ec', stroke: '#f48fb1', accent: '#e91e63' }, // Pink
];

const COLORS = {
  background: '#121212',
  divider: '#00000033',
  text: '#2a2520',
  textLight: '#f5f0e1',
  textMuted: '#8a8578',
  currentFill: '#a8e6cf',
  currentStroke: '#2dd4bf',
};

// ============================================================================
// DATA - This is all you need to change to customize the board
// ============================================================================
const BOARD_DATA = [
  {
    id: '01',
    title: 'THE BIG PICTURE',
    subtitle: 'FUNDAMENTALS',
    segments: ['CONTAINERS', 'WHY K8S?', 'ARCHITECTURE', 'CONTROL PLANE', 'NODES'],
  },
  {
    id: '02',
    title: 'CORE WORKLOADS',
    subtitle: 'PODS & DEPLOYMENTS',
    segments: ['KUBELET', 'PODS', 'REPLICA SETS', 'DEPLOYMENTS', 'ROLLING UPDATES', 'LABELS'],
    current: 'PODS', // Optional: highlight current position
  },
  {
    id: '03',
    title: 'NETWORKING',
    subtitle: 'SERVICES & INGRESS',
    segments: ['SELECTORS', 'SERVICES', 'CLUSTER IP', 'NODE PORT', 'LOAD BALANCER', 'INGRESS', 'DNS'],
  },
  {
    id: '04',
    title: 'CONFIGURATION',
    subtitle: 'CONFIG & SECRETS',
    segments: ['CORE DNS', 'CONFIG MAPS', 'SECRETS', 'ENV VARS', 'VOL MOUNTS', 'INJECT'],
  },
  {
    id: '05',
    title: 'STORAGE',
    subtitle: 'PERSISTENCE',
    segments: ['MANAGE', 'VOLUMES', 'PVs', 'PVCs', 'STORAGE CLASSES', 'DYNAMIC'],
  },
  {
    id: '06',
    title: 'ADVANCED',
    subtitle: 'SCALING & OPS',
    segments: ['PROVISION', 'HPA', 'VPA', 'JOBS', 'CRON JOBS', 'DAEMON SETS', 'STATEFUL SETS'],
  },
];

// ============================================================================
// LAYOUT CONFIG
// ============================================================================
const CONFIG = {
  trackHeight: 52,
  rowSpacing: 155,
  leftX: 230,
  rightX: 870,
  startY: 50,
  headerOffset: 55, // X offset for headers from edge
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function KubernetesBoardGameV13() {
  const { trackHeight, rowSpacing, leftX, rightX, startY, headerOffset } = CONFIG;
  const totalWidth = rightX - leftX;
  const endCapRadius = (rowSpacing - trackHeight) / 2;
  
  // Calculate row Y positions
  const getRowTop = (index: number) => startY + index * rowSpacing;

  // Determine if row goes left-to-right or right-to-left
  const isLTR = (index: number) => index % 2 === 0;

  // Get color for a section
  const getColor = (index: number) => SECTION_COLORS[index % SECTION_COLORS.length];
  
  // ========== QUARTER CIRCLE COMPONENT ==========
  const QuarterCircle = ({ cx, cy, radius, position, colorIndex }: { cx: number; cy: number; radius: number; position: string; colorIndex: number }) => {
    const color = getColor(colorIndex);
    const r = radius;
    const t = trackHeight;
    
    let path;
    
    if (position === 'top-right') {
      path = `M ${cx} ${cy - r} L ${cx} ${cy - r - t} A ${r + t} ${r + t} 0 0 1 ${cx + r + t} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy - r} Z`;
    } else if (position === 'bottom-right') {
      path = `M ${cx + r} ${cy} L ${cx + r + t} ${cy} A ${r + t} ${r + t} 0 0 1 ${cx} ${cy + r + t} L ${cx} ${cy + r} A ${r} ${r} 0 0 0 ${cx + r} ${cy} Z`;
    } else if (position === 'top-left') {
      path = `M ${cx} ${cy - r} L ${cx} ${cy - r - t} A ${r + t} ${r + t} 0 0 0 ${cx - r - t} ${cy} L ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r} Z`;
    } else if (position === 'bottom-left') {
      path = `M ${cx - r} ${cy} L ${cx - r - t} ${cy} A ${r + t} ${r + t} 0 0 0 ${cx} ${cy + r + t} L ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx - r} ${cy} Z`;
    }
    
    return <path d={path} fill={color.fill} stroke={color.stroke} strokeWidth={2} />;
  };
  
  // ========== STRAIGHT ROW COMPONENT ==========
  const StraightRow = ({ rowIndex, data }: { rowIndex: number; data: { segments: string[]; current?: string } }) => {
    const color = getColor(rowIndex);
    const top = getRowTop(rowIndex);
    const segCount = data.segments.length;
    const segWidth = totalWidth / segCount;
    const ltr = isLTR(rowIndex);
    const displaySegs = ltr ? data.segments : [...data.segments].reverse();
    
    // Find current segment index if specified
    const currentSegIndex = data.current 
      ? displaySegs.findIndex((s: string) => s === data.current)
      : -1;
    
    return (
      <g>
        {/* Row background */}
        <rect 
          x={leftX} 
          y={top} 
          width={totalWidth} 
          height={trackHeight} 
          fill={color.fill} 
          stroke={color.stroke} 
          strokeWidth={2} 
        />
        
        {/* Current highlight */}
        {currentSegIndex >= 0 && (
          <>
            <rect 
              x={leftX + currentSegIndex * segWidth} 
              y={top} 
              width={segWidth} 
              height={trackHeight} 
              fill={COLORS.currentFill} 
            />
            <rect 
              x={leftX + currentSegIndex * segWidth} 
              y={top} 
              width={segWidth} 
              height={trackHeight} 
              fill="none" 
              stroke={COLORS.currentStroke} 
              strokeWidth={3} 
            />
          </>
        )}
        
        {/* Dividers */}
        {Array.from({ length: segCount - 1 }, (_, i) => (
          <line
            key={`div-${rowIndex}-${i}`}
            x1={leftX + (i + 1) * segWidth}
            y1={top}
            x2={leftX + (i + 1) * segWidth}
            y2={top + trackHeight}
            stroke={COLORS.divider}
            strokeWidth={2}
          />
        ))}
        
        {/* Labels */}
        {displaySegs.map((text: string, i: number) => {
          const x = leftX + i * segWidth + segWidth / 2;
          const centerY = top + trackHeight / 2;
          const words = text.split(' ');
          
          if (words.length > 1) {
            return (
              <text key={`label-${rowIndex}-${i}`} x={x} y={centerY - 6} textAnchor="middle" fill={COLORS.text} fontSize={11} fontWeight="600" fontFamily="system-ui, sans-serif">
                <tspan x={x} dy="0">{words[0]}</tspan>
                <tspan x={x} dy="13">{words.slice(1).join(' ')}</tspan>
              </text>
            );
          }
          return (
            <text key={`label-${rowIndex}-${i}`} x={x} y={centerY + 4} textAnchor="middle" fill={COLORS.text} fontSize={11} fontWeight="600" fontFamily="system-ui, sans-serif">
              {text}
            </text>
          );
        })}
      </g>
    );
  };
  
  // ========== END CAP COMPONENT ==========
  const EndCap = ({ afterRowIndex }: { afterRowIndex: number }) => {
    const top = getRowTop(afterRowIndex);
    const cy = top + trackHeight + endCapRadius;
    const isRightSide = isLTR(afterRowIndex); // LTR rows have end cap on right
    const cx = isRightSide ? rightX : leftX;
    
    const topPosition = isRightSide ? 'top-right' : 'top-left';
    const bottomPosition = isRightSide ? 'bottom-right' : 'bottom-left';
    
    // Divider line
    const dividerX1 = isRightSide ? rightX : leftX - endCapRadius - trackHeight;
    const dividerX2 = isRightSide ? rightX + endCapRadius + trackHeight : leftX;
    
    return (
      <g>
        <QuarterCircle cx={cx} cy={cy} radius={endCapRadius} position={topPosition} colorIndex={afterRowIndex} />
        <QuarterCircle cx={cx} cy={cy} radius={endCapRadius} position={bottomPosition} colorIndex={afterRowIndex + 1} />
        <line x1={dividerX1} y1={cy} x2={dividerX2} y2={cy} stroke={COLORS.divider} strokeWidth={2} />
      </g>
    );
  };
  
  // ========== SECTION HEADER COMPONENT ==========
  const SectionHeader = ({ rowIndex, data }: { rowIndex: number; data: { id: string; title: string; subtitle: string } }) => {
    const color = getColor(rowIndex);
    const top = getRowTop(rowIndex);
    const ltr = isLTR(rowIndex);
    const x = ltr ? headerOffset : rightX + endCapRadius + trackHeight + 20;
    const y = top + trackHeight + 30;
    const align = ltr ? 'start' : 'end';
    
    return (
      <g>
        <text x={x} y={y} textAnchor={align} fill={color.accent} fontSize={52} fontWeight="800" fontFamily="Georgia, serif">
          {data.id}
        </text>
        <text x={x} y={y + 26} textAnchor={align} fill={COLORS.textLight} fontSize={15} fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="3">
          {data.title}
        </text>
        <text x={x} y={y + 43} textAnchor={align} fill={COLORS.textMuted} fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="2">
          {data.subtitle}
        </text>
      </g>
    );
  };
  
  // ========== CALCULATE SVG HEIGHT ==========
  const svgHeight = getRowTop(BOARD_DATA.length - 1) + trackHeight + 100;
  
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      overflow: 'auto',
    }}>
      <svg viewBox={`0 0 1100 ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Render all rows */}
        {BOARD_DATA.map((data, index) => (
          <StraightRow key={`row-${index}`} rowIndex={index} data={data} />
        ))}
        
        {/* Render all end caps (between rows) */}
        {BOARD_DATA.slice(0, -1).map((_, index) => (
          <EndCap key={`cap-${index}`} afterRowIndex={index} />
        ))}
        
        {/* Render all section headers */}
        {BOARD_DATA.map((data, index) => (
          <SectionHeader key={`header-${index}`} rowIndex={index} data={data} />
        ))}
      </svg>
    </div>
  );
}
