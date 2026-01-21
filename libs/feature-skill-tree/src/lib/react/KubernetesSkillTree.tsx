// @ts-nocheck
import React, { useState, useRef, useMemo } from 'react';
import type { SkillTreeProps, SkillNode } from '../types';

// ============================================================================
// KUBERNETES SKILL TREE - Jedi Survivor Style (v2)
// Better spacing, monochromatic icons, no watermark
// ============================================================================

const COLORS = {
  background: '#0a1628',
  backgroundGradient: 'radial-gradient(ellipse at center, #0f2847 0%, #0a1628 70%)',

  // Skill categories (supports both legacy K8s names and new generic names)
  core: { primary: '#4ade80', secondary: '#22c55e', glow: '#4ade8066', label: 'CORE' },
  networking: { primary: '#3b82f6', secondary: '#2563eb', glow: '#3b82f666', label: 'NETWORKING' },
  storage: { primary: '#f97316', secondary: '#ea580c', glow: '#f9731666', label: 'STORAGE' },
  // Generic categories
  foundations: { primary: '#4ade80', secondary: '#22c55e', glow: '#4ade8066', label: 'FOUNDATIONS' },
  intermediate: { primary: '#3b82f6', secondary: '#2563eb', glow: '#3b82f666', label: 'INTERMEDIATE' },
  advanced: { primary: '#f97316', secondary: '#ea580c', glow: '#f9731666', label: 'ADVANCED' },
  // Root/center node (no label rendered)
  root: { primary: '#a855f7', secondary: '#9333ea', glow: '#a855f766', label: '' },

  // Node states
  unlocked: '#e8e8e8',
  locked: '#3a4555',
  available: '#8899aa',

  // Lines
  lineActive: '#5a6a7a',
  lineInactive: '#2a3444',

  // UI
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDark: '#1a202c',
};

// SVG Icons (monochromatic, simple line art)
const Icons = {
  // Core icons
  kubernetes: (color) => (
    <g transform="translate(-10, -10) scale(0.8)">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M12 5v4M12 15v4M5 8.5l3.5 2M15.5 10.5l3.5-2M5 15.5l3.5-2M15.5 13.5l3.5 2" stroke={color} strokeWidth="1"/>
    </g>
  ),
  pod: (color) => (
    <g transform="translate(-9, -9)">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="3" fill={color} opacity="0.5"/>
    </g>
  ),
  replicaset: (color) => (
    <g transform="translate(-10, -8)">
      <rect x="1" y="1" width="8" height="8" rx="1" fill="none" stroke={color} strokeWidth="1.2"/>
      <rect x="6" y="4" width="8" height="8" rx="1" fill="none" stroke={color} strokeWidth="1.2"/>
      <rect x="11" y="7" width="8" height="8" rx="1" fill="none" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  deployment: (color) => (
    <g transform="translate(-9, -9)">
      <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M10 6v8M6 10h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 6l-2 2M10 6l2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  hpa: (color) => (
    <g transform="translate(-10, -8)">
      <path d="M4 8h12M4 8l3-3M4 8l3 3M16 8l-3-3M16 8l-3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  rollout: (color) => (
    <g transform="translate(-9, -9)">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M10 6v4l3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  ),
  strategy: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M4 10h4l2-4 2 8 2-4h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </g>
  ),
  vpa: (color) => (
    <g transform="translate(-8, -10)">
      <path d="M8 4v12M8 4l-3 3M8 4l3 3M8 16l-3-3M8 16l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),

  // Networking icons
  service: (color) => (
    <g transform="translate(-9, -9)">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2" fill={color}/>
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  clusterip: (color) => (
    <g transform="translate(-10, -9)">
      <circle cx="10" cy="9" r="6" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="9" r="2" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M4 15h12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  ),
  nodeport: (color) => (
    <g transform="translate(-9, -9)">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2" fill={color}/>
      <path d="M10 3v3M10 14v3" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  dns: (color) => (
    <g transform="translate(-10, -9)">
      <circle cx="10" cy="5" r="3" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="5" cy="14" r="3" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="15" cy="14" r="3" fill="none" stroke={color} strokeWidth="1.2"/>
      <path d="M10 8v3M7 12l-1 1M13 12l1 1" stroke={color} strokeWidth="1"/>
    </g>
  ),
  loadbalancer: (color) => (
    <g transform="translate(-10, -9)">
      <path d="M10 2v4M10 6l-6 4M10 6l6 4M4 10v6M16 10v6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="4" cy="16" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="16" cy="16" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  ingress: (color) => (
    <g transform="translate(-10, -9)">
      <path d="M2 10h16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 10v6M10 10v6M14 10v6" stroke={color} strokeWidth="1.2"/>
      <path d="M10 2l4 4H6l4-4z" fill="none" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  mesh: (color) => (
    <g transform="translate(-10, -10)">
      <circle cx="10" cy="4" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="4" cy="16" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="16" cy="16" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="10" cy="12" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <path d="M10 6v4M8 13l-3 2M12 13l3 2M4 14l5-3M16 14l-5-3" stroke={color} strokeWidth="1"/>
    </g>
  ),

  // Storage icons
  config: (color) => (
    <g transform="translate(-9, -9)">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M10 3v2M10 15v2M17 10h-2M5 10H3M14.5 5.5l-1.5 1.5M7 13l-1.5 1.5M14.5 14.5l-1.5-1.5M7 7L5.5 5.5" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  configmap: (color) => (
    <g transform="translate(-9, -9)">
      <rect x="3" y="2" width="14" height="16" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M6 6h8M6 10h8M6 14h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  secret: (color) => (
    <g transform="translate(-9, -10)">
      <rect x="4" y="8" width="12" height="10" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="6" r="4" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="13" r="1.5" fill={color}/>
      <path d="M10 14.5v2" stroke={color} strokeWidth="1.5"/>
    </g>
  ),
  env: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M4 4h12v12H4z" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M4 8h12" stroke={color} strokeWidth="1"/>
      <path d="M7 11h6M7 14h3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  externalSecret: (color) => (
    <g transform="translate(-10, -9)">
      <rect x="6" y="6" width="10" height="12" rx="1" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="11" cy="12" r="2" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M2 4h6M2 8h4M2 12h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  volume: (color) => (
    <g transform="translate(-9, -9)">
      <ellipse cx="10" cy="5" rx="7" ry="3" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M3 5v10c0 1.7 3.1 3 7 3s7-1.3 7-3V5" stroke={color} strokeWidth="1.5"/>
      <path d="M3 10c0 1.7 3.1 3 7 3s7-1.3 7-3" stroke={color} strokeWidth="1"/>
    </g>
  ),
  pv: (color) => (
    <g transform="translate(-10, -9)">
      <rect x="2" y="4" width="16" height="12" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M6 8h8M6 12h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="15" cy="12" r="2" fill="none" stroke={color} strokeWidth="1"/>
    </g>
  ),
  pvc: (color) => (
    <g transform="translate(-10, -9)">
      <rect x="2" y="4" width="16" height="12" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M6 10h3M13 10h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 7v6M10 7l-2 2M10 7l2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),

  // Generic icons for dynamic learning paths
  book: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M7 3v14M10 7h4M10 10h4M10 13h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  star: (color) => (
    <g transform="translate(-10, -10)">
      <path d="M10 2l2.5 5.5 6 .5-4.5 4 1.5 6-5.5-3.5L4 18l1.5-6-4.5-4 6-.5z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </g>
  ),
  concept: (color) => (
    <g transform="translate(-9, -9)">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="8" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <path d="M8 12h4M10 12v3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  module: (color) => (
    <g transform="translate(-9, -9)">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <rect x="6" y="6" width="8" height="8" rx="1" fill="none" stroke={color} strokeWidth="1"/>
    </g>
  ),
  lesson: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M4 4h12v14H4z" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M7 8h6M7 11h6M7 14h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  checkpoint: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M10 2v16M4 6h12M4 14h12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
    </g>
  ),
  trophy: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M6 4h8v6c0 2-2 4-4 4s-4-2-4-4V4z" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M6 6H3v2c0 1 1 2 3 2M14 6h3v2c0 1-1 2-3 2" stroke={color} strokeWidth="1.2"/>
      <path d="M8 14h4v3H8z" fill="none" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  puzzle: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M4 8h3v-2c0-1 2-1 2 0v2h2c1 0 1 2 0 2h-2v4h6v-2c0-1 2-1 2 0v2h3v6H4V8z" fill="none" stroke={color} strokeWidth="1.3"/>
    </g>
  ),
  lightbulb: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M10 2c-3 0-5 2-5 5 0 2 1 3 2 4v3h6v-3c1-1 2-2 2-4 0-3-2-5-5-5z" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M8 16h4M9 18h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  target: (color) => (
    <g transform="translate(-9, -9)">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="4" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="10" cy="10" r="1.5" fill={color}/>
    </g>
  ),
  code: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M7 6L3 10l4 4M13 6l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4l-4 12" stroke={color} strokeWidth="1.2"/>
    </g>
  ),
  brain: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M10 18c-3 0-5-2-5-5 0-2 1-3 1-5 0-3 2-5 4-5s4 2 4 5c0 2 1 3 1 5 0 3-2 5-5 5z" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M8 8c1 0 2 1 2 2M10 10c0 1 1 2 2 2" stroke={color} strokeWidth="1"/>
    </g>
  ),
  rocket: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M10 2c3 2 5 5 5 10l-5 5-5-5c0-5 2-8 5-10z" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="9" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <path d="M7 15l-2 3M13 15l2 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  layers: (color) => (
    <g transform="translate(-9, -9)">
      <path d="M10 2l8 4-8 4-8-4 8-4z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 10l8 4 8-4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14l8 4 8-4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  compass: (color) => (
    <g transform="translate(-9, -9)">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M10 10l3-5-5 3 5 5-3-5z" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </g>
  ),
};

// Default skill tree data - much wider spacing (used when no props provided)
const defaultSkills: Record<string, SkillNode> = {
  // Central starting node
  center: {
    id: 'center',
    name: 'Kubernetes Core',
    description: 'Your journey into Kubernetes begins here. Master the fundamentals.',
    icon: 'kubernetes',
    x: 500,
    y: 380,
    category: 'core',
    tier: 0,
    cost: 0,
    status: 'unlocked',
    children: ['pods', 'services-intro', 'config-intro'],
  },

  // CORE PATH (Green) - Top branch, spread wider
  pods: {
    id: 'pods',
    name: 'Pods',
    description: 'The atomic unit of deployment. Learn to create and manage pods.',
    icon: 'pod',
    x: 500,
    y: 280,
    category: 'core',
    tier: 1,
    cost: 1,
    status: 'unlocked',
    parent: 'center',
    children: ['replicasets'],
  },
  replicasets: {
    id: 'replicasets',
    name: 'ReplicaSets',
    description: 'Ensure pod availability with self-healing replica management.',
    icon: 'replicaset',
    x: 500,
    y: 200,
    category: 'core',
    tier: 2,
    cost: 1,
    status: 'unlocked',
    parent: 'pods',
    children: ['deployments', 'hpa'],
  },
  deployments: {
    id: 'deployments',
    name: 'Deployments',
    description: 'Declarative updates, rollbacks, and scaling strategies.',
    icon: 'deployment',
    x: 420,
    y: 130,
    category: 'core',
    tier: 3,
    cost: 1,
    status: 'current',
    parent: 'replicasets',
    children: ['rollouts', 'strategies'],
  },
  hpa: {
    id: 'hpa',
    name: 'HPA',
    description: 'Horizontal Pod Autoscaling based on CPU, memory, or custom metrics.',
    icon: 'hpa',
    x: 580,
    y: 130,
    category: 'core',
    tier: 3,
    cost: 2,
    status: 'available',
    parent: 'replicasets',
    children: ['vpa'],
  },
  rollouts: {
    id: 'rollouts',
    name: 'Rolling Updates',
    description: 'Zero-downtime deployments with rolling update strategy.',
    icon: 'rollout',
    x: 340,
    y: 55,
    category: 'core',
    tier: 4,
    cost: 1,
    status: 'locked',
    parent: 'deployments',
    children: [],
  },
  strategies: {
    id: 'strategies',
    name: 'Deploy Strategies',
    description: 'Blue-green, canary, and A/B deployment patterns.',
    icon: 'strategy',
    x: 500,
    y: 55,
    category: 'core',
    tier: 4,
    cost: 2,
    status: 'locked',
    parent: 'deployments',
    children: [],
  },
  vpa: {
    id: 'vpa',
    name: 'VPA',
    description: 'Vertical Pod Autoscaling for automatic resource optimization.',
    icon: 'vpa',
    x: 660,
    y: 55,
    category: 'core',
    tier: 4,
    cost: 2,
    status: 'locked',
    parent: 'hpa',
    children: [],
  },

  // NETWORKING PATH (Blue) - Right branch, spread much wider
  'services-intro': {
    id: 'services-intro',
    name: 'Services',
    description: 'Introduction to Kubernetes service discovery and networking.',
    icon: 'service',
    x: 650,
    y: 340,
    category: 'networking',
    tier: 1,
    cost: 1,
    status: 'unlocked',
    parent: 'center',
    children: ['clusterip'],
  },
  clusterip: {
    id: 'clusterip',
    name: 'ClusterIP',
    description: 'Internal service communication within the cluster.',
    icon: 'clusterip',
    x: 780,
    y: 290,
    category: 'networking',
    tier: 2,
    cost: 1,
    status: 'unlocked',
    parent: 'services-intro',
    children: ['nodeport', 'dns'],
  },
  nodeport: {
    id: 'nodeport',
    name: 'NodePort',
    description: 'Expose services on each node IP at a static port.',
    icon: 'nodeport',
    x: 870,
    y: 220,
    category: 'networking',
    tier: 3,
    cost: 1,
    status: 'available',
    parent: 'clusterip',
    children: ['loadbalancer'],
  },
  dns: {
    id: 'dns',
    name: 'CoreDNS',
    description: 'Service discovery through internal DNS resolution.',
    icon: 'dns',
    x: 870,
    y: 360,
    category: 'networking',
    tier: 3,
    cost: 1,
    status: 'available',
    parent: 'clusterip',
    children: ['ingress'],
  },
  loadbalancer: {
    id: 'loadbalancer',
    name: 'LoadBalancer',
    description: 'Cloud provider load balancer integration.',
    icon: 'loadbalancer',
    x: 940,
    y: 160,
    category: 'networking',
    tier: 4,
    cost: 2,
    status: 'locked',
    parent: 'nodeport',
    children: ['mesh'],
  },
  ingress: {
    id: 'ingress',
    name: 'Ingress',
    description: 'HTTP routing, TLS termination, and virtual hosting.',
    icon: 'ingress',
    x: 940,
    y: 420,
    category: 'networking',
    tier: 4,
    cost: 2,
    status: 'locked',
    parent: 'dns',
    children: ['mesh'],
  },
  mesh: {
    id: 'mesh',
    name: 'Service Mesh',
    description: 'Advanced traffic management with Istio or Linkerd.',
    icon: 'mesh',
    x: 940,
    y: 290,
    category: 'networking',
    tier: 5,
    cost: 3,
    status: 'locked',
    parent: 'loadbalancer',
    children: [],
  },

  // STORAGE PATH (Orange) - Left branch, spread much wider
  'config-intro': {
    id: 'config-intro',
    name: 'Configuration',
    description: 'Externalize and manage application configuration.',
    icon: 'config',
    x: 350,
    y: 340,
    category: 'storage',
    tier: 1,
    cost: 1,
    status: 'unlocked',
    parent: 'center',
    children: ['configmaps'],
  },
  configmaps: {
    id: 'configmaps',
    name: 'ConfigMaps',
    description: 'Store non-sensitive configuration data as key-value pairs.',
    icon: 'configmap',
    x: 220,
    y: 290,
    category: 'storage',
    tier: 2,
    cost: 1,
    status: 'available',
    parent: 'config-intro',
    children: ['secrets', 'envfrom'],
  },
  secrets: {
    id: 'secrets',
    name: 'Secrets',
    description: 'Secure storage for sensitive data like passwords and tokens.',
    icon: 'secret',
    x: 130,
    y: 220,
    category: 'storage',
    tier: 3,
    cost: 1,
    status: 'locked',
    parent: 'configmaps',
    children: ['external-secrets'],
  },
  envfrom: {
    id: 'envfrom',
    name: 'Env Injection',
    description: 'Inject configuration as environment variables or files.',
    icon: 'env',
    x: 130,
    y: 360,
    category: 'storage',
    tier: 3,
    cost: 1,
    status: 'locked',
    parent: 'configmaps',
    children: ['volumes'],
  },
  'external-secrets': {
    id: 'external-secrets',
    name: 'External Secrets',
    description: 'Integrate with Vault, AWS Secrets Manager, or Azure Key Vault.',
    icon: 'externalSecret',
    x: 60,
    y: 160,
    category: 'storage',
    tier: 4,
    cost: 2,
    status: 'locked',
    parent: 'secrets',
    children: [],
  },
  volumes: {
    id: 'volumes',
    name: 'Volumes',
    description: 'Persistent and ephemeral storage attached to pods.',
    icon: 'volume',
    x: 60,
    y: 420,
    category: 'storage',
    tier: 4,
    cost: 1,
    status: 'locked',
    parent: 'envfrom',
    children: ['pv', 'pvc'],
  },
  pv: {
    id: 'pv',
    name: 'PersistentVolumes',
    description: 'Cluster-provisioned storage resources managed by admins.',
    icon: 'pv',
    x: 60,
    y: 320,
    category: 'storage',
    tier: 5,
    cost: 2,
    status: 'locked',
    parent: 'volumes',
    children: [],
  },
  pvc: {
    id: 'pvc',
    name: 'PVCs',
    description: 'Request and bind persistent storage to your workloads.',
    icon: 'pvc',
    x: 60,
    y: 500,
    category: 'storage',
    tier: 5,
    cost: 2,
    status: 'locked',
    parent: 'volumes',
    children: [],
  },
};

const getSkill = (skills, id) => skills[id];

// Calculate the topmost node position for each category and determine alignment
const getCategoryLabelPosition = (skills, category) => {
  const categorySkills = Object.values(skills).filter(s => s.category === category);
  const topNode = categorySkills.reduce((top, skill) =>
    skill.y < top.y ? skill : top
  , categorySkills[0]);

  // Find horizontal center of the category
  const minX = Math.min(...categorySkills.map(s => s.x));
  const maxX = Math.max(...categorySkills.map(s => s.x));
  const centerX = (minX + maxX) / 2;

  // Label height (24) + subtitle height (12) + padding (20) + node radius (28)
  const offset = 24 + 12 + 20 + 28;

  // Determine alignment based on where the category sits horizontally
  // Left third = left align, middle third = center, right third = right align
  const viewWidth = 1000;
  let align = 'center';
  let x = centerX;

  if (centerX < viewWidth / 3) {
    align = 'left';
    x = minX; // Align to leftmost node
  } else if (centerX > (viewWidth * 2) / 3) {
    align = 'right';
    x = maxX; // Align to rightmost node
  }

  return {
    x,
    y: topNode.y - offset,
    align
  };
};

// Skill node component
const SkillNode = ({ skill, isSelected, onClick }) => {
  const category = COLORS[skill.category];
  const isCenter = skill.tier === 0;
  const size = isCenter ? 40 : 28;

  const getNodeColors = () => {
    switch (skill.status) {
      case 'unlocked':
        return { bg: COLORS.unlocked, border: category.primary, iconColor: COLORS.textDark };
      case 'current':
        return { bg: category.primary, border: '#ffffff', iconColor: '#ffffff' };
      case 'available':
        return { bg: COLORS.available, border: category.primary, iconColor: COLORS.textDark };
      default:
        return { bg: COLORS.locked, border: COLORS.lineInactive, iconColor: '#5a6a7a' };
    }
  };

  const colors = getNodeColors();
  const IconComponent = Icons[skill.icon];

  return (
    <g
      onClick={(e) => { e.stopPropagation(); onClick(skill, e); }}
      style={{ cursor: 'pointer' }}
      transform={`translate(${skill.x}, ${skill.y})`}
    >
      {/* Glow effect */}
      {(skill.status === 'current' || skill.status === 'unlocked') && (
        <circle
          r={size + 6}
          fill={category.glow}
          filter="url(#glow)"
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <circle
          r={size + 5}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.9"
        >
          <animate attributeName="r" values={`${size + 3};${size + 8};${size + 3}`} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Outer ring */}
      <circle
        r={size}
        fill="none"
        stroke={colors.border}
        strokeWidth={isCenter ? 3 : 2}
        opacity={skill.status === 'locked' ? 0.4 : 1}
      />

      {/* Inner fill */}
      <circle
        r={size - 4}
        fill={colors.bg}
        opacity={skill.status === 'locked' ? 0.6 : 1}
      />

      {/* Icon */}
      {IconComponent && IconComponent(colors.iconColor)}

      {/* Tier number badge */}
      {skill.tier > 0 && (
        <g transform={`translate(${size - 6}, ${-size + 6})`}>
          <circle r="8" fill={category.primary} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontWeight="bold"
            fill={COLORS.textDark}
          >
            {skill.tier}
          </text>
        </g>
      )}
    </g>
  );
};

// Connection line
const SkillConnection = ({ from, to, skills }) => {
  const fromSkill = getSkill(skills, from);
  const toSkill = getSkill(skills, to);
  if (!fromSkill || !toSkill) return null;

  const isActive = fromSkill.status === 'unlocked' || fromSkill.status === 'current';
  const color = isActive ? COLORS.lineActive : COLORS.lineInactive;

  return (
    <line
      x1={fromSkill.x}
      y1={fromSkill.y}
      x2={toSkill.x}
      y2={toSkill.y}
      stroke={color}
      strokeWidth={isActive ? 3 : 2}
      strokeLinecap="round"
      opacity={isActive ? 0.7 : 0.3}
    />
  );
};

// Category label
const CategoryLabel = ({ category, x, y, align = 'center' }) => {
  const colors = COLORS[category];
  const subtitles = {
    core: 'WORKLOADS',
    networking: 'CONNECTIVITY',
    storage: 'PERSISTENCE',
    foundations: 'FUNDAMENTALS',
    intermediate: 'BUILDING SKILLS',
    advanced: 'MASTERY',
  };

  const labelWidth = colors.label.length * 10 + 24;

  // Calculate x offset based on alignment
  const rectX = align === 'left' ? 0 :
                align === 'right' ? -labelWidth :
                -labelWidth / 2;

  const textX = align === 'left' ? labelWidth / 2 :
                align === 'right' ? -labelWidth / 2 :
                0;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={rectX}
        y="-12"
        width={labelWidth}
        height="24"
        fill="rgba(10, 22, 40, 0.8)"
        stroke={colors.primary}
        strokeWidth="1.5"
        rx="2"
      />
      <text
        x={textX}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.primary}
        fontSize="12"
        fontWeight="bold"
        letterSpacing="2"
      >
        {colors.label}
      </text>
      <text
        x={textX}
        y="20"
        textAnchor="middle"
        fill={colors.primary}
        fontSize="7"
        opacity="0.5"
        letterSpacing="1"
      >
        {subtitles[category]}
      </text>
    </g>
  );
};

// Detail panel - positioned near the click
const DetailPanel = ({ skill, clickX, clickY, containerRef }) => {
  if (!skill) return null;

  const category = COLORS[skill.category];
  const statusText = {
    unlocked: 'UNLOCKED',
    current: 'IN PROGRESS',
    available: 'AVAILABLE',
    locked: 'LOCKED',
  };

  // Panel dimensions
  const panelWidth = 280;
  const panelHeight = 200; // approximate
  const offset = 20; // offset from click point

  // Get container dimensions for edge detection
  const containerWidth = containerRef?.current?.offsetWidth || 1000;
  const containerHeight = containerRef?.current?.offsetHeight || 600;

  // Calculate position - prefer to show to the right and below the click
  let left = clickX + offset;
  let top = clickY + offset;

  // Adjust if panel would go off-screen right
  if (left + panelWidth > containerWidth - 20) {
    left = clickX - panelWidth - offset;
  }

  // Adjust if panel would go off-screen bottom
  if (top + panelHeight > containerHeight - 20) {
    top = clickY - panelHeight - offset;
  }

  // Ensure panel doesn't go off-screen left or top
  left = Math.max(20, left);
  top = Math.max(20, top);

  return (
    <div
      style={{
        position: 'absolute',
        top: top,
        left: left,
        width: panelWidth,
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        border: `1.5px solid ${category.primary}`,
        borderRadius: 8,
        boxShadow: `0 0 40px ${category.glow}`,
        zIndex: 100,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${category.primary}33`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>
            {skill.name}
          </h2>
          <span style={{
            fontSize: 9,
            color: category.primary,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            {statusText[skill.status]}
          </span>
        </div>
      </div>

      {skill.cost > 0 && (
        <div style={{
          padding: '10px 16px',
          borderBottom: `1px solid ${category.primary}33`,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: COLORS.textMuted, fontSize: 11 }}>
            {skill.cost} SKILL POINT{skill.cost > 1 ? 'S' : ''}
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: 10 }}>
            Tier {skill.tier}
          </span>
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        <p style={{
          margin: 0,
          color: COLORS.textMuted,
          fontSize: 12,
          lineHeight: 1.5,
        }}>
          {skill.description}
        </p>
      </div>

      {skill.status === 'available' && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: category.primary + '22',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 3,
            backgroundColor: category.primary,
            color: COLORS.textDark,
            fontSize: 9,
            fontWeight: 'bold',
          }}>
            Y
          </span>
          <span style={{ color: COLORS.text, fontSize: 11 }}>
            Unlock Skill
          </span>
        </div>
      )}
    </div>
  );
};

// Skill points display
const SkillPointsDisplay = ({ points }) => (
  <div style={{
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}>
    <div style={{
      fontSize: 36,
      fontWeight: 'bold',
      color: COLORS.core.primary,
      lineHeight: 1,
    }}>
      {points}
    </div>
    <div>
      <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 'bold' }}>
        SKILL POINT{points !== 1 ? 'S' : ''}
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: 10 }}>
        AVAILABLE
      </div>
    </div>
    <div style={{
      width: 150,
      height: 4,
      backgroundColor: COLORS.lineInactive,
      borderRadius: 2,
      marginLeft: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        width: '35%',
        height: '100%',
        backgroundColor: COLORS.core.primary,
      }} />
    </div>
  </div>
);

// Control hints
const ControlHints = () => (
  <div style={{
    position: 'absolute',
    bottom: 30,
    right: 30,
    display: 'flex',
    gap: 20,
  }}>
    {[{ key: 'X', label: 'View Ability' }, { key: 'B', label: 'Back' }].map(hint => (
      <div key={hint.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 3,
          border: `1.5px solid ${COLORS.textMuted}`,
          color: COLORS.textMuted,
          fontSize: 10,
          fontWeight: 'bold',
        }}>
          {hint.key}
        </span>
        <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{hint.label}</span>
      </div>
    ))}
  </div>
);

// Main component
export default function KubernetesSkillTree({
  pathName = 'Kubernetes Skill Tree',
  skills: propSkills,
}: SkillTreeProps) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const skillPoints = 3;

  // Use props if provided, otherwise use defaults
  const skills = useMemo(() =>
    propSkills && Object.keys(propSkills).length > 0 ? propSkills : defaultSkills,
    [propSkills]
  );

  // Build connections using parent relationships (more reliable than children arrays)
  const connections = useMemo(() => {
    const conns: { from: string; to: string }[] = [];
    Object.values(skills).forEach(skill => {
      if (skill.parent && skills[skill.parent]) {
        conns.push({ from: skill.parent, to: skill.id });
      }
    });
    return conns;
  }, [skills]);

  const handleNodeClick = (skill, event) => {
    // Get click position relative to the container
    const rect = event.currentTarget.closest('svg').parentElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setClickPosition({ x, y });
    setSelectedSkill(skill);
  };

  const handleBackgroundClick = (e) => {
    // Only close if clicking directly on background, not on a node
    if (e.target === e.currentTarget || e.target.tagName === 'svg') {
      setSelectedSkill(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        paddingTop: 60,
        boxSizing: 'border-box',
        background: COLORS.backgroundGradient,
        overflow: 'hidden',
      }}
      onClick={handleBackgroundClick}
    >
      <svg
        viewBox="-50 -120 1100 700"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        <g>
          {connections.map((conn, i) => (
            <SkillConnection key={i} from={conn.from} to={conn.to} skills={skills} />
          ))}
        </g>

        {/* Nodes */}
        <g>
          {Object.values(skills).map(skill => (
            <SkillNode
              key={skill.id}
              skill={skill}
              isSelected={selectedSkill?.id === skill.id}
              onClick={handleNodeClick}
            />
          ))}
        </g>

        {/* Category labels - dynamically positioned above topmost node */}
        {[...new Set(Object.values(skills).map(s => s.category))].map(category => (
          COLORS[category] && COLORS[category].label && (
            <CategoryLabel key={category} category={category} {...getCategoryLabelPosition(skills, category)} />
          )
        ))}
      </svg>

      <DetailPanel
        skill={selectedSkill}
        clickX={clickPosition.x}
        clickY={clickPosition.y}
        containerRef={containerRef}
      />
      <SkillPointsDisplay points={skillPoints} />
      <ControlHints />
    </div>
  );
}
