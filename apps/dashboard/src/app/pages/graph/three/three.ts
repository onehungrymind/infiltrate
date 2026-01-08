import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  HostListener,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphData, GraphNode } from '../graph.types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeNode {
  mesh: THREE.Mesh;
  label: THREE.Sprite;
  originalData: GraphNode;
  connections: ThreeNode[];
}

@Component({
  selector: 'app-graph-three',
  imports: [CommonModule],
  templateUrl: './three.html',
  styleUrl: './three.scss',
  standalone: true,
})
export class GraphThree
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('graphContainer', { static: false })
  containerRef!: ElementRef<HTMLDivElement>;

  @Input() graphData: GraphData | null = null;
  @Output() nodeSelected = new EventEmitter<GraphNode>();

  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private nodes: ThreeNode[] = [];
  private links: THREE.Line[] = [];
  private selectedNode: ThreeNode | null = null;
  private raycaster: THREE.Raycaster | null = null;
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private animationFrameId: number | null = null;
  private width = 0;
  private height = 0;

  readonly nodeColors: Record<string, number> = {
    core: 0x3b82f6,
    prerequisite: 0x8b5cf6,
    subtopic: 0x06b6d4,
    skill: 0x10b981,
    tool: 0xf59e0b,
  };

  ngAfterViewInit(): void {
    if (this.graphData) {
      this.initGraph();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData'] && this.graphData && this.containerRef) {
      this.initGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    // Clean up meshes
    this.nodes.forEach((node) => {
      node.mesh.geometry.dispose();
      if (node.mesh.material instanceof THREE.Material) {
        node.mesh.material.dispose();
      }
      if (node.label) {
        node.label.material.dispose();
      }
    });
    this.links.forEach((link) => {
      link.geometry.dispose();
      if (link.material instanceof THREE.Material) {
        link.material.dispose();
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.containerRef && this.camera && this.renderer) {
      const container = this.containerRef.nativeElement;
      const containerRect = container.getBoundingClientRect();
      this.width = containerRect.width || 800;
      this.height = containerRect.height || 600;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  }

  initGraph(): void {
    if (!this.containerRef || !this.graphData) return;

    const container = this.containerRef.nativeElement;
    const containerRect = container.getBoundingClientRect();
    this.width = containerRect.width || 800;
    this.height = containerRect.height || 600;

    // Clear existing scene
    if (this.renderer) {
      container.removeChild(this.renderer.domElement);
    }

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      10000
    );
    this.camera.position.set(0, 0, 400); // Closer to see the constrained graph better

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Add controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;

    // Create raycaster for mouse picking
    this.raycaster = new THREE.Raycaster();

    // Create nodes and links
    this.createNodes();
    this.createLinks();

    // Setup mouse events
    this.setupMouseEvents();

    // Start animation
    this.animate();
  }

  private createNodes(): void {
    if (!this.scene || !this.graphData) return;

    this.nodes = [];

    // Create a map for quick lookup
    const nodeMap = new Map<string, ThreeNode>();

    // Create sphere geometries for nodes
    this.graphData.nodes.forEach((nodeData) => {
      const radius = 8 + nodeData.estimatedHours / 2;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: this.nodeColors[nodeData.type] || 0x666666,
        transparent: true,
        opacity: 1,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random position in constrained 3D space
      // Constrain to a smaller, more manageable area
      mesh.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );

      // Create label sprite
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#1a1a2e';
      context.font = '24px system-ui';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(nodeData.label, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: texture });
      const label = new THREE.Sprite(labelMaterial);
      label.position.copy(mesh.position);
      label.position.y += radius + 20;
      label.scale.set(60, 15, 1);

      const threeNode: ThreeNode = {
        mesh,
        label,
        originalData: nodeData,
        connections: [],
      };

      this.nodes.push(threeNode);
      nodeMap.set(nodeData.id, threeNode);

      if (this.scene) {
        this.scene.add(mesh);
        this.scene.add(label);
      }
    });

    // Update connections
    this.graphData.edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        source.connections.push(target);
      }
    });

    // Apply physics-like positioning
    this.applyForceLayout();
  }

  private applyForceLayout(): void {
    if (!this.graphData) return;
    
    // Simple force-directed layout in 3D with boundary constraints
    const iterations = 100;
    const k = Math.sqrt(
      (this.width * this.height) / (this.nodes.length || 1)
    );
    
    // Define bounding box - constrain nodes to visible area
    // Camera is at (0, 0, 500), so we want nodes centered around origin
    const maxRadius = 150; // Maximum distance from origin in any direction
    const padding = 20; // Padding from boundary

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const nodeA = this.nodes[i];
          const nodeB = this.nodes[j];
          const dx = nodeB.mesh.position.x - nodeA.mesh.position.x;
          const dy = nodeB.mesh.position.y - nodeA.mesh.position.y;
          const dz = nodeB.mesh.position.z - nodeA.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const force = (k * k) / dist;

          const fx = (dx / dist) * force * 0.01;
          const fy = (dy / dist) * force * 0.01;
          const fz = (dz / dist) * force * 0.01;

          nodeA.mesh.position.x -= fx;
          nodeA.mesh.position.y -= fy;
          nodeA.mesh.position.z -= fz;
          nodeB.mesh.position.x += fx;
          nodeB.mesh.position.y += fy;
          nodeB.mesh.position.z += fz;
        }
      }

      // Attraction along edges
      this.graphData.edges.forEach((edge) => {
        const source = this.nodes.find((n) => n.originalData.id === edge.source);
        const target = this.nodes.find((n) => n.originalData.id === edge.target);
        if (source && target) {
          const dx = target.mesh.position.x - source.mesh.position.x;
          const dy = target.mesh.position.y - source.mesh.position.y;
          const dz = target.mesh.position.z - source.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const force = (dist - 120) * 0.01; // Reduced from 150 for tighter layout

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;

          source.mesh.position.x += fx;
          source.mesh.position.y += fy;
          source.mesh.position.z += fz;
          target.mesh.position.x -= fx;
          target.mesh.position.y -= fy;
          target.mesh.position.z -= fz;
        }
      });
      
      // Apply boundary constraints after each iteration
      this.nodes.forEach((node) => {
        const radius = 8 + node.originalData.estimatedHours / 2;
        const pos = node.mesh.position;
        const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
        
        // If node is outside the bounding sphere, constrain it
        if (distance > maxRadius - radius - padding) {
          const scale = (maxRadius - radius - padding) / distance;
          pos.x *= scale;
          pos.y *= scale;
          pos.z *= scale;
        }
      });
    }

    // Update label positions
    this.nodes.forEach((node) => {
      const radius = 8 + node.originalData.estimatedHours / 2;
      node.label.position.copy(node.mesh.position);
      node.label.position.y += radius + 20;
    });
  }

  private createLinks(): void {
    if (!this.scene || !this.graphData) return;

    this.links = [];

    this.graphData.edges.forEach((edge) => {
      const source = this.nodes.find((n) => n.originalData.id === edge.source);
      const target = this.nodes.find((n) => n.originalData.id === edge.target);

      if (source && target) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          source.mesh.position,
          target.mesh.position,
        ]);

        const material = new THREE.LineBasicMaterial({
          color: 0x666666,
          transparent: true,
          opacity: 0.3,
        });

        const line = new THREE.Line(geometry, material);
        this.links.push(line);
        if (this.scene) {
          this.scene.add(line);
        }
      }
    });
  }

  private setupMouseEvents(): void {
    if (!this.renderer || !this.raycaster) return;

    const onMouseMove = (event: MouseEvent) => {
      if (!this.renderer) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseClick = (event: MouseEvent) => {
      if (!this.raycaster || !this.camera || !this.scene || !this.renderer) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.nodes.map((n) => n.mesh)
      );

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const clickedNode = this.nodes.find((n) => n.mesh === clickedMesh);
        if (clickedNode) {
          this.selectedNode = clickedNode;
          this.nodeSelected.emit(clickedNode.originalData);
          this.updateVisualization();
          this.cdr.detectChanges();
        }
      } else {
        this.selectedNode = null;
        this.updateVisualization();
      }
    };

    this.renderer.domElement.addEventListener('mousemove', onMouseMove);
    this.renderer.domElement.addEventListener('click', onMouseClick);
  }

  private updateVisualization(): void {
    if (!this.scene) return;

    // Update node opacity
    this.nodes.forEach((node) => {
      if (node.mesh.material instanceof THREE.MeshBasicMaterial) {
        if (this.selectedNode) {
          const isSelected = node === this.selectedNode;
          const isConnected = node.connections.includes(this.selectedNode) ||
            this.selectedNode.connections.includes(node);

          node.mesh.material.opacity = isSelected || isConnected ? 1 : 0.3;
          node.label.material.opacity = isSelected || isConnected ? 1 : 0.3;
        } else {
          node.mesh.material.opacity = 1;
          node.label.material.opacity = 1;
        }
      }
    });

    // Update link opacity and color
    this.links.forEach((link) => {
      if (link.material instanceof THREE.LineBasicMaterial) {
        // For simplicity, update based on proximity to selected node
        link.material.opacity = 0.3;
        link.material.color.setHex(0x666666);
      }
    });
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    // Update link positions to follow nodes
    if (this.graphData && this.links.length > 0) {
      this.graphData.edges.forEach((edge, index) => {
        const source = this.nodes.find((n) => n.originalData.id === edge.source);
        const target = this.nodes.find((n) => n.originalData.id === edge.target);

        if (source && target && this.links[index]) {
          const geometry = this.links[index].geometry as THREE.BufferGeometry;
          geometry.setFromPoints([
            source.mesh.position,
            target.mesh.position,
          ]);
          geometry.attributes['position'].needsUpdate = true;

          // Update label positions to face camera
          if (this.camera) {
            source.label.lookAt(this.camera.position);
            target.label.lookAt(this.camera.position);
          }
        }
      });
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  loadGraph(data: GraphData): void {
    this.graphData = data;
    if (this.containerRef) {
      this.initGraph();
    }
  }
}
