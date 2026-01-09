# React Component Integration in Angular

## Overview

This guide explains how we integrated React Flow (a React component library) into our Angular 21 application for the Learning Map visualization feature. This approach allows us to leverage React's rich ecosystem of components while maintaining our Angular-based architecture.

## Why React in Angular?

We chose to integrate React Flow instead of using an Angular-native solution because:

1. **Library Quality**: React Flow provides a polished, professional visualization library that would be difficult to replicate with Angular-native solutions
2. **Ecosystem**: React has a larger ecosystem of visualization libraries
3. **Maintenance**: Using a well-maintained library reduces long-term maintenance burden
4. **User Experience**: React Flow's UI/UX matches modern design standards

## Architecture

### The Wrapper Pattern

We use a **wrapper component pattern** to bridge React and Angular:

```
Angular Component (learning-map.component.ts)
    ↓
React Flow Wrapper (react-flow-wrapper.component.ts)
    ↓
React Flow Library (@xyflow/react)
```

### Key Components

1. **`react-flow-wrapper.component.ts`**: Angular component that hosts React Flow
2. **`react-flow-custom-nodes.ts`**: React components for custom node types
3. **`react-flow-utils.ts`**: Data transformation utilities (Angular → React Flow format)
4. **`learning-map.component.ts`**: Main Angular component that uses the wrapper

## Implementation Details

### 1. React Flow Wrapper Component

The wrapper component (`react-flow-wrapper.component.ts`) handles:

- **Dynamic Imports**: Loads React and React Flow only when needed
- **Lifecycle Management**: Creates and destroys React root using `react-dom/client`
- **Data Binding**: Bridges Angular `@Input()` signals to React props
- **Event Handling**: Converts React events to Angular `@Output()` events

```typescript
// Key pattern: Dynamic import
const { createRoot } = await import('react-dom/client');
const React = await import('react');
const ReactFlow = await import('@xyflow/react');

// Create React root
this.reactRoot = createRoot(container);

// Render React component
this.reactRoot.render(reactFlowComponent);
```

### 2. Custom React Node Components

Custom nodes are defined in `react-flow-custom-nodes.ts`:

- **Dynamic Creation**: React components are created dynamically at runtime
- **Type Safety**: Uses TypeScript for type safety across the bridge
- **Styling**: Applies consistent styling matching Angular Material design

```typescript
// Pattern: Create React components dynamically
export async function createCustomNodeComponents() {
  const React = await import('react');
  const ReactFlow = await import('@xyflow/react');
  
  const CustomNode = ({ data, selected }: any) => {
    // React component implementation
  };
  
  return {
    'custom-outcome': CustomNode,
    'custom-module': CustomNode,
    // ... other node types
  };
}
```

### 3. Data Transformation

The `react-flow-utils.ts` file converts Angular data structures to React Flow format:

```typescript
// Convert Angular LearningMapNode to React Flow Node
export function convertToReactFlowNode(
  node: LearningMapNode, 
  position?: { x: number; y: number }
): ReactFlowNode {
  return {
    id: node.id,
    type: `custom-${node.type}`,
    position: position || node.position || { x: 0, y: 0 },
    data: {
      label: node.label,
      nodeType: node.type,
      status: node.status,
      ...nodeData,
    },
  };
}
```

### 4. Event Handling

Events flow from React → Angular:

```typescript
// In React Flow wrapper
onNodeClick: (event: any, node: Node) => {
  this.nodeClick.emit({ node, event: event.nativeEvent || event });
}

// In Angular component
onReactFlowNodeClick(node: ReactFlowNode, event?: MouseEvent): void {
  const learningNode = this.nodes().find((n) => n.id === node.id);
  if (learningNode) {
    this.clickPosition.set({ x: event.clientX, y: event.clientY });
    this.onNodeClick(learningNode);
  }
}
```

## Dependencies

Required packages in `package.json`:

```json
{
  "dependencies": {
    "@xyflow/react": "^12.10.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3"
  }
}
```

## Styling

React Flow styles are imported globally in `apps/dashboard/src/styles.scss`:

```scss
@import "@xyflow/react/dist/style.css";
```

Component-specific styling uses Angular's `::ng-deep` to style React components:

```scss
:host ::ng-deep {
  .react-flow__node {
    // Custom node styles
  }
  
  .react-flow__edge-path {
    // Custom edge styles
  }
}
```

## Lifecycle Management

The wrapper component properly manages React lifecycle:

```typescript
ngAfterViewInit(): void {
  this.initializeReactFlow();
}

ngOnChanges(changes: SimpleChanges): void {
  if (this.reactRoot && (changes['nodes'] || changes['edges'])) {
    this.updateReactFlow();
  }
}

ngOnDestroy(): void {
  if (this.reactRoot) {
    this.reactRoot.unmount();
    this.reactRoot = null;
  }
}
```

## Best Practices

### 1. Lazy Loading
- Use dynamic imports to load React only when needed
- Reduces initial bundle size

### 2. Type Safety
- Define interfaces for data passed between Angular and React
- Use TypeScript to catch type mismatches

### 3. Event Handling
- Always pass native events when available
- Convert React event objects to Angular-compatible formats

### 4. Memory Management
- Always unmount React roots in `ngOnDestroy`
- Clean up event listeners and subscriptions

### 5. Styling Isolation
- Use `::ng-deep` sparingly and with specific selectors
- Prefer React Flow's built-in styling options when possible

## Troubleshooting

### React Flow Not Rendering
- Ensure container has explicit width and height
- Check that `reactRoot` is created successfully
- Verify React Flow CSS is imported globally

### Events Not Firing
- Check that `@Output()` events are properly bound in template
- Verify React event handlers are correctly wired
- Check browser console for React errors

### Type Errors
- Ensure `@types/react` and `@types/react-dom` are installed
- Use `as any` type assertions sparingly and document why
- Consider creating proper type definitions for React components

### Styling Issues
- React Flow styles must be imported globally
- Use `::ng-deep` for component-specific overrides
- Check that CSS selectors match React Flow's class names

## Extending the Pattern

To add another React component:

1. **Create a wrapper component** following the same pattern
2. **Define data transformation utilities** if needed
3. **Handle lifecycle** properly (create/destroy React root)
4. **Bridge events** from React to Angular
5. **Add global styles** if the React component requires CSS

Example structure:
```
your-feature/
├── your-feature.component.ts          # Main Angular component
├── react-wrapper.component.ts         # React wrapper
├── react-components.ts                # React component definitions
└── react-utils.ts                     # Data transformation
```

## Performance Considerations

- **Bundle Size**: React adds ~130KB to bundle (gzipped)
- **Runtime**: Minimal performance impact, React renders in isolated container
- **Memory**: Proper cleanup prevents memory leaks
- **Initial Load**: Dynamic imports delay React loading until needed

## Future Considerations

- Consider migrating to Angular-native solution if one becomes available
- Monitor React Flow updates for breaking changes
- Evaluate if React 19 features can improve integration
- Consider code-splitting React components for better lazy loading

## References

- [React Flow Documentation](https://reactflow.dev/)
- [React DOM createRoot API](https://react.dev/reference/react-dom/client/createRoot)
- [Angular Component Lifecycle](https://angular.dev/guide/components/lifecycle)
- [TypeScript Handbook - Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
