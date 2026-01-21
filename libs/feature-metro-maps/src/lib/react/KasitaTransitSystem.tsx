// @ts-nocheck
import React, { useState, useMemo } from 'react';
import type { MetroCityData, MetroMapsProps } from '../types';

import Advancedonia from './Advancedonia';
import Basicburgh from './Basicburgh';
import DynamicCityMap from './DynamicCityMap';
import Intermetropolis from './Intermetropolis';

// ============================================================================
// KASITA TRANSIT SYSTEM - Container Component
// Composes all three city maps with navigation
// Uses DynamicCityMap when branchData is provided, otherwise falls back to
// hardcoded demo components.
// ============================================================================

// Default city data (used when no props provided - demo mode)
const defaultCities: MetroCityData[] = [
  {
    id: 'basicburgh',
    name: 'Basicburgh',
    subtitle: 'Fundamentals',
    color: '#E63946',
    stations: 12,
    branches: 3,
    status: 'in-progress',
    progress: 42,
  },
  {
    id: 'intermetropolis',
    name: 'Intermetropolis',
    subtitle: 'Intermediate',
    color: '#4361EE',
    stations: 17,
    branches: 4,
    status: 'in-progress',
    progress: 0,
  },
  {
    id: 'advancedonia',
    name: 'Advancedonia',
    subtitle: 'Advanced',
    color: '#9D4EDD',
    stations: 20,
    branches: 4,
    status: 'in-progress',
    progress: 0,
  },
];

// Hardcoded city components for demo mode (when no branchData provided)
const demoCityComponents = {
  basicburgh: Basicburgh,
  intermetropolis: Intermetropolis,
  advancedonia: Advancedonia,
};

// City selector tab
const CityTab = ({ city, isActive, isLocked, onClick }) => (
  <button
    onClick={() => !isLocked && onClick(city.id)}
    className={`
      relative px-8 py-2 rounded-t-lg transition-all duration-300
      ${isActive ? 'z-10' : 'z-0'}
      ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-90'}
    `}
    style={{
      backgroundColor: isActive ? city.color : '#1A1A1A',
      borderBottom: isActive ? 'none' : `2px solid ${city.color}`,
    }}
  >
    <div className="flex items-center gap-2">
      {isLocked && <span className="text-gray-500">🔒</span>}
      <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
        {city.name}
      </p>
      {city.status === 'completed' && (
        <span className="text-green-400">✓</span>
      )}
      {city.status === 'in-progress' && city.progress > 0 && (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: isActive ? 'white' : city.color }}>
          {city.progress}%
        </span>
      )}
    </div>
  </button>
);

// Mini system map showing all cities
const SystemOverview = ({ cities, activeCity, onCitySelect, title }) => (
  <div className="absolute top-4 right-4 rounded-lg border z-50"
    style={{ backgroundColor: '#0D0D0D', borderColor: '#3A3A3A' }}>
    <div className="px-4 pt-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
        {title}
      </h4>
    </div>

    {/* Mini map container - line + nodes */}
    <div className="relative mb-3 h-[40px]">
      {/* Connection line - full width */}
      <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-[#3A3A3A]" />

      {/* City nodes centered on the line */}
      <div className="relative flex justify-between px-4 h-full items-center">
      {cities.map((city) => {
        const isActive = activeCity === city.id;
        const isAccessible = city.status !== 'locked';

        return (
          <div
            key={city.id}
            onClick={() => isAccessible && onCitySelect(city.id)}
            className="flex items-center justify-center"
            style={{ cursor: isAccessible ? 'pointer' : 'not-allowed' }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              {/* Pulse for active */}
              {isActive && (
                <circle cx={20} cy={20} r={16} fill="none" stroke={city.color} strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node */}
              <circle
                cx={20} cy={20} r={12}
                fill={isAccessible ? city.color : '#2A2A2A'}
                stroke={isActive ? '#FFFFFF' : 'none'}
                strokeWidth={isActive ? 2 : 0}
                opacity={isAccessible ? 1 : 0.5}
              />

              {/* Status indicator */}
              {city.status === 'completed' && (
                <text x={20} y={24} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">✓</text>
              )}
              {city.status === 'in-progress' && (
                <text x={20} y={24} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                  {city.progress}%
                </text>
              )}
              {city.status === 'locked' && (
                <text x={20} y={24} textAnchor="middle" fill="#6A6A6A" fontSize="8">🔒</text>
              )}
            </svg>
          </div>
        );
      })}
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 text-center px-4 pb-4">
      {cities.map(city => (
        <div key={city.id} className={activeCity === city.id ? 'opacity-100' : 'opacity-50'}>
          <p className="text-xs font-mono" style={{ color: city.color }}>{city.stations}</p>
          <p className="text-xs text-gray-600">stations</p>
        </div>
      ))}
    </div>
  </div>
);

// Navigation arrows
const CityNavigation = ({ currentCity, cities, onNavigate }) => {
  const currentIndex = cities.findIndex(c => c.id === currentCity);
  const prevCity = currentIndex > 0 ? cities[currentIndex - 1] : null;
  const nextCity = currentIndex < cities.length - 1 ? cities[currentIndex + 1] : null;
  
  return (
    <>
      {/* Previous city arrow */}
      {prevCity && prevCity.status !== 'locked' && (
        <button
          onClick={() => onNavigate(prevCity.id)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-lg transition-all hover:scale-110 z-50"
          style={{ backgroundColor: '#0D0D0D', border: `2px solid ${prevCity.color}` }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: prevCity.color }}>◀</span>
            <div className="text-left">
              <p className="text-xs text-gray-500">Previous</p>
              <p className="text-sm font-bold" style={{ color: prevCity.color }}>{prevCity.name}</p>
            </div>
          </div>
        </button>
      )}
      
      {/* Next city arrow */}
      {nextCity && (
        <button
          onClick={() => nextCity.status !== 'locked' && onNavigate(nextCity.id)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-lg transition-all z-50
            ${nextCity.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          style={{ backgroundColor: '#0D0D0D', border: `2px solid ${nextCity.status === 'locked' ? '#3A3A3A' : nextCity.color}` }}
        >
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {nextCity.status === 'locked' ? '🔒 Complete current to unlock' : 'Next'}
              </p>
              <p className="text-sm font-bold" style={{ color: nextCity.status === 'locked' ? '#6A6A6A' : nextCity.color }}>
                {nextCity.name}
              </p>
            </div>
            <span style={{ color: nextCity.status === 'locked' ? '#6A6A6A' : nextCity.color }}>▶</span>
          </div>
        </button>
      )}
    </>
  );
};

// Main container component
export default function KasitaTransitSystem({
  pathName = 'Kubernetes Transit System',
  cities: propCities,
}: MetroMapsProps) {
  const [activeCity, setActiveCity] = useState('basicburgh');

  // Use props if provided, otherwise use defaults
  const cities = useMemo(() => {
    const cityData = propCities && propCities.length > 0 ? propCities : defaultCities;
    return cityData;
  }, [propCities]);

  // Check if we have dynamic data (branchData) - if so, use DynamicCityMap
  const hasDynamicData = useMemo(() => {
    return cities.some(city => city.branchData && city.branchData.length > 0);
  }, [cities]);

  const handleCityChange = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    if (city && city.status !== 'locked') {
      setActiveCity(cityId);
    }
  };

  const activeCity_ = cities.find(c => c.id === activeCity);
  // Use DynamicCityMap for dynamic data, fall back to demo components otherwise
  const DemoCityComponent = demoCityComponents[activeCity] || null;
  
  return (
    <div className="relative w-full h-screen overflow-hidden" style={{
        backgroundColor: '#0A0A0A',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%231A1A1A' stroke-width='0.5'/%3E%3C/svg%3E")`
      }}>
      {/* City tabs */}
      <div className="absolute top-0 left-0 right-0 z-40 flex justify-center pt-2 gap-1">
        {cities.map(city => (
          <CityTab
            key={city.id}
            city={city}
            isActive={activeCity === city.id}
            isLocked={city.status === 'locked'}
            onClick={handleCityChange}
          />
        ))}
      </div>

      {/* Active city map */}
      <div className="w-full h-full pt-14">
        {hasDynamicData && activeCity_ ? (
          <DynamicCityMap city={activeCity_} onNavigateToCity={handleCityChange} />
        ) : DemoCityComponent ? (
          <DemoCityComponent onNavigateToCity={handleCityChange} />
        ) : null}
      </div>
      
      {/* System overview mini-map */}
      <SystemOverview
        cities={cities}
        activeCity={activeCity}
        onCitySelect={handleCityChange}
        title={pathName}
      />
      
      {/* Navigation arrows */}
      <CityNavigation 
        currentCity={activeCity}
        cities={cities}
        onNavigate={handleCityChange}
      />
      
      {/* Global progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 z-50">
        <div className="h-full flex">
          {cities.map(city => (
            <div 
              key={city.id}
              className="h-full transition-all duration-500"
              style={{ 
                width: `${100 / cities.length}%`,
                backgroundColor: city.status === 'locked' ? '#1A1A1A' : city.color,
                opacity: city.status === 'completed' ? 1 : city.status === 'in-progress' ? 0.6 : 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
