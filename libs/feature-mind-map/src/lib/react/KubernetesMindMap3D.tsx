// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ============================================================================
// KUBERNETES MIND MAP - Three.js 3D Version
// Interactive 3D knowledge graph with orbiting camera
// ============================================================================

const COLORS = {
  background: 0x0a1628,

  // Categories
  core: 0x4ade80,
  networking: 0x3b82f6,
  storage: 0xf97316,
  advanced: 0xa855f7,

  // Status
  completed: 0x58cc02,
  current: 0x1cb0f6,
  available: 0x6b7280,
  locked: 0x3c4a52,

  // Lines
  lineActive: 0x4a5a6a,
  lineInactive: 0x2a3a4a,

  // UI
  text: '#e2e8f0',
  textMuted: '#94a3b8',
};

// Node data for the mind map
const nodes = [
  // Central node
  { id: 'k8s', name: 'Kubernetes', category: 'core', status: 'completed', x: 0, y: 0, z: 0, size: 1.5, isRoot: true },

  // Core concepts (inner ring)
  { id: 'pods', name: 'Pods', category: 'core', status: 'completed', x: -3, y: 1, z: 2 },
  { id: 'replicasets', name: 'ReplicaSets', category: 'core', status: 'completed', x: -4, y: 2, z: 0 },
  { id: 'deployments', name: 'Deployments', category: 'core', status: 'completed', x: -3, y: 1, z: -2 },
  { id: 'namespaces', name: 'Namespaces', category: 'core', status: 'completed', x: 0, y: 2, z: 3 },

  // Networking (right side)
  { id: 'services', name: 'Services', category: 'networking', status: 'current', x: 3, y: 0, z: 1 },
  { id: 'clusterip', name: 'ClusterIP', category: 'networking', status: 'available', x: 5, y: 1, z: 2 },
  { id: 'nodeport', name: 'NodePort', category: 'networking', status: 'available', x: 6, y: 0, z: 0 },
  { id: 'loadbalancer', name: 'LoadBalancer', category: 'networking', status: 'available', x: 5, y: -1, z: -1 },
  { id: 'ingress', name: 'Ingress', category: 'networking', status: 'locked', x: 7, y: 1, z: 1 },
  { id: 'dns', name: 'CoreDNS', category: 'networking', status: 'available', x: 4, y: 2, z: -1 },
  { id: 'networkpolicy', name: 'Network Policies', category: 'networking', status: 'locked', x: 6, y: 2, z: -2 },

  // Storage (left-bottom)
  { id: 'configmaps', name: 'ConfigMaps', category: 'storage', status: 'completed', x: -2, y: -2, z: 1 },
  { id: 'secrets', name: 'Secrets', category: 'storage', status: 'completed', x: -3, y: -3, z: 0 },
  { id: 'volumes', name: 'Volumes', category: 'storage', status: 'current', x: -4, y: -2, z: -1 },
  { id: 'pv', name: 'PersistentVolumes', category: 'storage', status: 'available', x: -5, y: -3, z: -2 },
  { id: 'pvc', name: 'PVCs', category: 'storage', status: 'available', x: -6, y: -2, z: 0 },
  { id: 'storageclasses', name: 'StorageClasses', category: 'storage', status: 'locked', x: -7, y: -3, z: 1 },

  // Advanced (top)
  { id: 'hpa', name: 'HPA', category: 'advanced', status: 'available', x: 1, y: 4, z: 1 },
  { id: 'vpa', name: 'VPA', category: 'advanced', status: 'locked', x: 2, y: 5, z: 0 },
  { id: 'jobs', name: 'Jobs', category: 'advanced', status: 'available', x: -1, y: 4, z: -1 },
  { id: 'cronjobs', name: 'CronJobs', category: 'advanced', status: 'locked', x: -2, y: 5, z: 0 },
  { id: 'daemonsets', name: 'DaemonSets', category: 'advanced', status: 'available', x: 0, y: 4, z: -2 },
  { id: 'statefulsets', name: 'StatefulSets', category: 'advanced', status: 'locked', x: 1, y: 5, z: -1 },
];

// Connections between nodes
const connections = [
  // From root
  { from: 'k8s', to: 'pods' },
  { from: 'k8s', to: 'services' },
  { from: 'k8s', to: 'configmaps' },
  { from: 'k8s', to: 'namespaces' },

  // Core connections
  { from: 'pods', to: 'replicasets' },
  { from: 'replicasets', to: 'deployments' },
  { from: 'deployments', to: 'hpa' },

  // Networking connections
  { from: 'services', to: 'clusterip' },
  { from: 'services', to: 'nodeport' },
  { from: 'services', to: 'loadbalancer' },
  { from: 'services', to: 'dns' },
  { from: 'nodeport', to: 'ingress' },
  { from: 'loadbalancer', to: 'ingress' },
  { from: 'dns', to: 'networkpolicy' },

  // Storage connections
  { from: 'configmaps', to: 'secrets' },
  { from: 'secrets', to: 'volumes' },
  { from: 'volumes', to: 'pv' },
  { from: 'volumes', to: 'pvc' },
  { from: 'pv', to: 'storageclasses' },
  { from: 'pvc', to: 'storageclasses' },

  // Advanced connections
  { from: 'hpa', to: 'vpa' },
  { from: 'pods', to: 'jobs' },
  { from: 'jobs', to: 'cronjobs' },
  { from: 'pods', to: 'daemonsets' },
  { from: 'replicasets', to: 'statefulsets' },
];

// Detail panel component
const DetailPanel = ({ node, onClose }) => {
  if (!node) return null;

  const categoryColors = {
    core: '#4ade80',
    networking: '#3b82f6',
    storage: '#f97316',
    advanced: '#a855f7',
  };

  const statusLabels = {
    completed: 'COMPLETED',
    current: 'IN PROGRESS',
    available: 'AVAILABLE',
    locked: 'LOCKED',
  };

  return (
    <div style={{
      position: 'absolute',
      top: 80,
      left: 20,
      width: 280,
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      border: `2px solid ${categoryColors[node.category]}`,
      borderRadius: 8,
      padding: 20,
      color: COLORS.text,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{node.name}</h2>
          <span style={{
            fontSize: 10,
            color: categoryColors[node.category],
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            {statusLabels[node.status]}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.textMuted,
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div style={{
        marginTop: 16,
        padding: '12px 0',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Category</span>
          <span style={{
            color: categoryColors[node.category],
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {node.category}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Knowledge Units</span>
          <span style={{ fontSize: 12 }}>{Math.floor(Math.random() * 8) + 3}</span>
        </div>
      </div>

      <p style={{
        marginTop: 16,
        marginBottom: 0,
        fontSize: 13,
        lineHeight: 1.5,
        color: COLORS.textMuted,
      }}>
        {node.isRoot
          ? 'The central hub of container orchestration. All paths lead from here.'
          : `Master ${node.name.toLowerCase()} to unlock new capabilities in your Kubernetes journey.`
        }
      </p>

      {node.status !== 'locked' && (
        <button style={{
          width: '100%',
          marginTop: 16,
          padding: '12px 16px',
          backgroundColor: categoryColors[node.category],
          border: 'none',
          borderRadius: 6,
          color: '#000',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          {node.status === 'completed' ? 'Review' : node.status === 'current' ? 'Continue' : 'Start Learning'}
        </button>
      )}
    </div>
  );
};

// Legend component
const Legend = () => (
  <div style={{
    position: 'absolute',
    bottom: 100,
    left: 40,
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderRadius: 8,
    padding: 16,
    zIndex: 100,
  }}>
    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>
      CATEGORIES
    </div>
    {[
      { name: 'Core', color: '#4ade80' },
      { name: 'Networking', color: '#3b82f6' },
      { name: 'Storage', color: '#f97316' },
      { name: 'Advanced', color: '#a855f7' },
    ].map(cat => (
      <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color }} />
        <span style={{ fontSize: 12, color: COLORS.text }}>{cat.name}</span>
      </div>
    ))}

    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 16, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>
      STATUS
    </div>
    {[
      { name: 'Completed', style: { opacity: 1, border: '2px solid #58cc02' } },
      { name: 'Current', style: { opacity: 1, border: '2px solid #1cb0f6' } },
      { name: 'Available', style: { opacity: 0.7 } },
      { name: 'Locked', style: { opacity: 0.3 } },
    ].map(status => (
      <div key={status.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#6b7280',
          ...status.style,
        }} />
        <span style={{ fontSize: 12, color: COLORS.text }}>{status.name}</span>
      </div>
    ))}
  </div>
);

// Controls hint
const ControlsHint = () => (
  <div style={{
    position: 'absolute',
    bottom: 100,
    right: 40,
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderRadius: 8,
    padding: 16,
    zIndex: 100,
    color: COLORS.textMuted,
    fontSize: 12,
  }}>
    <div style={{ marginBottom: 8 }}><strong style={{ color: COLORS.text }}>Drag</strong> to rotate</div>
    <div style={{ marginBottom: 8 }}><strong style={{ color: COLORS.text }}>Scroll</strong> to zoom</div>
    <div><strong style={{ color: COLORS.text }}>Click</strong> node to select</div>
  </div>
);

// Main component
export default function KubernetesMindMap3D() {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const nodeMeshesRef = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);
    sceneRef.current = scene;

    // Add fog for depth
    scene.fog = new THREE.Fog(COLORS.background, 15, 40);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with tone mapping for better reflections
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1a2a3a);

    // Add gradient lighting to environment
    const envLight1 = new THREE.PointLight(0x4ade80, 2, 50);
    envLight1.position.set(10, 10, 10);
    envScene.add(envLight1);

    const envLight2 = new THREE.PointLight(0x3b82f6, 2, 50);
    envLight2.position.set(-10, 5, -10);
    envScene.add(envLight2);

    const envLight3 = new THREE.PointLight(0xf97316, 1.5, 50);
    envLight3.position.set(0, -10, 5);
    envScene.add(envLight3);

    const envMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envMap;

    // Lighting - key light, fill light, rim light setup for shiny reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Key light (main white light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    // Fill lights with colors
    const fillLight1 = new THREE.PointLight(0xffffff, 1.5);
    fillLight1.position.set(-10, 10, -10);
    scene.add(fillLight1);

    const fillLight2 = new THREE.PointLight(0x4ade80, 1);
    fillLight2.position.set(-15, 5, 10);
    scene.add(fillLight2);

    const fillLight3 = new THREE.PointLight(0x3b82f6, 1);
    fillLight3.position.set(15, -5, -10);
    scene.add(fillLight3);

    // Rim light for edge highlights
    const rimLight = new THREE.PointLight(0xffffff, 1.2);
    rimLight.position.set(0, -15, 0);
    scene.add(rimLight);

    // Create nodes
    const nodeGroup = new THREE.Group();
    const nodeMeshes = {};

    nodes.forEach(node => {
      const size = node.size || 0.6;
      const geometry = new THREE.SphereGeometry(size, 32, 32);

      // Get color based on category
      const categoryColor = COLORS[node.category] || 0x6b7280;

      // Adjust material based on status
      let opacity = 1;
      let emissiveIntensity = 0;

      switch (node.status) {
        case 'completed':
          emissiveIntensity = 0.3;
          break;
        case 'current':
          emissiveIntensity = 0.5;
          break;
        case 'available':
          opacity = 0.7;
          break;
        case 'locked':
          opacity = 0.3;
          break;
      }

      const material = new THREE.MeshPhysicalMaterial({
        color: categoryColor,
        transparent: true,
        opacity: opacity,
        emissive: categoryColor,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.05,
        metalness: 0.9,
        reflectivity: 1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.5,
        ior: 1.5,
        sheen: 0.5,
        sheenRoughness: 0.2,
        sheenColor: new THREE.Color(0xffffff),
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = node;

      // Add glow ring for current nodes
      if (node.status === 'current') {
        const ringGeometry = new THREE.RingGeometry(size + 0.1, size + 0.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x1cb0f6,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.lookAt(camera.position);
        mesh.add(ring);
      }

      nodeGroup.add(mesh);
      nodeMeshes[node.id] = mesh;
    });

    scene.add(nodeGroup);
    nodeMeshesRef.current = nodeMeshes;

    // Create connections
    const lineGroup = new THREE.Group();

    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);

      if (!fromNode || !toNode) return;

      const isActive = fromNode.status === 'completed' || fromNode.status === 'current';

      const points = [
        new THREE.Vector3(fromNode.x, fromNode.y, fromNode.z),
        new THREE.Vector3(toNode.x, toNode.y, toNode.z),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: isActive ? COLORS.lineActive : COLORS.lineInactive,
        transparent: true,
        opacity: isActive ? 0.6 : 0.2,
      });

      const line = new THREE.Line(geometry, material);
      lineGroup.add(line);
    });

    scene.add(lineGroup);

    // Create circular particle texture
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Add floating particles (stars)
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const circleTexture = createCircleTexture();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x88aacc,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      map: circleTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.01;
      spherical.radius = Math.max(8, Math.min(30, spherical.radius));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    };

    // Click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object.userData;
        setSelectedNode(clickedNode);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Gentle node floating animation
      const time = Date.now() * 0.001;
      Object.values(nodeMeshes).forEach((mesh, i) => {
        const node = mesh.userData;
        mesh.position.y = node.y + Math.sin(time + i * 0.5) * 0.1;
      });

      // Rotate particles slowly
      particles.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      pmremGenerator.dispose();
      envMap.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', paddingTop: 60, boxSizing: 'border-box', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      <Legend />
      <ControlsHint />

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 80,
        right: 20,
        textAlign: 'right',
        zIndex: 100,
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.text,
        }}>
          Kubernetes Knowledge Map
        </h1>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: 13,
          color: COLORS.textMuted,
        }}>
          Explore the constellation of concepts
        </p>
      </div>
    </div>
  );
}
