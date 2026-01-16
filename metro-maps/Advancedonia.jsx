import React, { useState } from 'react';

// ============================================================================
// ADVANCEDONIA - Kubernetes Advanced District
// Theme: Purple (#9D4EDD)
// ============================================================================

const CITY_CONFIG = {
  name: 'ADVANCEDONIA',
  subtitle: 'Kubernetes Advanced District',
  theme: {
    primary: '#9D4EDD',
    primaryGlow: '#C77DFF',
    secondary: '#E0AAFF',
    secondaryGlow: '#F0D6FF',
    tertiary: '#7B2CBF',
    tertiaryGlow: '#9D4EDD',
    accent: '#FF6D00',
    accentGlow: '#FF9E00',
    highlight: '#00F5D4',
    highlightGlow: '#5EEAD4',
    background: '#0A0A0A',
    gridColor: '#1A0D2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#9A9A9A',
    textMuted: '#4A4A4A',
  },
  previousCity: {
    name: 'Intermetropolis',
    direction: 'west',
    description: 'Intermediate District'
  }
};

const stations = {
  core: [
    { id: 'adv-core-1', name: 'Custom Resources', x: 80, y: 280, description: 'Extending the Kubernetes API with CRDs', prerequisites: [], knowledgeUnits: 6, estimatedMinutes: 65, status: 'locked', isEntry: true },
    { id: 'adv-core-2', name: 'Operators Fundamentals', x: 180, y: 280, description: 'Building controllers for custom resources', prerequisites: ['adv-core-1'], knowledgeUnits: 8, estimatedMinutes: 90, status: 'locked' },
    { id: 'adv-core-3', name: 'Operator SDK', x: 280, y: 280, description: 'Scaffolding and building operators', prerequisites: ['adv-core-2'], knowledgeUnits: 7, estimatedMinutes: 80, status: 'locked', unlocksLines: ['platform'], isTransfer: true },
    { id: 'adv-core-4', name: 'Advanced Scheduling', x: 400, y: 280, description: 'Affinity, taints, tolerations, priorities', prerequisites: ['adv-core-3'], knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked' },
    { id: 'adv-core-5', name: 'Cluster Autoscaling', x: 520, y: 280, description: 'Node scaling and resource optimization', prerequisites: ['adv-core-4'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked', unlocksLines: ['observability'], isTransfer: true },
    { id: 'adv-core-6', name: 'Multi-cluster', x: 640, y: 280, description: 'Federation and multi-cluster patterns', prerequisites: ['adv-core-5'], knowledgeUnits: 7, estimatedMinutes: 75, status: 'locked' },
    { id: 'adv-core-7', name: 'Service Mesh Deep Dive', x: 760, y: 280, description: 'Istio architecture and advanced patterns', prerequisites: ['adv-core-6'], knowledgeUnits: 8, estimatedMinutes: 90, status: 'locked', unlocksLines: ['extensibility'], isTransfer: true },
    { id: 'adv-core-8', name: 'Advanced Capstone', x: 920, y: 280, description: 'Build a production platform with operators', prerequisites: ['adv-core-7'], knowledgeUnits: 1, estimatedMinutes: 240, status: 'locked', isCapstone: true, isFinal: true },
  ],
  platform: [
    { id: 'plat-1', name: 'GitOps with Flux', x: 280, y: 160, description: 'Continuous delivery the GitOps way', prerequisites: ['adv-core-3'], knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked' },
    { id: 'plat-2', name: 'ArgoCD', x: 380, y: 110, description: 'Declarative GitOps for Kubernetes', prerequisites: ['plat-1'], knowledgeUnits: 6, estimatedMinutes: 65, status: 'locked' },
    { id: 'plat-3', name: 'Policy Engines', x: 500, y: 110, description: 'OPA Gatekeeper and Kyverno', prerequisites: ['plat-2'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
    { id: 'plat-4', name: 'Cost Management', x: 620, y: 110, description: 'Kubecost and resource optimization', prerequisites: ['plat-3'], knowledgeUnits: 4, estimatedMinutes: 45, status: 'locked' },
    { id: 'plat-5', name: 'Internal Developer Platform', x: 760, y: 160, description: 'Building platforms for developers', prerequisites: ['plat-4'], knowledgeUnits: 6, estimatedMinutes: 70, status: 'locked' },
  ],
  observability: [
    { id: 'obs-adv-1', name: 'Prometheus Deep Dive', x: 520, y: 400, description: 'Advanced metrics and PromQL', prerequisites: ['adv-core-5'], knowledgeUnits: 7, estimatedMinutes: 75, status: 'locked' },
    { id: 'obs-adv-2', name: 'Distributed Tracing', x: 640, y: 450, description: 'Jaeger, Zipkin, and OpenTelemetry', prerequisites: ['obs-adv-1'], knowledgeUnits: 6, estimatedMinutes: 65, status: 'locked' },
    { id: 'obs-adv-3', name: 'Audit Logging', x: 760, y: 450, description: 'Security auditing and compliance', prerequisites: ['obs-adv-2'], knowledgeUnits: 4, estimatedMinutes: 45, status: 'locked' },
    { id: 'obs-adv-4', name: 'Chaos Engineering', x: 880, y: 400, description: 'Resilience testing with Litmus', prerequisites: ['obs-adv-3'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
  ],
  extensibility: [
    { id: 'ext-1', name: 'Admission Controllers', x: 760, y: 160, description: 'Mutating and validating webhooks', prerequisites: ['adv-core-7'], knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
    { id: 'ext-2', name: 'API Aggregation', x: 860, y: 110, description: 'Extending the API server', prerequisites: ['ext-1'], knowledgeUnits: 4, estimatedMinutes: 50, status: 'locked' },
    { id: 'ext-3', name: 'Custom Schedulers', x: 960, y: 110, description: 'Building specialized schedulers', prerequisites: ['ext-2'], knowledgeUnits: 5, estimatedMinutes: 60, status: 'locked' },
  ]
};

const lines = {
  core: { name: 'Core Line', color: CITY_CONFIG.theme.primary, glowColor: CITY_CONFIG.theme.primaryGlow },
  platform: { name: 'Platform Engineering', color: CITY_CONFIG.theme.accent, glowColor: CITY_CONFIG.theme.accentGlow },
  observability: { name: 'Deep Observability', color: CITY_CONFIG.theme.highlight, glowColor: CITY_CONFIG.theme.highlightGlow },
  extensibility: { name: 'Extensibility', color: CITY_CONFIG.theme.secondary, glowColor: CITY_CONFIG.theme.secondaryGlow },
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
  const outerRadius = station.isCapstone ? 24 : station.isTransfer ? 20 : 16;
  const innerRadius = station.isCapstone ? 16 : station.isTransfer ? 12 : 10;
  
  return (
    <g onClick={() => onClick(station, line)} style={{ cursor: 'pointer' }}>
      {station.isFinal && (
        <>
          <circle cx={station.x} cy={station.y} r={outerRadius + 15}
            fill="none" stroke={theme.primary} strokeWidth="1" opacity="0.2">
            <animate attributeName="r" values={`${outerRadius + 10};${outerRadius + 20};${outerRadius + 10}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={station.x} cy={station.y} r={outerRadius + 10}
            fill="none" stroke={theme.primaryGlow} strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values={`${outerRadius + 5};${outerRadius + 15};${outerRadius + 5}`} dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      
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
      
      {isUnlocked && station.status !== 'completed' && !station.isFinal && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill={baseColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
          {station.estimatedMinutes}m
        </text>
      )}
      
      {station.isFinal && station.status !== 'completed' && (
        <text x={station.x} y={station.y + 5} textAnchor="middle"
          fill={theme.primary} fontSize="14" fontWeight="bold">★</text>
      )}
      
      {station.status === 'completed' && isUnlocked && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill="#FFFFFF" fontSize="12" fontWeight="bold">✓</text>
      )}
      
      {station.isEntry && (
        <g transform={`translate(${station.x - 55}, ${station.y - 8})`}>
          <polygon points="12,8 0,0 0,16" fill="#4361EE" opacity="0.8" />
          <text x="-75" y="12" fill={theme.textSecondary} fontSize="8" fontFamily="monospace" textAnchor="end">FROM INTERMETROPOLIS</text>
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
        fontWeight={station.status === 'current' || station.isFinal ? 'bold' : 'normal'}>
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
          {station.isFinal && (
            <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ml-2"
              style={{ backgroundColor: '#2D1B4E', color: '#C77DFF' }}>
              ★ FINAL DESTINATION
            </span>
          )}
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
          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#0A0A1A', borderColor: '#4361EE' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#4361EE' }}>⬅ Entry Point</p>
            <p className="text-sm text-gray-300">
              Connected from <span className="font-bold text-blue-400">Intermetropolis</span>
            </p>
          </div>
        )}
        
        {station.isFinal && (
          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#1A0D2E', borderColor: theme.primary }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: theme.primary }}>🏆 Mastery Achievement</p>
            <p className="text-sm text-gray-300">
              Completing this certifies you as a <span className="font-bold text-purple-400">Kubernetes Expert</span>
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
  const totalJourneyTime = 615 + 755 + 1130;
  
  return (
    <div className="absolute top-4 left-4 rounded-lg p-4 w-64 border"
      style={{ backgroundColor: '#0D0D0D', borderColor: theme.primary }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#C77DFF' }} />
        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
          Mission Control
        </h4>
      </div>
      
      <h3 className="text-xl font-black text-white mb-1">{CITY_CONFIG.name}</h3>
      <p className="text-xs mb-4" style={{ color: theme.textMuted }}>{CITY_CONFIG.subtitle}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: theme.textMuted }}>DISTRICT PROGRESS</span>
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
      
      <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#1A0D2E' }}>
        <p className="text-xs uppercase mb-2" style={{ color: theme.primary }}>Total Journey</p>
        <div className="flex gap-1 mb-2">
          <div className="flex-1 h-1 rounded" style={{ backgroundColor: '#E63946' }} title="Basicburgh" />
          <div className="flex-1 h-1 rounded" style={{ backgroundColor: '#4361EE' }} title="Intermetropolis" />
          <div className="flex-1 h-1 rounded opacity-40" style={{ backgroundColor: theme.primary }} title="Advancedonia" />
        </div>
        <p className="text-xs" style={{ color: theme.textMuted }}>
          ~{Math.round(totalJourneyTime / 60)} hours to mastery
        </p>
      </div>
      
      <div className="rounded p-3" style={{ backgroundColor: '#1A1A1A', borderLeft: `3px solid ${theme.primary}` }}>
        <p className="text-xs uppercase" style={{ color: theme.textMuted }}>Current Objective</p>
        <p className="text-sm font-medium text-white mt-1">
          {stations.core.find(s => s.status === 'current')?.name || 'Complete Intermetropolis first'}
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

// Journey status panel
const JourneyStatus = ({ theme }) => (
  <div className="absolute bottom-4 right-4 rounded-lg p-4 border"
    style={{ backgroundColor: '#0D0D0D', borderColor: '#3A3A3A' }}>
    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
      The Journey
    </h4>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E63946' }} />
        <div>
          <span className="text-sm text-gray-300">Basicburgh</span>
          <p className="text-xs text-green-500">✓ Completed</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4361EE' }} />
        <div>
          <span className="text-sm text-gray-300">Intermetropolis</span>
          <p className="text-xs text-green-500">✓ Completed</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
        <div>
          <span className="text-sm text-white font-bold">Advancedonia</span>
          <p className="text-xs" style={{ color: theme.primary }}>● In Progress</p>
        </div>
      </div>
    </div>
    
    <hr className="my-3 border-gray-800" />
    
    <div className="text-center">
      <p className="text-xs" style={{ color: theme.textMuted }}>Final Destination</p>
      <p className="text-sm font-bold" style={{ color: theme.primary }}>★ Kubernetes Expert</p>
    </div>
  </div>
);

// Main component
export default function Advancedonia({ onNavigateToCity }) {
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
      <svg viewBox="0 0 1050 520" className="w-full h-full">
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
          <radialGradient id="finalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill={theme.background} />
        <rect width="100%" height="100%" fill="url(#darkGrid)" />
        
        {/* Ambient glow around final capstone */}
        <circle cx={stations.core[7].x} cy={stations.core[7].y} r="80" fill="url(#finalGlow)" />
        
        {/* Entry arrow from Intermetropolis */}
        <g opacity="0.6">
          <path d="M 20 280 L 55 280" stroke="#4361EE" strokeWidth="4" strokeDasharray="8,4" />
          <polygon points="55,280 45,272 45,288" fill="#4361EE" />
        </g>
        
        {/* Lines */}
        <LinePath points={stations.core} lineConfig={lines.core} isUnlocked={isLineUnlocked('core')} />
        
        <BranchConnector from={stations.core[2]} to={stations.platform[0]}
          lineConfig={lines.platform} isUnlocked={isLineUnlocked('platform')} direction="up" />
        <LinePath points={stations.platform} lineConfig={lines.platform} isUnlocked={isLineUnlocked('platform')} />
        
        <BranchConnector from={stations.core[4]} to={stations.observability[0]}
          lineConfig={lines.observability} isUnlocked={isLineUnlocked('observability')} direction="down" />
        <LinePath points={stations.observability} lineConfig={lines.observability} isUnlocked={isLineUnlocked('observability')} />
        
        <BranchConnector from={stations.core[6]} to={stations.extensibility[0]}
          lineConfig={lines.extensibility} isUnlocked={isLineUnlocked('extensibility')} direction="up" />
        <LinePath points={stations.extensibility} lineConfig={lines.extensibility} isUnlocked={isLineUnlocked('extensibility')} />
        
        {/* Stations */}
        {stations.core.map(station => (
          <Station key={station.id} station={station} line="core"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.platform.map(station => (
          <Station key={station.id} station={station} line="platform"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.observability.map(station => (
          <Station key={station.id} station={station} line="observability"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        {stations.extensibility.map(station => (
          <Station key={station.id} station={station} line="extensibility"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} theme={theme} />
        ))}
        
        {/* Labels */}
        {stations.core.map((station, idx) => (
          <StationLabel key={`label-${station.id}`} station={station} line="core" 
            position={station.isFinal ? 'right' : idx % 2 === 0 ? 'below' : 'above'} theme={theme} />
        ))}
        {stations.platform.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="platform" position="above" theme={theme} />
        ))}
        {stations.observability.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="observability" position="below" theme={theme} />
        ))}
        {stations.extensibility.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="extensibility" position="above" theme={theme} />
        ))}
        
        {/* Title */}
        <text x="525" y="500" textAnchor="middle" fill="#2D1B4E" fontSize="11" fontFamily="monospace">
          KASITA TRANSIT AUTHORITY • {CITY_CONFIG.name} • KUBERNETES DISTRICT
        </text>
        
        {/* Corner decorations */}
        <g opacity="0.3">
          <path d="M 20 20 L 60 20 L 60 24 L 24 24 L 24 60 L 20 60 Z" fill={theme.primary} />
          <path d="M 1030 20 L 990 20 L 990 24 L 1026 24 L 1026 60 L 1030 60 Z" fill={theme.primary} />
        </g>
        
        {/* Final destination marker */}
        <g transform={`translate(${stations.core[7].x}, ${stations.core[7].y - 50})`}>
          <text x="0" y="0" textAnchor="middle" fill={theme.primary} fontSize="10" fontFamily="monospace" fontWeight="bold">
            ★ FINAL DESTINATION ★
          </text>
        </g>
      </svg>
      
      <MissionControl theme={theme} />
      <Legend theme={theme} />
      <JourneyStatus theme={theme} />
      
      <DetailPanel station={selectedStation} line={selectedLine}
        onClose={handleClose} onStartLearning={handleStartLearning} theme={theme} />
    </div>
  );
}
