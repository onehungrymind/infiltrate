// @ts-nocheck
import React, { useState } from 'react';

// ============================================================================
// INTERMETROPOLIS - Kubernetes Intermediate District
// Theme: Blue (#4361EE)
// ============================================================================

const CITY_CONFIG = {
  name: 'INTERMETROPOLIS',
  subtitle: 'Kubernetes Intermediate District',
  theme: {
    primary: '#4361EE',
    primaryGlow: '#7B8CFF',
    secondary: '#7EB8DA',
    secondaryGlow: '#A8D4EC',
    tertiary: '#3A86FF',
    tertiaryGlow: '#6BA3FF',
    accent: '#00B4D8',
    accentGlow: '#48CAE4',
    background: '#0A0A0A',
    gridColor: '#0D1A2D',
    textPrimary: '#FFFFFF',
    textSecondary: '#9A9A9A',
    textMuted: '#4A4A4A',
  },
  previousCity: {
    name: 'Basicburgh',
    direction: 'west',
    description: 'Fundamentals District'
  },
  nextCity: {
    name: 'Advancedonia',
    direction: 'east',
    description: 'Advanced District'
  }
};

const stations = {
  core: [
    { id: 'int-core-1', name: 'Helm Basics', x: 80, y: 300, description: 'Package management and chart fundamentals', prerequisites: [], knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked', isEntry: true },
    { id: 'int-core-2', name: 'Helm Charts', x: 180, y: 300, description: 'Creating, templating, and managing charts', prerequisites: ['int-core-1'], knowledgeUnits: 7, estimatedMinutes: 70, status: 'locked' },
    { id: 'int-core-3', name: 'Kustomize', x: 280, y: 300, description: 'Template-free configuration customization', prerequisites: ['int-core-2'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
    { id: 'int-core-4', name: 'StatefulSets', x: 380, y: 300, description: 'Stateful application deployments', prerequisites: ['int-core-3'], knowledgeUnits: 6, estimatedMinutes: 65, status: 'locked', unlocksLines: ['workloads'], isTransfer: true },
    { id: 'int-core-5', name: 'RBAC Fundamentals', x: 480, y: 300, description: 'Roles, RoleBindings, and access control', prerequisites: ['int-core-4'], knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked', unlocksLines: ['security'], isTransfer: true },
    { id: 'int-core-6', name: 'ServiceAccounts', x: 580, y: 300, description: 'Pod identity and API access', prerequisites: ['int-core-5'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked' },
    { id: 'int-core-7', name: 'NetworkPolicies', x: 680, y: 300, description: 'Pod-level network segmentation', prerequisites: ['int-core-6'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
    { id: 'int-core-8', name: 'Resource Management', x: 780, y: 300, description: 'Requests, limits, and quotas', prerequisites: ['int-core-7'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked', unlocksLines: ['networking'], isTransfer: true },
    { id: 'int-core-9', name: 'HPA', x: 880, y: 300, description: 'Horizontal Pod Autoscaling', prerequisites: ['int-core-8'], knowledgeUnits: 4, estimatedMinutes: 45, status: 'locked' },
    { id: 'int-core-10', name: 'Intermediate Capstone', x: 980, y: 300, description: 'Deploy a production-grade microservices app', prerequisites: ['int-core-9'], knowledgeUnits: 1, estimatedMinutes: 180, status: 'locked', isCapstone: true, isExit: true },
  ],
  workloads: [
    { id: 'work-1', name: 'DaemonSets', x: 380, y: 200, description: 'Node-level pod deployment', prerequisites: ['int-core-4'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked' },
    { id: 'work-2', name: 'Jobs', x: 480, y: 150, description: 'Batch processing workloads', prerequisites: ['work-1'], knowledgeUnits: 4, estimatedMinutes: 35, status: 'locked' },
    { id: 'work-3', name: 'CronJobs', x: 600, y: 150, description: 'Scheduled batch processing', prerequisites: ['work-2'], knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
    { id: 'work-4', name: 'Init Containers', x: 720, y: 150, description: 'Pod initialization patterns', prerequisites: ['work-3'], knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
  ],
  security: [
    { id: 'sec-1', name: 'SecurityContexts', x: 480, y: 400, description: 'Pod and container security settings', prerequisites: ['int-core-5'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
    { id: 'sec-2', name: 'PodSecurityStandards', x: 580, y: 450, description: 'Cluster-wide security policies', prerequisites: ['sec-1'], knowledgeUnits: 4, estimatedMinutes: 45, status: 'locked' },
    { id: 'sec-3', name: 'Secret Management', x: 700, y: 450, description: 'External secrets and encryption', prerequisites: ['sec-2'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
  ],
  networking: [
    { id: 'net-1', name: 'CoreDNS', x: 780, y: 200, description: 'Service discovery and DNS customization', prerequisites: ['int-core-8'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked' },
    { id: 'net-2', name: 'Ingress Controllers', x: 880, y: 150, description: 'NGINX, Traefik, and alternatives', prerequisites: ['net-1'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
    { id: 'net-3', name: 'Service Mesh Intro', x: 980, y: 150, description: 'Istio and Linkerd fundamentals', prerequisites: ['net-2'], knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked' },
  ]
};

const lines = {
  core: { name: 'Core Line', color: CITY_CONFIG.theme.primary, glowColor: CITY_CONFIG.theme.primaryGlow },
  workloads: { name: 'Workloads Branch', color: CITY_CONFIG.theme.secondary, glowColor: CITY_CONFIG.theme.secondaryGlow },
  security: { name: 'Security Branch', color: CITY_CONFIG.theme.tertiary, glowColor: CITY_CONFIG.theme.tertiaryGlow },
  networking: { name: 'Networking Branch', color: CITY_CONFIG.theme.accent, glowColor: CITY_CONFIG.theme.accentGlow },
};

const isLineUnlocked = (lineId) => {
  if (lineId === 'core') return true; // Would check if Basicburgh is complete
  const unlockerStation = stations.core.find(s => 
    s.unlocksLines?.includes(lineId) && 
    (s.status === 'completed' || s.status === 'current')
  );
  return !!unlockerStation;
};

// Station component
const Station = ({ station, line, isSelected, onClick, theme }) => {
  const lineConfig = lines[line];
  const isUnlocked = isLineUnlocked(line);
  const baseColor = isUnlocked ? lineConfig.color : '#3A3A3A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#4A4A4A';
  
  const getInnerStyle = () => {
    if (!isUnlocked) return { fill: '#1A1A1A', stroke: '#3A3A3A' };
    switch (station.status) {
      case 'completed': return { fill: baseColor, stroke: glowColor };
      case 'current': return { fill: '#0D0D0D', stroke: baseColor };
      case 'available': return { fill: '#0D0D0D', stroke: baseColor };
      default: return { fill: '#1A1A1A', stroke: '#3A3A3A' };
    }
  };

  const style = getInnerStyle();
  const showPulse = station.status === 'current';
  const outerRadius = station.isCapstone ? 22 : station.isTransfer ? 20 : 16;
  const innerRadius = station.isCapstone ? 14 : station.isTransfer ? 12 : 10;
  
  return (
    <g onClick={() => onClick(station, line)} style={{ cursor: 'pointer' }}>
      {isUnlocked && (
        <circle cx={station.x} cy={station.y} r={outerRadius + 4}
          fill="none" stroke={glowColor} strokeWidth="1" opacity="0.3" filter="url(#glow)" />
      )}
      
      {showPulse && (
        <circle cx={station.x} cy={station.y} r={outerRadius}
          fill="none" stroke={lineConfig.color} strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values={`${outerRadius};${outerRadius + 12};${outerRadius}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      
      {isSelected && (
        <circle cx={station.x} cy={station.y} r={outerRadius + 6}
          fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.8" />
      )}
      
      <circle cx={station.x} cy={station.y} r={outerRadius}
        fill="#0D0D0D" stroke={isUnlocked ? baseColor : '#3A3A3A'} strokeWidth="3" />
      
      <circle cx={station.x} cy={station.y} r={innerRadius}
        fill={style.fill} stroke={style.stroke} strokeWidth="2" />
      
      {isUnlocked && station.status !== 'completed' && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill={baseColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
          {station.estimatedMinutes}m
        </text>
      )}
      
      {station.status === 'completed' && isUnlocked && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill="#FFFFFF" fontSize="12" fontWeight="bold">✓</text>
      )}
      
      {station.isEntry && (
        <g transform={`translate(${station.x - 55}, ${station.y - 8})`}>
          <polygon points="12,8 0,0 0,16" fill="#E63946" opacity="0.8" />
          <text x="-70" y="12" fill={theme.textSecondary} fontSize="8" fontFamily="monospace" textAnchor="end">FROM BASICBURGH</text>
        </g>
      )}
      
      {station.isExit && (
        <g transform={`translate(${station.x + 28}, ${station.y - 8})`}>
          <polygon points="0,8 12,0 12,16" fill="#9D4EDD" opacity="0.8" />
          <text x="16" y="12" fill={theme.textSecondary} fontSize="8" fontFamily="monospace">TO ADVANCEDONIA</text>
        </g>
      )}
    </g>
  );
};

// Station label
const StationLabel = ({ station, line, position = 'below', theme }) => {
  const isUnlocked = isLineUnlocked(line);
  const lineConfig = lines[line];
  
  const config = {
    right: { x: station.x + 28, y: station.y, anchor: 'start' },
    left: { x: station.x - 28, y: station.y, anchor: 'end' },
    above: { x: station.x, y: station.y - 28, anchor: 'middle' },
    below: { x: station.x, y: station.y + 32, anchor: 'middle' },
  };
  
  const pos = config[position];
  
  return (
    <g>
      <text x={pos.x} y={pos.y} textAnchor={pos.anchor}
        fill={isUnlocked ? theme.textPrimary : theme.textMuted}
        fontSize="10" fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight={station.status === 'current' ? 'bold' : 'normal'}>
        {station.name}
      </text>
      <text x={pos.x} y={pos.y + 12} textAnchor={pos.anchor}
        fill={isUnlocked ? lineConfig.color : '#3A3A3A'}
        fontSize="8" fontFamily="monospace">
        {station.knowledgeUnits} units • {station.estimatedMinutes}m
      </text>
    </g>
  );
};

// Line path
const LinePath = ({ points, lineConfig, isUnlocked }) => {
  if (points.length < 2) return null;
  const pathData = points.reduce((acc, point, idx) => 
    idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`, '');
  const color = isUnlocked ? lineConfig.color : '#2A2A2A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#2A2A2A';
  
  return (
    <g>
      {isUnlocked && (
        <path d={pathData} fill="none" stroke={glowColor} strokeWidth="12"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.2" filter="url(#glow)" />
      )}
      <path d={pathData} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// Branch connector
const BranchConnector = ({ from, to, lineConfig, isUnlocked, direction = 'up' }) => {
  const color = isUnlocked ? lineConfig.color : '#2A2A2A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#2A2A2A';
  
  let pathData;
  if (direction === 'up') {
    const midY = from.y - Math.abs(from.y - to.y) * 0.5;
    pathData = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${to.y}`;
  } else {
    const midY = from.y + Math.abs(to.y - from.y) * 0.5;
    pathData = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${to.y}`;
  }
  
  return (
    <g>
      {isUnlocked && (
        <path d={pathData} fill="none" stroke={glowColor} strokeWidth="12"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.2" filter="url(#glow)" />
      )}
      <path d={pathData} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// Detail panel
const DetailPanel = ({ station, line, onClose, onStartLearning, theme }) => {
  if (!station) return null;
  
  const lineConfig = lines[line];
  const lineUnlocked = isLineUnlocked(line);
  const canStart = lineUnlocked && (station.status === 'current' || station.status === 'available');
  
  const getStatusBadge = () => {
    if (!lineUnlocked) return { text: 'Line Locked', bg: '#2A2A2A', color: '#6A6A6A' };
    switch (station.status) {
      case 'completed': return { text: 'Completed', bg: '#1B4332', color: '#40C057' };
      case 'current': return { text: 'In Progress', bg: '#1A3A5C', color: '#4DABF7' };
      case 'available': return { text: 'Available', bg: '#3D3410', color: '#FAB005' };
      default: return { text: 'Locked', bg: '#2A2A2A', color: '#6A6A6A' };
    }
  };
  
  const status = getStatusBadge();
  
  return (
    <div className="absolute rounded-xl overflow-hidden border"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 340,
        backgroundColor: '#0D0D0D',
        borderColor: lineUnlocked ? lineConfig.color : '#3A3A3A',
        boxShadow: `0 0 40px ${lineUnlocked ? lineConfig.color + '40' : '#00000080'}`,
        zIndex: 100
      }}>
      <div className="p-4" style={{ borderBottom: `2px solid ${lineUnlocked ? lineConfig.color : '#3A3A3A'}` }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: lineUnlocked ? lineConfig.color : '#4A4A4A' }}>
              {lineConfig.name}
            </p>
            <h3 className="text-lg font-bold mt-1 text-white">{station.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: status.bg, color: status.color }}>
            {status.text}
          </span>
        </div>
        
        <p className="text-gray-400 mb-4 text-sm">{station.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded p-3" style={{ backgroundColor: '#1A1A1A' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: lineConfig.color }}>Δt Required</p>
            <p className="text-xl font-mono font-bold text-white">{station.estimatedMinutes}m</p>
          </div>
          <div className="rounded p-3" style={{ backgroundColor: '#1A1A1A' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: lineConfig.color }}>Units</p>
            <p className="text-xl font-mono font-bold text-white">{station.knowledgeUnits}</p>
          </div>
        </div>
        
        {station.unlocksLines && station.unlocksLines.length > 0 && (
          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#1A1A0A', borderColor: '#3D3410' }}>
            <p className="text-xs uppercase tracking-wide text-yellow-500 mb-1">🔓 Unlocks New Line</p>
            <p className="text-sm font-medium text-yellow-300">
              {station.unlocksLines.map(l => lines[l].name).join(', ')}
            </p>
          </div>
        )}
        
        {station.isEntry && (
          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#1A0A0A', borderColor: '#E63946' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#E63946' }}>⬅ Entry Point</p>
            <p className="text-sm text-gray-300">
              Connected from <span className="font-bold text-red-400">Basicburgh</span>
            </p>
          </div>
        )}
        
        {station.isExit && (
          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#0A0A1A', borderColor: '#9D4EDD' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9D4EDD' }}>🚀 Gateway Station</p>
            <p className="text-sm text-gray-300">
              Completing this unlocks <span className="font-bold text-purple-400">Advancedonia</span>
            </p>
          </div>
        )}
        
        {canStart && (
          <button onClick={() => onStartLearning(station)}
            className="w-full py-3 rounded font-bold text-white transition-all hover:opacity-90 uppercase tracking-wide text-sm"
            style={{ backgroundColor: lineConfig.color }}>
            {station.status === 'current' ? '▶ Continue Mission' : '▶ Begin Mission'}
          </button>
        )}
      </div>
    </div>
  );
};

// Mission control panel
const MissionControl = ({ theme }) => {
  const totalStations = stations.core.length;
  const completedStations = stations.core.filter(s => s.status === 'completed').length;
  const percentage = Math.round((completedStations / totalStations) * 100);
  const completedTime = stations.core.filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + s.estimatedMinutes, 0);
  
  return (
    <div className="absolute top-4 left-4 rounded-lg p-4 w-64 border"
      style={{ backgroundColor: '#0D0D0D', borderColor: theme.primary }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#40C057' }} />
        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
          Mission Control
        </h4>
      </div>
      
      <h3 className="text-xl font-black text-white mb-1">{CITY_CONFIG.name}</h3>
      <p className="text-xs mb-4" style={{ color: theme.textMuted }}>{CITY_CONFIG.subtitle}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: theme.textMuted }}>PROGRESS</span>
          <span className="font-mono" style={{ color: theme.primary }}>{percentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#1A1A1A' }}>
          <div className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: theme.primary }} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded p-2" style={{ backgroundColor: '#1A1A1A' }}>
          <p className="text-xs" style={{ color: theme.textMuted }}>STATIONS</p>
          <p className="font-mono text-white">{completedStations}/{totalStations}</p>
        </div>
        <div className="rounded p-2" style={{ backgroundColor: '#1A1A1A' }}>
          <p className="text-xs" style={{ color: theme.textMuted }}>Δt INVESTED</p>
          <p className="font-mono text-white">{completedTime}m</p>
        </div>
      </div>
      
      <div className="rounded p-3" style={{ backgroundColor: '#1A1A1A', borderLeft: `3px solid ${theme.primary}` }}>
        <p className="text-xs uppercase" style={{ color: theme.textMuted }}>Current Objective</p>
        <p className="text-sm font-medium text-white mt-1">
          {stations.core.find(s => s.status === 'current')?.name || 'Complete Basicburgh first'}
        </p>
      </div>
    </div>
  );
};

// Legend
const Legend = ({ theme }) => (
  <div className="absolute bottom-4 left-4 rounded-lg p-4 border"
    style={{ backgroundColor: '#0D0D0D', borderColor: '#3A3A3A' }}>
    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
      Transit Lines
    </h4>
    <div className="space-y-2">
      {Object.entries(lines).map(([key, config]) => {
        const unlocked = isLineUnlocked(key);
        return (
          <div key={key} className="flex items-center gap-3">
            <div className="w-8 h-2 rounded" style={{ backgroundColor: unlocked ? config.color : '#2A2A2A' }} />
            <span className="text-xs" style={{ color: unlocked ? theme.textSecondary : theme.textMuted }}>
              {config.name}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

// Adjacent cities indicator
const AdjacentCities = ({ theme }) => (
  <div className="absolute bottom-4 right-4 rounded-lg p-4 border"
    style={{ backgroundColor: '#0D0D0D', borderColor: '#3A3A3A' }}>
    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
      Connected Districts
    </h4>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E63946' }} />
        <div>
          <span className="text-sm text-gray-300">← Basicburgh</span>
          <p className="text-xs text-gray-600">Fundamentals • Completed</p>
        </div>
      </div>
      <div className="flex items-center gap-3 opacity-50">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9D4EDD' }} />
        <div>
          <span className="text-sm text-gray-400">Advancedonia →</span>
          <p className="text-xs text-gray-700">Advanced • 🔒 Locked</p>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function Intermetropolis({ onNavigateToCity }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const theme = CITY_CONFIG.theme;
  
  const handleStationClick = (station, line) => {
    setSelectedStation(station);
    setSelectedLine(line);
  };
  
  const handleClose = () => {
    setSelectedStation(null);
    setSelectedLine(null);
  };
  
  const handleStartLearning = (station) => {
    console.log('Starting mission:', station.name);
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: theme.background }}>
      <svg viewBox="0 0 1100 520" className="w-full h-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <pattern id="darkGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.gridColor} strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill={theme.background} />
        <rect width="100%" height="100%" fill="url(#darkGrid)" />
        
        {/* Entry arrow from Basicburgh */}
        <g opacity="0.6">
          <path d="M 20 300 L 55 300" stroke="#E63946" strokeWidth="4" strokeDasharray="8,4" />
          <polygon points="55,300 45,292 45,308" fill="#E63946" />
        </g>
        
        {/* Core Line */}
        <LinePath points={stations.core} lineConfig={lines.core} isUnlocked={isLineUnlocked('core')} />
        
        {/* Workloads Branch */}
        <BranchConnector from={stations.core[3]} to={stations.workloads[0]}
          lineConfig={lines.workloads} isUnlocked={isLineUnlocked('workloads')} direction="up" />
        <LinePath points={stations.workloads} lineConfig={lines.workloads} isUnlocked={isLineUnlocked('workloads')} />
        
        {/* Security Branch */}
        <BranchConnector from={stations.core[4]} to={stations.security[0]}
          lineConfig={lines.security} isUnlocked={isLineUnlocked('security')} direction="down" />
        <LinePath points={stations.security} lineConfig={lines.security} isUnlocked={isLineUnlocked('security')} />
        
        {/* Networking Branch */}
        <BranchConnector from={stations.core[7]} to={stations.networking[0]}
          lineConfig={lines.networking} isUnlocked={isLineUnlocked('networking')} direction="up" />
        <LinePath points={stations.networking} lineConfig={lines.networking} isUnlocked={isLineUnlocked('networking')} />
        
        {/* Exit arrow to Advancedonia */}
        <g opacity="0.4">
          <path d="M 1010 300 L 1070 300" stroke="#9D4EDD" strokeWidth="4" strokeDasharray="8,4" />
          <polygon points="1070,300 1060,292 1060,308" fill="#9D4EDD" />
        </g>
        
        {/* Stations */}
        {stations.core.map(station => (
          <Station key={station.id} station={station} line="core"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.workloads.map(station => (
          <Station key={station.id} station={station} line="workloads"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.security.map(station => (
          <Station key={station.id} station={station} line="security"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.networking.map(station => (
          <Station key={station.id} station={station} line="networking"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        
        {/* Labels */}
        {stations.core.map((station, idx) => (
          <StationLabel key={`label-${station.id}`} station={station} line="core" 
            position={idx % 2 === 0 ? 'below' : 'above'} theme={theme} />
        ))}
        {stations.workloads.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="workloads" position="above" theme={theme} />
        ))}
        {stations.security.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="security" position="below" theme={theme} />
        ))}
        {stations.networking.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="networking" position="above" theme={theme} />
        ))}
        
        {/* Title */}
        <text x="550" y="500" textAnchor="middle" fill="#2A4A6A" fontSize="11" fontFamily="monospace">
          KASITA TRANSIT AUTHORITY • {CITY_CONFIG.name} • KUBERNETES DISTRICT
        </text>
        
        {/* Corner decorations */}
        <g opacity="0.3">
          <path d="M 20 20 L 60 20 L 60 24 L 24 24 L 24 60 L 20 60 Z" fill={theme.primary} />
          <path d="M 1080 20 L 1040 20 L 1040 24 L 1076 24 L 1076 60 L 1080 60 Z" fill={theme.primary} />
        </g>
      </svg>
      
      <MissionControl theme={theme} />
      <Legend theme={theme} />
      <AdjacentCities theme={theme} />
      
      <DetailPanel station={selectedStation} line={selectedLine}
        onClose={handleClose} onStartLearning={handleStartLearning} theme={theme} />
    </div>
  );
}
