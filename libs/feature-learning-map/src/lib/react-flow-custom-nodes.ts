/**
 * React Flow Custom Node Components
 * 
 * These functions create React components for custom node types.
 * They're used by the React Flow wrapper to render different node types.
 */

// This will be dynamically imported and used to create React components
export async function createCustomNodeComponents() {
  const React = await import('react');
  const ReactFlow = await import('@xyflow/react');
  
  // Helper to get node colors - Match React Flow documentation styling
  const getNodeColors = (nodeType: string, status: string, data?: any) => {
    // Status-based border colors (as per requirements)
    const statusBorders: Record<string, string> = {
      'completed': '#10b981',      // Green
      'mastered': '#10b981',       // Green (for concepts)
      'in-progress': '#3b82f6',    // Blue
      'in_progress': '#3b82f6',    // Blue (underscore variant for concepts)
      'locked': '#d1d5db',         // Gray
      'not-started': '#d1d5db',    // Gray
      'pending': '#d1d5db',        // Gray (for concepts)
    };

    // Type-specific overrides for active states
    const activeBorders: Record<string, string> = {
      'exercise': '#f59e0b',       // Orange for active exercise
      'demonstration': '#eab308',  // Gold for demonstration
    };

    // Difficulty-based colors for concepts
    const difficultyColors: Record<string, string> = {
      'foundational': '#22c55e',   // Green
      'intermediate': '#f59e0b',   // Orange/Amber
      'advanced': '#ef4444',       // Red
    };

    // Determine border color based on status and type
    let borderColor = statusBorders[status] || '#d1d5db';

    // For concepts, use difficulty-based coloring when in-progress or pending
    if (nodeType === 'concept' && data?.difficulty) {
      if (status === 'in-progress' || status === 'in_progress' || status === 'pending') {
        borderColor = difficultyColors[data.difficulty] || borderColor;
      }
    } else if (status === 'in-progress' && activeBorders[nodeType]) {
      borderColor = activeBorders[nodeType];
    }

    return {
      bg: '#ffffff',              // Always white background
      border: borderColor,
      text: '#374151',            // Dark gray text
      borderWidth: status === 'locked' ? 1 : 2,
      opacity: status === 'locked' ? 0.6 : 1,
    };
  };

  // Generic custom node component - Match React Flow documentation styling
  const CustomNode = ({ data, selected }: any) => {
    const Handle = ReactFlow.Handle;

    const colors = getNodeColors(data.nodeType, data.status, data);
    const isLocked = data.status === 'locked';
    const isInProgress = data.status === 'in-progress' || data.status === 'in_progress';
    const isCompleted = data.status === 'completed' || data.status === 'mastered';
    const isPending = data.status === 'pending' || data.status === 'not-started';

    // Standardized node styling - all rectangular, no rotation
    const nodeStyle: React.CSSProperties = {
      background: colors.bg,
      border: `${colors.borderWidth}px solid ${colors.border}`,
      borderRadius: '8px',  // Consistent rounded corners
      padding: '16px',      // Standard padding
      minWidth: '200px',    // Standard min width
      minHeight: '60px',    // Standard min height
      color: colors.text,
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: selected 
        ? `0 0 0 2px ${colors.border}, 0 4px 8px rgba(0, 0, 0, 0.15)` 
        : isInProgress
          ? `0 2px 4px rgba(0, 0, 0, 0.1), 0 0 8px ${colors.border}40`  // Pulsing glow for active
          : `0 2px 4px rgba(0, 0, 0, 0.1)`,
      opacity: colors.opacity,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      transition: 'all 0.15s ease',
      cursor: isLocked ? 'not-allowed' : 'pointer',
      position: 'relative',
      wordWrap: 'break-word',
      overflow: 'hidden',
    };

    // Add pulsing animation for in-progress nodes
    if (isInProgress) {
      nodeStyle.animation = 'pulse 2s ease-in-out infinite';
    }

    const labelStyle: React.CSSProperties = {
      whiteSpace: 'normal',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    };

    // Status indicators - improved styling
    const statusIndicator = isCompleted ? '✓' : 
                           isInProgress ? '○' : 
                           isLocked ? '🔒' : '';
    
    const statusColor = isCompleted ? '#10b981' :
                       isInProgress ? '#3b82f6' :
                       isLocked ? '#9ca3af' : 'transparent';

    // Create handles for edge connections
    // When handles don't have explicit IDs, React Flow uses position as the default ID
    // So 'top' position becomes handle ID 'top', etc.
    const handles = [
      React.createElement(Handle, { type: 'source', position: 'top', id: 'top', key: 'source-top' } as any),
      React.createElement(Handle, { type: 'source', position: 'right', id: 'right', key: 'source-right' } as any),
      React.createElement(Handle, { type: 'source', position: 'bottom', id: 'bottom', key: 'source-bottom' } as any),
      React.createElement(Handle, { type: 'source', position: 'left', id: 'left', key: 'source-left' } as any),
      React.createElement(Handle, { type: 'target', position: 'top', id: 'top', key: 'target-top' } as any),
      React.createElement(Handle, { type: 'target', position: 'right', id: 'right', key: 'target-right' } as any),
      React.createElement(Handle, { type: 'target', position: 'bottom', id: 'bottom', key: 'target-bottom' } as any),
      React.createElement(Handle, { type: 'target', position: 'left', id: 'left', key: 'target-left' } as any),
    ];

    // Create status badge - top-right corner
    const statusBadge = statusIndicator ? React.createElement('div', {
      style: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: isLocked ? '16px' : '18px',
        height: isLocked ? '16px' : '18px',
        borderRadius: isLocked ? '4px' : '50%',
        background: statusColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isLocked ? '10px' : '12px',
        fontWeight: 'bold',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        zIndex: 10,
      } as React.CSSProperties,
      key: 'status-badge'
    } as any, statusIndicator) : null;

    // Locked nodes show lock icon instead of content
    const nodeContent = isLocked 
      ? React.createElement('div', { 
          style: { 
            opacity: 0.5,
            fontSize: '12px',
            color: '#6b7280'
          } as React.CSSProperties
        } as any, 'Locked')
      : React.createElement('div', { 
          style: labelStyle as React.CSSProperties
        } as any, data.label);

    return React.createElement(
      'div',
      {
        style: nodeStyle,
        className: `react-flow-node react-flow-node-${data.nodeType} react-flow-node-${data.status}`,
      } as any,
      ...handles,
      statusBadge,
      nodeContent
    );
  };

  // Return node type mapping
  return {
    'custom-outcome': CustomNode,
    'custom-module': CustomNode,
    'custom-exercise': CustomNode,
    'custom-checkpoint': CustomNode,
    'custom-knowledge-transfer': CustomNode,
    'custom-demonstration': CustomNode,
    'custom-concept': CustomNode,
  };
}
