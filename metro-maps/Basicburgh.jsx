import React, { useState } from 'react';

// ============================================================================
// BASICBURGH - Kubernetes Fundamentals District
// Theme: Red (#E63946)
// ============================================================================

const CITY_CONFIG = {
  name: 'BASICBURGH',
  subtitle: 'Kubernetes Fundamentals District',
  theme: {
    primary: '#E63946',
    primaryGlow: '#FF6B6B',
    secondary: '#F4A3A8',
    secondaryGlow: '#FFB8BC',
    tertiary: '#C9434E',
    tertiaryGlow: '#E8666F',
    background: '#0A0A0A',
    gridColor: '#1A1A1A',
    textPrimary: '#FFFFFF',
    textSecondary: '#9A9A9A',
    textMuted: '#4A4A4A',
  },
  nextCity: {
    name: 'Intermetropolis',
    direction: 'east',
    description: 'Intermediate District'
  }
};

const stations = {
  core: [
    { id: 'core-1', name: 'Container Fundamentals', x: 100, y: 520, description: 'Understanding containerization and why Kubernetes exists', prerequisites: [], knowledgeUnits: 4, estimatedMinutes: 45, status: 'completed' },
    { id: 'core-2', name: 'Cluster Architecture', x: 100, y: 440, description: 'Control plane, worker nodes, etcd, and API server', prerequisites: ['core-1'], knowledgeUnits: 6, estimatedMinutes: 60, status: 'completed' },
    { id: 'core-3', name: 'Pods', x: 100, y: 360, description: 'The atomic unit of deployment in Kubernetes', prerequisites: ['core-2'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'completed' },
    { id: 'core-4', name: 'ReplicaSets', x: 100, y: 280, description: 'Scaling pods and ensuring availability', prerequisites: ['core-3'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'completed' },
    { id: 'core-5', name: 'Deployments', x: 100, y: 200, description: 'Declarative updates, rollbacks, and scaling', prerequisites: ['core-4'], knowledgeUnits: 6, estimatedMinutes: 55, status: 'current', unlocksLines: ['storage'], isTransfer: true },
    { id: 'core-6', name: 'Services', x: 200, y: 120, description: 'ClusterIP, NodePort, LoadBalancer networking', prerequisites: ['core-5'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
    { id: 'core-7', name: 'Ingress', x: 320, y: 120, description: 'HTTP routing and external access', prerequisites: ['core-6'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
    { id: 'core-8', name: 'ConfigMaps & Secrets', x: 440, y: 120, description: 'Externalized configuration management', prerequisites: ['core-7'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked', unlocksLines: ['observability'], isTransfer: true },
    { id: 'core-9', name: 'Namespaces', x: 560, y: 120, description: 'Logical isolation and multi-tenancy basics', prerequisites: ['core-8'], knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
    { id: 'core-10', name: 'kubectl Mastery', x: 680, y: 120, description: 'Essential CLI commands and patterns', prerequisites: ['core-9'], knowledgeUnits: 8, estimatedMinutes: 70, status: 'locked' },
    { id: 'core-11', name: 'Troubleshooting', x: 800, y: 120, description: 'Logs, describe, exec, and debugging', prerequisites: ['core-10'], knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked' },
    { id: 'core-12', name: 'Fundamentals Capstone', x: 920, y: 120, description: 'Deploy a complete application stack', prerequisites: ['core-11'], knowledgeUnits: 1, estimatedMinutes: 120, status: 'locked', isCapstone: true, isExit: true },
  ],
  storage: [
    { id: 'storage-1', name: 'Volumes', x: 230, y: 200, description: 'emptyDir, hostPath, and volume basics', prerequisites: ['core-5'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'available' },
    { id: 'storage-2', name: 'PersistentVolumes', x: 350, y: 200, description: 'Cluster-provisioned storage resources', prerequisites: ['storage-1'], knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
    { id: 'storage-3', name: 'PVCs', x: 470, y: 200, description: 'Claiming and binding storage to pods', prerequisites: ['storage-2'], knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked' },
    { id: 'storage-4', name: 'StorageClasses', x: 590, y: 200, description: 'Dynamic provisioning and storage tiers', prerequisites: ['storage-3'], knowledgeUnits: 4, estimatedMinutes: 45, status: 'locked' },
  ],
  observability: [
    { id: 'obs-1', name: 'Resource Metrics', x: 440, y: 40, description: 'CPU and memory monitoring basics', prerequisites: ['core-8'], knowledgeUnits: 4, estimatedMinutes: 35, status: 'locked' },
    { id: 'obs-2', name: 'Liveness Probes', x: 560, y: 40, description: 'Health checks and automatic restarts', prerequisites: ['obs-1'], knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
    { id: 'obs-3', name: 'Readiness Probes', x: 680, y: 40, description: 'Traffic routing based on pod health', prerequisites: ['obs-2'], knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
    { id: 'obs-4', name: 'Startup Probes', x: 800, y: 40, description: 'Handling slow-starting containers', prerequisites: ['obs-3'], knowledgeUnits: 2, estimatedMinutes: 20, status: 'locked' },
  ]
};

const lines = {
  core: { name: 'Core Line', color: CITY_CONFIG.theme.primary, glowColor: CITY_CONFIG.theme.primaryGlow },
  storage: { name: 'Storage Branch', color: CITY_CONFIG.theme.secondary, glowColor: CITY_CONFIG.theme.secondaryGlow },
  observability: { name: 'Observability Branch', color: CITY_CONFIG.theme.tertiary, glowColor: CITY_CONFIG.theme.tertiaryGlow },
};

const isLineUnlocked = (lineId) => {
  if (lineId === 'core') return true;
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
      
      {station.isExit && (
        <g transform={`translate(${station.x + 28}, ${station.y - 8})`}>
          <polygon points="0,8 12,0 12,16" fill={theme.primary} opacity="0.8" />
          <text x="16" y="12" fill={theme.textSecondary} fontSize="8" fontFamily="monospace">TO INTERMETROPOLIS</text>
        </g>
      )}
    </g>
  );
};

// Station label
const StationLabel = ({ station, line, position = 'right', theme }) => {
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
const BranchConnector = ({ from, to, lineConfig, isUnlocked }) => {
  const color = isUnlocked ? lineConfig.color : '#2A2A2A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#2A2A2A';
  const midX = from.x + (to.x - from.x) * 0.5;
  const pathData = `M ${from.x} ${from.y} L ${midX} ${from.y} L ${to.x} ${to.y}`;
  
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
    <div className="absolute top-4 right-4 w-80 rounded-lg overflow-hidden border"
      style={{ backgroundColor: '#0D0D0D', borderColor: lineUnlocked ? lineConfig.color : '#3A3A3A' }}>
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
        
        {station.isExit && (
          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#0A1A1A', borderColor: theme.primary }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: theme.primary }}>🚀 Gateway Station</p>
            <p className="text-sm text-gray-300">
              Completing this unlocks <span className="font-bold text-blue-400">Intermetropolis</span>
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
          {stations.core.find(s => s.status === 'current')?.name || 'All complete!'}
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

// Main component
export default function Basicburgh({ onNavigateToCity }) {
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
      <svg viewBox="0 0 1050 580" className="w-full h-full">
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
        
        {/* Lines */}
        <LinePath 
          points={[...stations.core.slice(0, 5), { x: 100, y: 120 }, ...stations.core.slice(5)]}
          lineConfig={lines.core}
          isUnlocked={isLineUnlocked('core')}
        />
        
        <BranchConnector from={stations.core[4]} to={stations.storage[0]}
          lineConfig={lines.storage} isUnlocked={isLineUnlocked('storage')} />
        <LinePath points={stations.storage} lineConfig={lines.storage} isUnlocked={isLineUnlocked('storage')} />
        
        <BranchConnector from={stations.core[7]} to={stations.observability[0]}
          lineConfig={lines.observability} isUnlocked={isLineUnlocked('observability')} />
        <LinePath points={stations.observability} lineConfig={lines.observability} isUnlocked={isLineUnlocked('observability')} />
        
        {/* Exit arrow to next city */}
        <g opacity="0.6">
          <path d="M 950 120 L 1020 120" stroke={theme.primary} strokeWidth="4" strokeDasharray="8,4" />
          <polygon points="1020,120 1010,112 1010,128" fill={theme.primary} />
        </g>
        
        {/* Stations */}
        {stations.core.map(station => (
          <Station key={station.id} station={station} line="core"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.storage.map(station => (
          <Station key={station.id} station={station} line="storage"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.observability.map(station => (
          <Station key={station.id} station={station} line="observability"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        
        {/* Labels */}
        {stations.core.slice(0, 5).map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="core" position="right" theme={theme} />
        ))}
        {stations.core.slice(5).map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="core" position="below" theme={theme} />
        ))}
        {stations.storage.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="storage" position="below" theme={theme} />
        ))}
        {stations.observability.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="observability" position="above" theme={theme} />
        ))}
        
        {/* Title */}
        <text x="525" y="560" textAnchor="middle" fill="#3A3A3A" fontSize="11" fontFamily="monospace">
          KASITA TRANSIT AUTHORITY • {CITY_CONFIG.name} • KUBERNETES DISTRICT
        </text>
        
        {/* Corner decorations */}
        <g opacity="0.3">
          <path d="M 20 20 L 60 20 L 60 24 L 24 24 L 24 60 L 20 60 Z" fill={theme.primary} />
          <path d="M 1030 20 L 990 20 L 990 24 L 1026 24 L 1026 60 L 1030 60 Z" fill={theme.primary} />
        </g>
      </svg>
      
      <MissionControl theme={theme} />
      <Legend theme={theme} />
      
      <DetailPanel station={selectedStation} line={selectedLine}
        onClose={handleClose} onStartLearning={handleStartLearning} theme={theme} />
    </div>
  );
}
