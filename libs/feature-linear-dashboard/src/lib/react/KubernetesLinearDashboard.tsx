// @ts-nocheck
import React, { useState } from 'react';

// ============================================================================
// KUBERNETES LINEAR DASHBOARD - Duolingo Style
// Clean vertical progression with expandable sections
// ============================================================================

const COLORS = {
  background: '#131F24',
  cardBg: '#1a2a32',
  cardBorder: '#2a3a42',

  // Status colors
  completed: '#58cc02',
  completedBg: '#58cc0222',
  current: '#1cb0f6',
  currentBg: '#1cb0f622',
  locked: '#3c4a52',
  lockedBg: '#3c4a5222',

  // Progress
  progressBg: '#3c4a52',
  progressFill: '#58cc02',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#acacac',
  textMuted: '#6a7a82',

  // Accent
  xp: '#ffc800',
  streak: '#ff9600',
};

// Learning path data - all unlocked for testing
const sections = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    description: 'Core concepts every K8s developer needs',
    status: 'completed',
    progress: 100,
    xpEarned: 600,
    xpTotal: 600,
    principles: [
      { id: 'containers', name: 'Container Basics', status: 'completed', xp: 50, units: 4 },
      { id: 'architecture', name: 'Cluster Architecture', status: 'completed', xp: 75, units: 6 },
      { id: 'pods', name: 'Pods', status: 'completed', xp: 60, units: 5 },
      { id: 'replicasets', name: 'ReplicaSets', status: 'completed', xp: 50, units: 4 },
      { id: 'deployments', name: 'Deployments', status: 'completed', xp: 80, units: 8 },
      { id: 'services', name: 'Services', status: 'completed', xp: 70, units: 6 },
      { id: 'capstone1', name: 'Fundamentals Capstone', status: 'completed', xp: 150, units: 1, isCapstone: true },
    ]
  },
  {
    id: 'configuration',
    title: 'Configuration & Storage',
    description: 'Managing application config and persistent data',
    status: 'current',
    progress: 45,
    xpEarned: 225,
    xpTotal: 500,
    principles: [
      { id: 'configmaps', name: 'ConfigMaps', status: 'completed', xp: 60, units: 5 },
      { id: 'secrets', name: 'Secrets', status: 'completed', xp: 70, units: 6 },
      { id: 'volumes', name: 'Volumes', status: 'current', xp: 80, units: 7, currentUnit: 4 },
      { id: 'pv-pvc', name: 'PersistentVolumes & PVCs', status: 'available', xp: 90, units: 8 },
      { id: 'storage-classes', name: 'StorageClasses', status: 'available', xp: 60, units: 5 },
      { id: 'capstone2', name: 'Storage Capstone', status: 'available', xp: 140, units: 1, isCapstone: true },
    ]
  },
  {
    id: 'networking',
    title: 'Networking',
    description: 'Connect and expose your applications',
    status: 'available',
    progress: 0,
    xpEarned: 0,
    xpTotal: 550,
    principles: [
      { id: 'service-types', name: 'Service Types', status: 'available', xp: 70, units: 6 },
      { id: 'dns', name: 'CoreDNS', status: 'available', xp: 50, units: 4 },
      { id: 'ingress', name: 'Ingress', status: 'available', xp: 90, units: 8 },
      { id: 'network-policies', name: 'Network Policies', status: 'available', xp: 80, units: 7 },
      { id: 'capstone3', name: 'Networking Capstone', status: 'available', xp: 150, units: 1, isCapstone: true },
    ]
  },
  {
    id: 'workloads',
    title: 'Advanced Workloads',
    description: 'Beyond Deployments: Jobs, DaemonSets, and more',
    status: 'available',
    progress: 0,
    xpEarned: 0,
    xpTotal: 480,
    principles: [
      { id: 'jobs', name: 'Jobs & CronJobs', status: 'available', xp: 70, units: 6 },
      { id: 'daemonsets', name: 'DaemonSets', status: 'available', xp: 60, units: 5 },
      { id: 'statefulsets', name: 'StatefulSets', status: 'available', xp: 100, units: 9 },
      { id: 'hpa', name: 'Horizontal Pod Autoscaling', status: 'available', xp: 80, units: 7 },
      { id: 'capstone4', name: 'Workloads Capstone', status: 'available', xp: 170, units: 1, isCapstone: true },
    ]
  },
];

// Icons as SVG components
const Icons = {
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  star: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  chevronDown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  chevronUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  play: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  trophy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  flame: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.53 2.04-6.58 5-8.05 0 0 .5 2.05 2 3.05 0-4 3-6 3-6s1 2 2 3c.5-.5 1-2 1-2 2.96 1.47 5 4.52 5 8.05 0 4.97-4.03 9-9 9z"/>
    </svg>
  ),
};

// Progress ring component
const ProgressRing = ({ progress, size = 48, strokeWidth = 4, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.progressBg}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
};

// Principle row component
const PrincipleRow = ({ principle, isLast }) => {
  const getStatusColor = () => {
    switch (principle.status) {
      case 'completed': return COLORS.completed;
      case 'current': return COLORS.current;
      case 'available': return COLORS.textSecondary;
      default: return COLORS.locked;
    }
  };

  const getStatusIcon = () => {
    switch (principle.status) {
      case 'completed':
        return (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: COLORS.completed,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            {Icons.check}
          </div>
        );
      case 'current':
        return (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: COLORS.current,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            {Icons.play}
          </div>
        );
      case 'available':
        return (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `2px solid ${COLORS.textSecondary}`,
            backgroundColor: 'transparent',
          }} />
        );
      default:
        return (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: COLORS.locked,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.textMuted,
          }}>
            {Icons.lock}
          </div>
        );
    }
  };

  const isClickable = principle.status !== 'locked';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: isLast ? 'none' : `1px solid ${COLORS.cardBorder}`,
      cursor: isClickable ? 'pointer' : 'default',
      opacity: principle.status === 'locked' ? 0.5 : 1,
      transition: 'background-color 0.2s',
    }}>
      {/* Status indicator */}
      <div style={{ marginRight: 16 }}>
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            color: principle.status === 'locked' ? COLORS.textMuted : COLORS.textPrimary,
            fontSize: 15,
            fontWeight: principle.status === 'current' ? 600 : 400,
          }}>
            {principle.name}
          </span>
          {principle.isCapstone && (
            <span style={{ color: COLORS.xp }}>{Icons.trophy}</span>
          )}
        </div>

        {/* Progress for current principle */}
        {principle.status === 'current' && (
          <div style={{ marginTop: 6 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                Unit {principle.currentUnit} of {principle.units}
              </span>
            </div>
            <div style={{
              height: 6,
              backgroundColor: COLORS.progressBg,
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(principle.currentUnit / principle.units) * 100}%`,
                height: '100%',
                backgroundColor: COLORS.current,
                borderRadius: 3,
              }} />
            </div>
          </div>
        )}
      </div>

      {/* XP badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: principle.status === 'completed' ? COLORS.xp : COLORS.textMuted,
        fontSize: 13,
        fontWeight: 600,
      }}>
        <span style={{ color: COLORS.xp, opacity: principle.status === 'completed' ? 1 : 0.4 }}>
          {Icons.star}
        </span>
        {principle.xp} XP
      </div>
    </div>
  );
};

// Section card component
const SectionCard = ({ section, isExpanded, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusStyles = () => {
    switch (section.status) {
      case 'completed':
        return { borderColor: COLORS.completed, accentColor: COLORS.completed };
      case 'current':
        return { borderColor: COLORS.current, accentColor: COLORS.current };
      default:
        return { borderColor: COLORS.cardBorder, accentColor: COLORS.locked };
    }
  };

  const styles = getStatusStyles();
  const completedCount = section.principles.filter(p => p.status === 'completed').length;
  const isClickable = section.status !== 'locked';

  return (
    <div style={{
      backgroundColor: COLORS.cardBg,
      borderRadius: 16,
      border: `2px solid ${styles.borderColor}`,
      overflow: 'hidden',
      marginBottom: 16,
      opacity: section.status === 'locked' ? 0.6 : 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
      transform: isHovered && isClickable ? 'translateY(-2px)' : 'none',
      boxShadow: isHovered && isClickable ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
    }}>
      {/* Header */}
      <div
        onClick={() => isClickable && onToggle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: '20px 24px',
          cursor: isClickable ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backgroundColor: isHovered && isClickable ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        {/* Progress ring */}
        <div style={{ position: 'relative' }}>
          <ProgressRing
            progress={section.progress}
            color={styles.accentColor}
            size={56}
            strokeWidth={5}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(0deg)',
            fontSize: 14,
            fontWeight: 700,
            color: styles.accentColor,
          }}>
            {section.progress}%
          </div>
        </div>

        {/* Title & description */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.textPrimary,
            }}>
              {section.title}
            </h3>
            {section.status === 'locked' && (
              <span style={{ color: COLORS.locked }}>{Icons.lock}</span>
            )}
          </div>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: 13,
            color: COLORS.textSecondary,
          }}>
            {section.description}
          </p>
          <div style={{
            display: 'flex',
            gap: 16,
            marginTop: 8,
            fontSize: 12,
            color: COLORS.textMuted,
          }}>
            <span>{completedCount}/{section.principles.length} principles</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: COLORS.xp }}>{Icons.star}</span>
              {section.xpEarned}/{section.xpTotal} XP
            </span>
          </div>
        </div>

        {/* Expand/collapse chevron */}
        {section.status !== 'locked' && (
          <div style={{
            color: COLORS.textMuted,
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            {Icons.chevronDown}
          </div>
        )}
      </div>

      {/* Expanded content with animation */}
      <div style={{
        maxHeight: isExpanded && section.status !== 'locked' ? '1000px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
      }}>
        <div style={{
          padding: '0 24px 20px 24px',
          borderTop: `1px solid ${COLORS.cardBorder}`,
        }}>
          <div style={{ paddingTop: 12 }}>
            {section.principles.map((principle, idx) => (
              <PrincipleRow
                key={principle.id}
                principle={principle}
                isLast={idx === section.principles.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats header
const StatsHeader = () => {
  const totalXP = sections.reduce((acc, s) => acc + s.xpEarned, 0);
  const streak = 7;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      marginBottom: 24,
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.textPrimary,
        }}>
          Kubernetes Fundamentals
        </h1>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: 14,
          color: COLORS.textSecondary,
        }}>
          Master container orchestration from zero to production
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* XP */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: COLORS.xp,
            fontSize: 20,
            fontWeight: 700,
          }}>
            {Icons.star}
            {totalXP}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            TOTAL XP
          </div>
        </div>

        {/* Streak */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: COLORS.streak,
            fontSize: 20,
            fontWeight: 700,
          }}>
            {Icons.flame}
            {streak}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            DAY STREAK
          </div>
        </div>
      </div>
    </div>
  );
};

// Overall progress bar
const OverallProgress = () => {
  const totalPrinciples = sections.reduce((acc, s) => acc + s.principles.length, 0);
  const completedPrinciples = sections.reduce(
    (acc, s) => acc + s.principles.filter(p => p.status === 'completed').length,
    0
  );
  const progress = Math.round((completedPrinciples / totalPrinciples) * 100);

  return (
    <div style={{
      marginBottom: 24,
      padding: '16px 24px',
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 14, color: COLORS.textSecondary }}>
          Overall Progress
        </span>
        <span style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600 }}>
          {completedPrinciples} of {totalPrinciples} principles
        </span>
      </div>
      <div style={{
        height: 12,
        backgroundColor: COLORS.progressBg,
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: COLORS.completed,
          borderRadius: 6,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{
        textAlign: 'right',
        marginTop: 4,
        fontSize: 12,
        color: COLORS.textMuted,
      }}>
        {progress}% complete
      </div>
    </div>
  );
};

// Continue button
const ContinueButton = () => {
  const currentSection = sections.find(s => s.status === 'current');
  const currentPrinciple = currentSection?.principles.find(p => p.status === 'current');

  if (!currentPrinciple) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
    }}>
      <button style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 32px',
        backgroundColor: COLORS.current,
        border: 'none',
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(28, 176, 246, 0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}>
        <span style={{
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
        }}>
          Continue: {currentPrinciple.name}
        </span>
        <span style={{ color: '#fff' }}>{Icons.play}</span>
      </button>
    </div>
  );
};

// Main component
export default function KubernetesLinearDashboard() {
  const [expandedSections, setExpandedSections] = useState(['fundamentals']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '84px 24px 24px 24px',
    }}>
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        paddingBottom: 100,
      }}>
        <StatsHeader />
        <OverallProgress />

        {sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            isExpanded={expandedSections.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>

      <ContinueButton />
    </div>
  );
}
