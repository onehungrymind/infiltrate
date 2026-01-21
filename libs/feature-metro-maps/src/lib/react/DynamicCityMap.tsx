// @ts-nocheck
import React, { useState, useMemo } from 'react';
import type { MetroCityData, MetroBranch, MetroStation } from '../types';

interface DynamicCityMapProps {
  city: MetroCityData;
  onNavigateToCity?: (cityId: string) => void;
}

// Calculate positions for stations in a serpentine layout
function calculateLayout(branchData: MetroBranch[]) {
  const allStations: Array<MetroStation & { x: number; y: number; branchId: string; branchColor: string }> = [];
  const connections: Array<{ from: string; to: string; color: string }> = [];

  if (!branchData || branchData.length === 0) {
    return { stations: allStations, connections };
  }

  // Layout configuration
  const startX = 120;
  const startY = 100;
  const stationSpacingX = 160;
  const stationSpacingY = 140;
  const maxStationsPerRow = 5;

  let currentX = startX;
  let currentY = startY;
  let direction = 1; // 1 = left-to-right, -1 = right-to-left
  let stationsInCurrentRow = 0;
  let previousStation: (MetroStation & { x: number; y: number; branchId: string }) | null = null;

  // Process each branch (concept) and its stations (sub-concepts)
  branchData.forEach((branch, branchIdx) => {
    const branchStations = branch.stations || [];

    branchStations.forEach((station, stationIdx) => {
      // Check if we need to wrap to next row
      if (stationsInCurrentRow >= maxStationsPerRow) {
        // Move down and reverse direction
        currentY += stationSpacingY;
        direction *= -1;
        stationsInCurrentRow = 0;
        // Reset X based on direction
        currentX = direction === 1 ? startX : startX + (maxStationsPerRow - 1) * stationSpacingX;
      }

      const stationWithPos = {
        ...station,
        x: currentX,
        y: currentY,
        branchId: branch.id,
        branchColor: branch.color,
      };
      allStations.push(stationWithPos);

      // Create connection from previous station
      if (previousStation) {
        connections.push({
          from: previousStation.id,
          to: station.id,
          color: branch.color,
        });
      }

      previousStation = stationWithPos;

      // Move to next position
      currentX += direction * stationSpacingX;
      stationsInCurrentRow++;
    });

    // Add a small visual break between branches (concepts)
    if (branchIdx < branchData.length - 1) {
      // Optionally mark the last station of a branch as a transfer point
      if (allStations.length > 0) {
        allStations[allStations.length - 1].isTransfer = true;
      }
    }
  });

  return { stations: allStations, connections };
}

// Station component
const Station = ({ station, isSelected, onClick, cityColor }) => {
  const color = station.branchColor || cityColor;
  const glowColor = color;

  const getInnerStyle = () => {
    switch (station.status) {
      case 'completed': return { fill: color, stroke: glowColor };
      case 'current': return { fill: '#0D0D0D', stroke: color };
      case 'available': return { fill: '#0D0D0D', stroke: color };
      default: return { fill: '#1A1A1A', stroke: '#3A3A3A' };
    }
  };

  const style = getInnerStyle();
  const showPulse = station.status === 'current';
  const outerRadius = station.isCapstone ? 22 : station.isTransfer ? 20 : 16;
  const innerRadius = station.isCapstone ? 14 : station.isTransfer ? 12 : 10;
  const isUnlocked = station.status !== 'locked';

  return (
    <g onClick={() => onClick(station)} style={{ cursor: 'pointer' }}>
      {isUnlocked && (
        <circle cx={station.x} cy={station.y} r={outerRadius + 4}
          fill="none" stroke={glowColor} strokeWidth="1" opacity="0.3" filter="url(#glow)" />
      )}

      {showPulse && (
        <circle cx={station.x} cy={station.y} r={outerRadius}
          fill="none" stroke={color} strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values={`${outerRadius};${outerRadius + 12};${outerRadius}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {isSelected && (
        <circle cx={station.x} cy={station.y} r={outerRadius + 6}
          fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.8" />
      )}

      <circle cx={station.x} cy={station.y} r={outerRadius}
        fill="#0D0D0D" stroke={isUnlocked ? color : '#3A3A3A'} strokeWidth="3" />

      <circle cx={station.x} cy={station.y} r={innerRadius}
        fill={style.fill} stroke={style.stroke} strokeWidth="2" />

      {station.status === 'current' && !station.isCapstone && station.estimatedMinutes && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill={color} fontSize="8" fontWeight="bold" fontFamily="monospace">
          {station.estimatedMinutes}m
        </text>
      )}

      {station.status === 'completed' && isUnlocked && (
        <text x={station.x} y={station.y + 4} textAnchor="middle"
          fill="#FFFFFF" fontSize="12" fontWeight="bold">✓</text>
      )}

      {station.isCapstone && station.status !== 'completed' && (
        <text x={station.x} y={station.y + 5} textAnchor="middle"
          fill={isUnlocked ? color : '#3A3A3A'} fontSize="14" fontWeight="bold">★</text>
      )}
    </g>
  );
};

// Station label - split into up to three lines for better readability
const StationLabel = ({ station, cityColor }) => {
  const color = station.branchColor || cityColor;
  const isUnlocked = station.status !== 'locked';
  const units = station.knowledgeUnits || 0;

  // Split name into up to three lines - wider max length
  const maxLineLength = 18;
  const lines: string[] = [];
  const words = station.name.split(' ');

  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxLineLength) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to 3 lines, truncate last line if needed
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, maxLineLength - 3) + '...';
  }

  const baseY = station.y + 42;
  const lineHeight = 11;

  return (
    <g>
      {lines.map((line, idx) => (
        <text key={idx} x={station.x} y={baseY + idx * lineHeight} textAnchor="middle"
          fill={isUnlocked ? '#FFFFFF' : '#4A4A4A'}
          fontSize="9" fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight={station.status === 'current' ? 'bold' : 'normal'}>
          {line}
        </text>
      ))}
      <text x={station.x} y={baseY + lines.length * lineHeight} textAnchor="middle"
        fill={isUnlocked ? color : '#3A3A3A'}
        fontSize="8" fontFamily="monospace">
        {units} {units === 1 ? 'unit' : 'units'}
      </text>
    </g>
  );
};

// Connection line between stations
const ConnectionLine = ({ fromStation, toStation, color }) => {
  const pathData = `M ${fromStation.x} ${fromStation.y} L ${toStation.x} ${toStation.y}`;
  const glowColor = color;

  return (
    <g>
      <path d={pathData} fill="none" stroke={glowColor} strokeWidth="12"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.2" filter="url(#glow)" />
      <path d={pathData} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// Mission control panel
const MissionControl = ({ city, stations }) => {
  const totalStations = stations.length;
  const completedStations = stations.filter(s => s.status === 'completed').length;
  const percentage = totalStations > 0 ? Math.round((completedStations / totalStations) * 100) : 0;
  const currentStation = stations.find(s => s.status === 'current');

  return (
    <div style={{
      position: 'absolute', top: 16, left: 16, width: 240,
      backgroundColor: '#0D0D0D', borderRadius: 8, padding: 16,
      border: `2px solid ${city.color}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#40C057', animation: 'pulse 2s infinite' }} />
        <h4 style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: '#9A9A9A', margin: 0 }}>
          Mission Control
        </h4>
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px 0' }}>{city.name.toUpperCase()}</h3>
      <p style={{ fontSize: 11, color: '#4A4A4A', margin: '0 0 16px 0' }}>{city.subtitle}</p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: '#4A4A4A' }}>PROGRESS</span>
          <span style={{ fontFamily: 'monospace', color: city.color }}>{percentage}%</span>
        </div>
        <div style={{ width: '100%', height: 8, backgroundColor: '#1A1A1A', borderRadius: 4 }}>
          <div style={{ width: `${percentage}%`, height: 8, backgroundColor: city.color, borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ backgroundColor: '#1A1A1A', borderRadius: 4, padding: 8 }}>
          <p style={{ fontSize: 10, color: '#4A4A4A', margin: 0 }}>STATIONS</p>
          <p style={{ fontFamily: 'monospace', color: 'white', margin: '2px 0 0 0' }}>{completedStations}/{totalStations}</p>
        </div>
        <div style={{ backgroundColor: '#1A1A1A', borderRadius: 4, padding: 8 }}>
          <p style={{ fontSize: 10, color: '#4A4A4A', margin: 0 }}>BRANCHES</p>
          <p style={{ fontFamily: 'monospace', color: 'white', margin: '2px 0 0 0' }}>{city.branches}</p>
        </div>
      </div>

      {currentStation && (
        <div style={{ backgroundColor: '#1A1A1A', borderRadius: 4, padding: 12, borderLeft: `3px solid ${city.color}` }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', color: '#4A4A4A', margin: 0 }}>Current Objective</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '4px 0 0 0' }}>{currentStation.name}</p>
        </div>
      )}
    </div>
  );
};

// Legend showing station status - positioned higher to stay on screen
const Legend = ({ cityColor }) => (
  <div style={{
    position: 'absolute', bottom: 80, left: 16,
    backgroundColor: '#0D0D0D', borderRadius: 8, padding: 16,
    border: '1px solid #3A3A3A'
  }}>
    <h4 style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: '#4A4A4A', margin: '0 0 12px 0' }}>
      Station Status
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: cityColor }} />
        <span style={{ fontSize: 11, color: '#9A9A9A' }}>Completed</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${cityColor}`, backgroundColor: '#0D0D0D' }} />
        <span style={{ fontSize: 11, color: '#9A9A9A' }}>Available</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #3A3A3A', backgroundColor: '#1A1A1A' }} />
        <span style={{ fontSize: 11, color: '#9A9A9A' }}>Locked</span>
      </div>
    </div>
  </div>
);

// Detail panel for selected station
const DetailPanel = ({ station, onClose, cityColor }) => {
  if (!station) return null;

  const color = station.branchColor || cityColor;
  const isUnlocked = station.status !== 'locked';
  const canStart = isUnlocked && (station.status === 'current' || station.status === 'available');

  const getStatusBadge = () => {
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
      border: `2px solid ${isUnlocked ? color : '#3A3A3A'}`,
      boxShadow: `0 0 40px ${isUnlocked ? color + '40' : '#00000080'}`,
      zIndex: 100
    }}>
      <div style={{ padding: 16, borderBottom: `2px solid ${isUnlocked ? color : '#3A3A3A'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: isUnlocked ? color : '#4A4A4A', margin: 0 }}>
              Station
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

        {station.description && (
          <p style={{ color: '#9A9A9A', fontSize: 14, margin: '16px 0' }}>{station.description}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {station.estimatedMinutes && (
            <div style={{ backgroundColor: '#1A1A1A', borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', color: color, margin: 0 }}>Time</p>
              <p style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: 'white', margin: '4px 0 0 0' }}>{station.estimatedMinutes}m</p>
            </div>
          )}
          {station.knowledgeUnits && (
            <div style={{ backgroundColor: '#1A1A1A', borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', color: color, margin: 0 }}>Units</p>
              <p style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: 'white', margin: '4px 0 0 0' }}>{station.knowledgeUnits}</p>
            </div>
          )}
        </div>

        {canStart && (
          <button style={{
            width: '100%', padding: 12, borderRadius: 8, border: 'none',
            backgroundColor: color, color: 'white',
            fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12,
            cursor: 'pointer'
          }}>
            {station.status === 'current' ? 'Continue Learning' : 'Begin Learning'}
          </button>
        )}
      </div>
    </div>
  );
};

// Main DynamicCityMap component
export default function DynamicCityMap({ city, onNavigateToCity }: DynamicCityMapProps) {
  const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);

  const { stations, connections } = useMemo(() => {
    return calculateLayout(city.branchData || []);
  }, [city.branchData]);

  // Create a map for quick station lookup
  const stationMap = useMemo(() => {
    const map = new Map();
    stations.forEach(s => map.set(s.id, s));
    return map;
  }, [stations]);

  const handleStationClick = (station: MetroStation) => {
    setSelectedStation(station);
  };

  const handleClose = () => {
    setSelectedStation(null);
  };

  // Calculate viewBox based on stations - ensure enough room for labels
  const viewBox = useMemo(() => {
    if (stations.length === 0) return "0 0 1100 600";
    const xs = stations.map(s => s.x);
    const ys = stations.map(s => s.y);
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 120; // Space for 3-line labels + units
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [stations]);

  // Empty state
  if (!city.branchData || city.branchData.length === 0) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6A6A6A' }}>
          <h3 style={{ color: city.color, marginBottom: 8 }}>{city.name}</h3>
          <p>No concepts loaded for this tier</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <svg viewBox={viewBox} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map((conn, idx) => {
          const fromStation = stationMap.get(conn.from);
          const toStation = stationMap.get(conn.to);
          if (!fromStation || !toStation) return null;
          return (
            <ConnectionLine
              key={`conn-${idx}`}
              fromStation={fromStation}
              toStation={toStation}
              color={conn.color}
            />
          );
        })}

        {/* Stations */}
        {stations.map(station => (
          <Station
            key={station.id}
            station={station}
            isSelected={selectedStation?.id === station.id}
            onClick={handleStationClick}
            cityColor={city.color}
          />
        ))}

        {/* Station labels */}
        {stations.map(station => (
          <StationLabel
            key={`label-${station.id}`}
            station={station}
            cityColor={city.color}
          />
        ))}

      </svg>

      <MissionControl city={city} stations={stations} />
      <Legend cityColor={city.color} />

      {/* Footer - positioned at bottom of screen, aligned with legend */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#2A2A2A',
        fontSize: 11,
        fontFamily: 'monospace',
        whiteSpace: 'nowrap'
      }}>
        KASITA TRANSIT AUTHORITY • {city.name.toUpperCase()} • {city.subtitle.toUpperCase()}
      </div>

      <DetailPanel station={selectedStation} onClose={handleClose} cityColor={city.color} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
