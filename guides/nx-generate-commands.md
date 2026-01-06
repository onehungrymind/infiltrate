## Nx Commands

### Create Workspace
**Purpose**: Initializes a new Nx workspace with Angular monorepo structure, creating the foundation for the Kasita project.

```bash
npx create-nx-workspace@latest --name=kasita --appName=infiltrate --preset=angular-monorepo --workspaceType=integrated --ssr=false

# ✔ Which bundler would you like to use? · esbuild
# ✔ Default stylesheet format · scss
# ✔ Which unit test runner would you like to use? · jest
# ✔ Test runner to use for end to end (E2E) tests · playwright
# ✔ Which CI provider would you like to use? · skip
# ✔ Would you like remote caching to make your build faster? · skip
```

### Update Workspace Configuration
**Purpose**: Update package.json name to match workspace naming convention.

```bash
# Update package.json name to @kasita/source (or desired scope)
# Manually edit package.json or use sed:
sed -i '' 's/"name": ".*"/"name": "@kasita\/source"/' package.json
```

### Angular Applications
**Purpose**: Creates the main Angular applications for the Kasita project.

```bash
# Create dashboard application
npx nx g @nx/angular:application dashboard --routing=true --style=scss --standalone=true --bundler=esbuild --e2eTestRunner=playwright --unitTestRunner=jest

# Infiltrate app is created by default as the initial app
# Verify it exists and configure as needed
```

### Common Models Library
**Purpose**: Creates the shared TypeScript models library for type definitions used across the application.

```bash
# Create common-models library for shared type definitions
npx nx g @nx/js:library common-models --directory=libs/common-models --importPath=@kasita/common-models --bundler=vite --unitTestRunner=vitest

# Create the MVP schema file manually or use a template
# libs/common-models/src/lib/mvp-schema.ts should contain:
# - BaseEntity
# - LearningPath
# - KnowledgeUnit
# - RawContent
# - SourceConfig
# - UserProgress
# - Related types and enums
```

### Material Library
**Purpose**: Sets up Angular Material UI components library for consistent design system and reusable UI components.

```bash
# Install Angular Material
npm install -D @angular/material

# Create a shared material library to centralize Material module imports
npx nx g @nx/angular:library --name=material --directory=libs/material --importPath=@kasita/material --standalone=false --buildable=true --publishable=false --unitTestRunner=jest

# Add Material components as needed (e.g., ConfirmationDialogComponent)
```

### Core Data Library
**Purpose**: Creates the core data layer with services for API communication and data management across the application.

```bash
# Create the core-data library for shared services and data management
npx nx g @nx/angular:library --name=core-data --directory=libs/core-data --importPath=@kasita/core-data --standalone=false --buildable=true --publishable=false --unitTestRunner=jest

# Create API URL injection token for configuration
# Manually create: libs/core-data/src/lib/config/api-url.token.ts
```

### Generate HTTP Services (Custom Generator)
**Purpose**: Generate Angular HTTP services for all core entities using the custom generator.

```bash
# Install custom generator dependencies
npm install --save-dev file:tools/ng-http-service-generator

# Generate HTTP services for all core entities
npx nx g @articool/ng-http-service-generator:ng-http-service --pluralName=learning-paths --singularName=learning-path --project=core-data
npx nx g @articool/ng-http-service-generator:ng-http-service --pluralName=knowledge-units --singularName=knowledge-unit --project=core-data
npx nx g @articool/ng-http-service-generator:ng-http-service --pluralName=raw-content --singularName=raw-content --project=core-data
npx nx g @articool/ng-http-service-generator:ng-http-service --pluralName=source-configs --singularName=source-config --project=core-data
npx nx g @articool/ng-http-service-generator:ng-http-service --pluralName=user-progress --singularName=user-progress --project=core-data
```

### Core State Library (NgRx)
**Purpose**: Sets up NgRx state management for centralized application state handling with feature stores for each domain.

```bash
# Install NgRx dependencies
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools

# Create the core-state library for NgRx state management
npx nx g @nx/angular:library --name=core-state --directory=libs/core-state --importPath=@kasita/core-state --standalone=false --buildable=true --publishable=false --unitTestRunner=jest
```

### Generate NgRx Features (Custom Generator)
**Purpose**: Generate NgRx feature stores, actions, effects, facades, and reducers for all core entities.

```bash
# Install custom generator dependencies
npm install --save-dev file:tools/ngrx-feature-generator

# Generate NgRx features for all core entities
npx nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=learning-paths --singularName=learning-path --project=core-state
npx nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=knowledge-units --singularName=knowledge-unit --project=core-state
npx nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=raw-content --singularName=raw-content --project=core-state
npx nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=source-configs --singularName=source-config --project=core-state
npx nx g @articool/ngrx-feature-generator:ngrx-feature --pluralName=user-progress --singularName=user-progress --project=core-state
```

### Dashboard Components
**Purpose**: Creates master-detail view components for managing core entities in the dashboard application.

```bash
# Install custom generator dependencies
npm install --save-dev file:tools/nx-master-detail-view

# Generate master-detail views for all core entities
npx nx g @articool/nx-master-detail-view:master-detail-view --pluralName=learning-paths --singularName=learning-path --project=dashboard
npx nx g @articool/nx-master-detail-view:master-detail-view --pluralName=knowledge-units --singularName=knowledge-unit --project=dashboard
npx nx g @articool/nx-master-detail-view:master-detail-view --pluralName=raw-content --singularName=raw-content --project=dashboard
npx nx g @articool/nx-master-detail-view:master-detail-view --pluralName=source-configs --singularName=source-config --project=dashboard
npx nx g @articool/nx-master-detail-view:master-detail-view --pluralName=user-progress --singularName=user-progress --project=dashboard
```

### Configure Dashboard Application
**Purpose**: Set up Angular application configuration with NgRx, HTTP client, and API URL configuration.

```bash
# Create environment files
# apps/dashboard/src/environments/environment.ts
# apps/dashboard/src/environments/environment.prod.ts

# Configure app.config.ts to provide:
# - provideHttpClient()
# - { provide: API_URL, useValue: environment.apiUrl }
# - Store providers (provideStore, provideEffects, etc.)
```

## NestJS API

### Create NestJS Application
**Purpose**: Sets up the backend API using NestJS framework with REST endpoints and database integration.

```bash
# Install NestJS plugin
npm install -D @nx/nest

# Create the API application
npx nx g @nx/nest:application --name=api --directory=apps/api --unitTestRunner=jest --e2eTestRunner=jest
```

### Install NestJS Dependencies
**Purpose**: Install required packages for API functionality.

```bash
# Install NestJS dependencies
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config
npm install @nestjs/typeorm typeorm sqlite3
npm install class-validator class-transformer
npm install @nestjs/swagger
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Create API Resources
**Purpose**: Create REST API resources with CRUD operations for each core entity.

```bash
# Generate NestJS resources for each core entity
npx nx g @nx/nest:resource apps/api/src/learning-paths/learning-paths --crud=true --type=rest
npx nx g @nx/nest:resource apps/api/src/knowledge-units/knowledge-units --crud=true --type=rest
npx nx g @nx/nest:resource apps/api/src/raw-content/raw-content --crud=true --type=rest
npx nx g @nx/nest:resource apps/api/src/source-configs/source-configs --crud=true --type=rest
npx nx g @nx/nest:resource apps/api/src/user-progress/user-progress --crud=true --type=rest

# Create ingestion endpoint (manually or via resource generator)
# apps/api/src/ingestion/

# Create WebSocket gateway for progress updates
# apps/api/src/progress/progress.gateway.ts
```

### Configure TypeORM and Database
**Purpose**: Set up database configuration in NestJS app module.

```bash
# Configure TypeORM in app.module.ts:
# - Use SQLite database
# - Register all entity classes
# - Configure synchronize for development
# - Set up logging for development
```

## Python Services

### Create Python Libraries
**Purpose**: Set up Python-based microservices for content ingestion and synthesis.

```bash
# Create Python shared library
# Manually create libs/python-shared with pyproject.toml

# Create Patchbay (ingestion) service
# Manually create apps/patchbay with:
# - adapters/ (article_adapter, rss_adapter, pdf_adapter, etc.)
# - models/ (raw_content, source_config)
# - src/ (main.py, router.py, normalizer.py)

# Create Synthesizer service
# Manually create apps/synthesizer with:
# - generators/ (knowledge_unit_generator, base_generator)
# - models/ (processed_content, synthesis_result, cluster)
# - processors/ (embeddings, clustering)
# - src/ (main.py, orchestrator.py)

# Use uv for Python dependency management
# uv init for each Python project
# uv add dependencies as needed
```

## Custom Generators

### Generator Setup
**Purpose**: Custom Nx generators for code generation. These generators are located in the `tools/` directory and must be installed as local file dependencies.

```bash
# The generators are already in the workspace, but need to be registered:
# 1. Add to package.json devDependencies:
#    "@articool/ng-http-service-generator": "file:tools/ng-http-service-generator"
#    "@articool/ngrx-feature-generator": "file:tools/ngrx-feature-generator"
#    "@articool/nx-master-detail-view": "file:tools/nx-master-detail-view"

# 2. Run npm install to link the generators

# 3. Ensure each generator has proper index.ts exports
```

### Available Custom Generators

1. **@articool/ng-http-service-generator:ng-http-service**
   - Generates Angular HTTP services for API communication
   - Options: `--pluralName`, `--singularName`, `--project`
   - Creates service with proper TypeScript types and API_URL injection

2. **@articool/ngrx-feature-generator:ngrx-feature**
   - Generates complete NgRx feature modules
   - Options: `--pluralName`, `--singularName`, `--project`
   - Creates actions, effects, facades, feature state, and tests

3. **@articool/nx-master-detail-view:master-detail-view**
   - Generates master-detail view components
   - Options: `--pluralName`, `--singularName`, `--project`, `--skipTests`, `--skipFormat`
   - Creates main component, list component, and detail component

## Core Entities

The Kasita MVP workspace uses the following core entities:

1. **LearningPath** - User's learning goals and paths
2. **KnowledgeUnit** - Atomic learning blocks (questions/answers)
3. **RawContent** - Raw content extracted from sources
4. **SourceConfig** - Configuration for content ingestion sources
5. **UserProgress** - Progress tracking for spaced repetition

Each entity has:
- TypeScript interface in `common-models`
- NestJS entity, DTOs, controller, service, and module
- Angular HTTP service in `core-data`
- NgRx feature module in `core-state`
- Master-detail view in `dashboard` app

## Additional Configuration

### Environment Configuration
**Purpose**: Set up environment-specific configuration for Angular apps.

```bash
# Create environment files for dashboard
# apps/dashboard/src/environments/environment.ts
# apps/dashboard/src/environments/environment.prod.ts

# Create environment files for infiltrate
# apps/infiltrate/src/environments/environment.ts
# apps/infiltrate/src/environments/environment.prod.ts
```

### Routes Configuration
**Purpose**: Set up Angular routing for navigation.

```bash
# Configure routes in app.routes.ts for each Angular app
# Add routes for each master-detail view component
```

### DTO Utilities
**Purpose**: Utility for managing DTO field mappings.

```bash
# Create/update libs/core-data/src/lib/utils/dto.utils.ts
# Defines ENTITY_DTO_KEYS for each entity
# Used for consistent DTO generation
```
