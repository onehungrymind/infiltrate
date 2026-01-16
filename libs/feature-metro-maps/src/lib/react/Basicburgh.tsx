// @ts-nocheck
import React, { useState } from 'react';

// ============================================================================
// BASICBURGH - Kubernetes Fundamentals District
// Serpentine Layout - Single File Preview Version
// ============================================================================

const THEME = {
  primary: '#E63946',
  primaryGlow: '#FF6B6B',
  secondary: '#F4A3A8',
  secondaryGlow: '#FFB8BC',
  tertiary: '#C9434E',
  tertiaryGlow: '#E8666F',
  background: '#0A0A0A',
  gridColor: '#1A1A1A',
};

// Serpentine layout: flows right, then down-left, then right to finish
const stations = {
  core: [
    // Row 1: Left to Right (stations 1-4)
    { id: 'core-1', name: 'Container Fundamentals', x: 120, y: 120, description: 'Understanding containerization and why Kubernetes exists', knowledgeUnits: 4, estimatedMinutes: 45, status: 'completed' },
    { id: 'core-2', name: 'Cluster Architecture', x: 280, y: 120, description: 'Control plane, worker nodes, etcd, and API server', knowledgeUnits: 6, estimatedMinutes: 60, status: 'completed' },
    { id: 'core-3', name: 'Pods', x: 440, y: 120, description: 'The atomic unit of deployment in Kubernetes', knowledgeUnits: 5, estimatedMinutes: 50, status: 'completed' },
    { id: 'core-4', name: 'ReplicaSets', x: 600, y: 120, description: 'Scaling pods and ensuring availability', knowledgeUnits: 4, estimatedMinutes: 40, status: 'completed', isTransfer: true, unlocksLines: ['observability'] },

    // Turn down
    { id: 'core-5', name: 'Deployments', x: 600, y: 260, description: 'Declarative updates, rollbacks, and scaling strategies', knowledgeUnits: 6, estimatedMinutes: 55, status: 'current', isTransfer: true, unlocksLines: ['storage'] },

    // Row 2: Right to Left (stations 6-9)
    { id: 'core-6', name: 'Services', x: 440, y: 260, description: 'ClusterIP, NodePort, LoadBalancer networking', knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
    { id: 'core-7', name: 'Ingress', x: 280, y: 260, description: 'HTTP routing, TLS termination, external access', knowledgeUnits: 5, estimatedMinutes: 55, status: 'locked' },
    { id: 'core-8', name: 'ConfigMaps & Secrets', x: 120, y: 260, description: 'Externalized configuration management', knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked' },

    // Turn down
    { id: 'core-9', name: 'Namespaces', x: 120, y: 400, description: 'Logical isolation and multi-tenancy basics', knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },

    // Row 3: Left to Right (stations 10-12)
    { id: 'core-10', name: 'kubectl Mastery', x: 280, y: 400, description: 'Essential CLI commands and productivity patterns', knowledgeUnits: 8, estimatedMinutes: 70, status: 'locked' },
    { id: 'core-11', name: 'Troubleshooting', x: 440, y: 400, description: 'Logs, describe, exec, port-forward, and debugging', knowledgeUnits: 6, estimatedMinutes: 60, status: 'locked' },
    { id: 'core-12', name: 'Fundamentals Capstone', x: 600, y: 400, description: 'Deploy a complete multi-tier application', knowledgeUnits: 1, estimatedMinutes: 120, status: 'locked', isCapstone: true },
  ],
  storage: [
    // Branch down-right from Deployments
    { id: 'storage-1', name: 'Volumes', x: 700, y: 320, description: 'emptyDir, hostPath, and volume basics', knowledgeUnits: 4, estimatedMinutes: 40, status: 'available' },
    { id: 'storage-2', name: 'PersistentVolumes', x: 800, y: 380, description: 'Cluster-provisioned storage resources', knowledgeUnits: 5, estimatedMinutes: 50, status: 'locked' },
    { id: 'storage-3', name: 'PVCs', x: 900, y: 320, description: 'Claiming and binding storage to pods', knowledgeUnits: 4, estimatedMinutes: 40, status: 'locked' },
    { id: 'storage-4', name: 'StorageClasses', x: 1000, y: 260, description: 'Dynamic provisioning and storage tiers', knowledgeUnits: 4, estimatedMinutes: 45, status: 'locked' },
  ],
  observability: [
    // Branch up-right from ReplicaSets
    { id: 'obs-1', name: 'Resource Metrics', x: 700, y: 60, description: 'CPU and memory monitoring basics', knowledgeUnits: 4, estimatedMinutes: 35, status: 'locked' },
    { id: 'obs-2', name: 'Liveness Probes', x: 820, y: 60, description: 'Health checks and automatic restarts', knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
    { id: 'obs-3', name: 'Readiness Probes', x: 940, y: 60, description: 'Traffic routing based on pod health', knowledgeUnits: 3, estimatedMinutes: 30, status: 'locked' },
  ]
};

const lines = {
  core: { name: 'Core Line', color: THEME.primary, glowColor: THEME.primaryGlow },
  storage: { name: 'Storage Branch', color: THEME.secondary, glowColor: THEME.secondaryGlow },
  observability: { name: 'Observability Branch', color: THEME.tertiary, glowColor: THEME.tertiaryGlow },
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
const Station = ({ station, line, isSelected, onClick }) => {
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

      {isUnlocked && station.status !== 'completed' && !station.isCapstone && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill={baseColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
          {station.estimatedMinutes}m
        </text>
      )}

      {station.status === 'completed' && isUnlocked && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill="#FFFFFF" fontSize="12" fontWeight="bold">✓</text>
      )}

      {station.isCapstone && station.status !== 'completed' && (
        <text x={station.x} y={station.y + 5} textAnchor="middle"
          fill={isUnlocked ? baseColor : '#3A3A3A'} fontSize="14" fontWeight="bold">★</text>
      )}
    </g>
  );
};

// Station label with smart positioning
const StationLabel = ({ station, line, position = 'below' }) => {
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
        fill={isUnlocked ? '#FFFFFF' : '#4A4A4A'}
        fontSize="10" fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight={station.status === 'current' ? 'bold' : 'normal'}>
        {station.name}
      </text>
      <text x={pos.x} y={pos.y + 12} textAnchor={pos.anchor}
        fill={isUnlocked ? lineConfig.color : '#3A3A3A'}
        fontSize="8" fontFamily="monospace">
        {station.knowledgeUnits} units
      </text>
    </g>
  );
};

// Serpentine path for core line
const CoreLinePath = ({ stations, lineConfig, isUnlocked }) => {
  const color = isUnlocked ? lineConfig.color : '#2A2A2A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#2A2A2A';

  // Build serpentine path
  // Row 1: stations 0-3, then down
  // Row 2: stations 4-7 (reversed direction), then down
  // Row 3: stations 8-11
  const core = stations.core;

  const pathData = `
    M ${core[0].x} ${core[0].y}
    L ${core[1].x} ${core[1].y}
    L ${core[2].x} ${core[2].y}
    L ${core[3].x} ${core[3].y}
    L ${core[4].x} ${core[4].y}
    L ${core[5].x} ${core[5].y}
    L ${core[6].x} ${core[6].y}
    L ${core[7].x} ${core[7].y}
    L ${core[8].x} ${core[8].y}
    L ${core[9].x} ${core[9].y}
    L ${core[10].x} ${core[10].y}
    L ${core[11].x} ${core[11].y}
  `;

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

// Branch line path
const BranchPath = ({ points, lineConfig, isUnlocked }) => {
  if (points.length < 2) return null;
  const pathData = points.reduce((acc, point, idx) =>
    idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`, '');
  const color = isUnlocked ? lineConfig.color : '#2A2A2A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#2A2A2A';

  return (
    <g>
      {isUnlocked && (
        <path d={pathData} fill="none" stroke={glowColor} strokeWidth="10"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.2" filter="url(#glow)" />
      )}
      <path d={pathData} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// Branch connector from main line
const BranchConnector = ({ from, to, lineConfig, isUnlocked }) => {
  const color = isUnlocked ? lineConfig.color : '#2A2A2A';
  const glowColor = isUnlocked ? lineConfig.glowColor : '#2A2A2A';
  const pathData = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  return (
    <g>
      {isUnlocked && (
        <path d={pathData} fill="none" stroke={glowColor} strokeWidth="10"
          strokeLinecap="round" opacity="0.2" filter="url(#glow)" />
      )}
      <path d={pathData} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" />
    </g>
  );
};

// Detail panel
const DetailPanel = ({ station, line, onClose }) => {
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
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 340,
      backgroundColor: '#0D0D0D',
      borderRadius: 12,
      overflow: 'hidden',
      border: `2px solid ${lineUnlocked ? lineConfig.color : '#3A3A3A'}`,
      boxShadow: `0 0 40px ${lineUnlocked ? lineConfig.color + '40' : '#00000080'}`,
      zIndex: 100
    }}>
      <div style={{ padding: 16, borderBottom: `2px solid ${lineUnlocked ? lineConfig.color : '#3A3A3A'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: lineUnlocked ? lineConfig.color : '#4A4A4A', margin: 0 }}>
              {lineConfig.name}
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', color: 'white', margin: '4px 0 0 0' }}>{station.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <span style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 4,
          fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
          backgroundColor: status.bg, color: status.color
        }}>
          {status.text}
        </span>

        <p style={{ color: '#9A9A9A', fontSize: 14, margin: '16px 0' }}>{station.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', color: lineConfig.color, margin: 0 }}>Time</p>
            <p style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: 'white', margin: '4px 0 0 0' }}>{station.estimatedMinutes}m</p>
          </div>
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', color: lineConfig.color, margin: 0 }}>Units</p>
            <p style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: 'white', margin: '4px 0 0 0' }}>{station.knowledgeUnits}</p>
          </div>
        </div>

        {station.unlocksLines && station.unlocksLines.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#1A1A0A', border: '1px solid #3D3410' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', color: '#FAB005', margin: 0 }}>Unlocks New Line</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#FFE066', margin: '4px 0 0 0' }}>
              {station.unlocksLines.map(l => lines[l].name).join(', ')}
            </p>
          </div>
        )}

        {canStart && (
          <button style={{
            width: '100%', padding: 12, borderRadius: 8, border: 'none',
            backgroundColor: lineConfig.color, color: 'white',
            fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12,
            cursor: 'pointer'
          }}>
            {station.status === 'current' ? 'Continue Mission' : 'Begin Mission'}
          </button>
        )}
      </div>
    </div>
  );
};

// Mission control panel
const MissionControl = () => {
  const totalStations = stations.core.length;
  const completedStations = stations.core.filter(s => s.status === 'completed').length;
  const percentage = Math.round((completedStations / totalStations) * 100);

  return (
    <div style={{
      position: 'absolute', top: 16, left: 16, width: 240,
      backgroundColor: '#0D0D0D', borderRadius: 8, padding: 16,
      border: `2px solid ${THEME.primary}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#40C057', animation: 'pulse 2s infinite' }} />
        <h4 style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: '#9A9A9A', margin: 0 }}>
          Mission Control
        </h4>
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px 0' }}>BASICBURGH</h3>
      <p style={{ fontSize: 11, color: '#4A4A4A', margin: '0 0 16px 0' }}>Kubernetes Fundamentals District</p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: '#4A4A4A' }}>PROGRESS</span>
          <span style={{ fontFamily: 'monospace', color: THEME.primary }}>{percentage}%</span>
        </div>
        <div style={{ width: '100%', height: 8, backgroundColor: '#1A1A1A', borderRadius: 4 }}>
          <div style={{ width: `${percentage}%`, height: 8, backgroundColor: THEME.primary, borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ backgroundColor: '#1A1A1A', borderRadius: 4, padding: 8 }}>
          <p style={{ fontSize: 10, color: '#4A4A4A', margin: 0 }}>STATIONS</p>
          <p style={{ fontFamily: 'monospace', color: 'white', margin: '2px 0 0 0' }}>{completedStations}/{totalStations}</p>
        </div>
        <div style={{ backgroundColor: '#1A1A1A', borderRadius: 4, padding: 8 }}>
          <p style={{ fontSize: 10, color: '#4A4A4A', margin: 0 }}>TIME</p>
          <p style={{ fontFamily: 'monospace', color: 'white', margin: '2px 0 0 0' }}>195m</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1A1A1A', borderRadius: 4, padding: 12, borderLeft: `3px solid ${THEME.primary}` }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', color: '#4A4A4A', margin: 0 }}>Current Objective</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '4px 0 0 0' }}>Deployments</p>
      </div>
    </div>
  );
};

// Legend
const Legend = () => (
  <div style={{
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: '#0D0D0D', borderRadius: 8, padding: 16,
    border: '1px solid #3A3A3A'
  }}>
    <h4 style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: '#4A4A4A', margin: '0 0 12px 0' }}>
      Transit Lines
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Object.entries(lines).map(([key, config]) => {
        const unlocked = isLineUnlocked(key);
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 8, borderRadius: 4, backgroundColor: unlocked ? config.color : '#2A2A2A' }} />
            <span style={{ fontSize: 11, color: unlocked ? '#9A9A9A' : '#4A4A4A' }}>{config.name}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// Next destination indicator
const NextDestination = () => (
  <div style={{
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: '#0D0D0D', borderRadius: 8, padding: 16,
    border: '1px solid #3A3A3A'
  }}>
    <h4 style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: '#4A4A4A', margin: '0 0 12px 0' }}>
      Next Destination
    </h4>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4361EE' }} />
      <div>
        <span style={{ fontSize: 13, color: '#9A9A9A' }}>Intermetropolis</span>
        <p style={{ fontSize: 10, color: '#4A4A4A', margin: '2px 0 0 0' }}>Intermediate</p>
      </div>
    </div>
  </div>
);

// Main component
export default function Basicburgh() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const handleStationClick = (station, line) => {
    setSelectedStation(station);
    setSelectedLine(line);
  };

  const handleClose = () => {
    setSelectedStation(null);
    setSelectedLine(null);
  };

  // Label positions based on row
  const getLabelPosition = (station, idx) => {
    // Row 1 (idx 0-3): below
    if (idx <= 3) return 'below';
    // Turns (idx 4, 8): right
    if (idx === 4) return 'right';
    // Row 2 (idx 5-7): above
    if (idx >= 5 && idx <= 7) return 'above';
    // Turn (idx 8): right
    if (idx === 8) return 'right';
    // Row 3 (idx 9-11): below
    return 'below';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: THEME.background, overflow: 'hidden' }}>
      <svg viewBox="0 0 1100 500" style={{ width: '100%', height: '100%' }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <pattern id="darkGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={THEME.gridColor} strokeWidth="0.5"/>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={THEME.background} />
        <rect width="100%" height="100%" fill="url(#darkGrid)" />

        {/* Core serpentine line */}
        <CoreLinePath stations={stations} lineConfig={lines.core} isUnlocked={true} />

        {/* Observability branch (from ReplicaSets - station 4) */}
        <BranchConnector
          from={stations.core[3]}
          to={stations.observability[0]}
          lineConfig={lines.observability}
          isUnlocked={isLineUnlocked('observability')}
        />
        <BranchPath
          points={stations.observability}
          lineConfig={lines.observability}
          isUnlocked={isLineUnlocked('observability')}
        />

        {/* Storage branch (from Deployments - station 5) */}
        <BranchConnector
          from={stations.core[4]}
          to={stations.storage[0]}
          lineConfig={lines.storage}
          isUnlocked={isLineUnlocked('storage')}
        />
        <BranchPath
          points={stations.storage}
          lineConfig={lines.storage}
          isUnlocked={isLineUnlocked('storage')}
        />

        {/* Core stations */}
        {stations.core.map((station, idx) => (
          <Station key={station.id} station={station} line="core"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} />
        ))}

        {/* Observability stations */}
        {stations.observability.map(station => (
          <Station key={station.id} station={station} line="observability"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} />
        ))}

        {/* Storage stations */}
        {stations.storage.map(station => (
          <Station key={station.id} station={station} line="storage"
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick} />
        ))}

        {/* Core labels */}
        {stations.core.map((station, idx) => (
          <StationLabel key={`label-${station.id}`} station={station} line="core"
            position={getLabelPosition(station, idx)} />
        ))}

        {/* Observability labels */}
        {stations.observability.map(station => (
          <StationLabel key={`label-${station.id}`} station={station} line="observability" position="above" />
        ))}

        {/* Storage labels */}
        {stations.storage.map((station, idx) => (
          <StationLabel key={`label-${station.id}`} station={station} line="storage"
            position={idx === 1 ? 'below' : 'above'} />
        ))}

        {/* Exit indicator to next city */}
        <g opacity="0.4">
          <path d={`M ${stations.core[11].x + 30} ${stations.core[11].y} L ${stations.core[11].x + 80} ${stations.core[11].y}`}
            stroke="#4361EE" strokeWidth="4" strokeDasharray="8,4" />
          <polygon points={`${stations.core[11].x + 80},${stations.core[11].y} ${stations.core[11].x + 70},${stations.core[11].y - 8} ${stations.core[11].x + 70},${stations.core[11].y + 8}`}
            fill="#4361EE" />
          <text x={stations.core[11].x + 90} y={stations.core[11].y + 4} fill="#4361EE" fontSize="10" fontFamily="monospace">
            TO INTERMETROPOLIS
          </text>
        </g>

        {/* Title */}
        <text x="550" y="480" textAnchor="middle" fill="#2A2A2A" fontSize="11" fontFamily="monospace">
          KASITA TRANSIT AUTHORITY • BASICBURGH • KUBERNETES FUNDAMENTALS DISTRICT
        </text>

        {/* Corner decorations */}
        <g opacity="0.3">
          <path d="M 20 20 L 60 20 L 60 24 L 24 24 L 24 60 L 20 60 Z" fill={THEME.primary} />
          <path d="M 1080 20 L 1040 20 L 1040 24 L 1076 24 L 1076 60 L 1080 60 Z" fill={THEME.primary} />
        </g>
      </svg>

      <MissionControl />
      <Legend />
      <NextDestination />

      <DetailPanel station={selectedStation} line={selectedLine} onClose={handleClose} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
