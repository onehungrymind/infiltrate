# NgRx Feature Generator

A custom Nx generator that creates complete NgRx feature modules with actions, effects, facade, feature state, and tests based on the profiles feature pattern.

## Overview

This generator creates a complete NgRx feature module that includes:
- **Actions**: CRUD operations with success/failure patterns
- **Effects**: Side effects for API calls
- **Facade**: Service facade for components
- **Feature**: State management with NgRx Entity
- **Tests**: Comprehensive test coverage for all components

## Usage

### Basic Usage

```bash
nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=products --singularName=product --project=core-state
```

### Parameters

- `--pluralName` (required): The plural name of the feature (e.g., 'products', 'users', 'orders')
- `--singularName` (required): The singular name of the feature (e.g., 'product', 'user', 'order')
- `--project` (required): The name of the project to add the feature to
- `--skipTests` (optional): Skip generating test files (default: false)
- `--skipFormat` (optional): Skip formatting files (default: false)

### Examples

```bash
# Generate a products feature
nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=products --singularName=product --project=core-state

# Generate a users feature
nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=users --singularName=user --project=core-state

# Generate without tests
nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=orders --singularName=order --project=core-state --skipTests=true
```

## Generated Files

The generator creates the following files in `libs/{project}/src/lib/{pluralName}/`:

- `{pluralName}.actions.ts` - NgRx actions for CRUD operations
- `{pluralName}.effects.ts` - Side effects for API calls
- `{pluralName}.facade.ts` - Service facade for components
- `{pluralName}.feature.ts` - Feature state with reducer and selectors
- `{pluralName}.facade.spec.ts` - Facade tests
- `{pluralName}.feature.spec.ts` - Feature tests

## Features

### Smart Pluralization
The generator handles pluralization correctly:
- Input: `--pluralName=products --singularName=product`
- Generates: `ProductsActions`, `Product` interface, `product` properties, `products` arrays

### Automatic Path Generation
The path is automatically set to the plural name, so you don't need to specify `--path=products`.

### Complete CRUD Operations
Each feature includes:
- Load all items
- Load single item
- Create item
- Update item
- Delete item
- Select/Reset selection

### NgRx Entity Integration
Uses NgRx Entity for efficient state management with:
- Entity adapters
- Normalized state
- Optimized selectors

## Building

Run `nx build ngrx-feature-generator` to build the library.

## Testing

Run `nx test ngrx-feature-generator` to execute the unit tests via [Jest](https://jestjs.io).