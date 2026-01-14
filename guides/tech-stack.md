# Kasita Tech Stack

**Last Updated**: January 2026  
**Purpose**: Comprehensive overview of the technology stack for team reference and future projects

---

## Overview

This document outlines the complete technology stack for the Kasita project, organized by architectural layers. The stack demonstrates a modern, full-stack approach with strong type safety, scalable architecture, and AI/ML integration capabilities.

---

## 1. Monorepo & Build Infrastructure

### **Nx (v22.3.3)**
**Role**: Monorepo management, build orchestration, and dependency graph optimization

**Importance**: Nx is the foundation of this project, providing:
- **Smart caching**: Dramatically reduces build and test times through intelligent caching
- **Dependency graph**: Automatic understanding of project relationships enables optimized builds
- **Code generation**: Custom generators for rapid scaffolding (HTTP services, NgRx features, master-detail views)
- **Parallel execution**: Runs tests, builds, and lints in parallel across projects
- **Task pipeline optimization**: Only runs affected projects, saving significant development time

**Configuration**: Configured with plugins for Angular, NestJS, Playwright, Vitest, Jest, ESLint, and Webpack, providing seamless integration across the entire stack.

### **TypeScript (v5.9.2)**
**Role**: Type-safe development language across the entire stack

**Importance**: Ensures type safety from frontend to backend, reducing runtime errors and improving developer experience. Shared type definitions in `libs/common-models` enable consistency across the monorepo.

### **Node.js / npm**
**Role**: JavaScript runtime and package management

**Configuration**: All Node.js/TypeScript projects share a single `package.json` at the root, managed through Nx's workspace structure.

---

## 2. Frontend Layer

### **Angular (v21.0.0)**
**Role**: Primary frontend framework for all user-facing applications

**Importance**: Angular 21 represents the latest stable release with:
- **Standalone components**: Modern component architecture without NgModules
- **Signals**: Reactive state management at the framework level
- **Strong typing**: Full TypeScript integration with dependency injection
- **Enterprise-ready**: Built-in support for large-scale applications with clear architectural patterns

**Applications**:
- `dashboard`: Main analytics and visualization application
- `infiltrate`: Flashcard and learning interface

### **NgRx (v21.0.1)**
**Role**: State management using Redux pattern

**Importance**: Provides predictable state management for complex applications:
- **@ngrx/store**: Centralized state container
- **@ngrx/effects**: Side effect management for API calls and async operations
- **@ngrx/entity**: Optimized state management for collections (CRUD operations)
- **@ngrx/store-devtools**: Redux DevTools integration for debugging state changes

**Custom Generators**: The project includes a custom Nx generator (`@articool/ngrx-feature-generator`) that scaffolds complete NgRx feature slices (actions, effects, reducers, selectors) following best practices.

### **Angular Material (v21.0.5)**
**Role**: UI component library

**Importance**: Provides a comprehensive set of production-ready components that:
- Follow Material Design principles
- Include accessibility features out of the box
- Support theming and customization
- Reduce development time for common UI patterns

**Custom Library**: A shared `@kasita/material` library wraps and extends Material components with project-specific styling and behaviors.

### **Tailwind CSS (v4.1.18)**
**Role**: Utility-first CSS framework

**Importance**: 
- **Rapid styling**: Utility classes enable fast UI development without writing custom CSS
- **Consistent design system**: Custom theme configuration ensures design consistency
- **Dark mode support**: Built-in dark mode with class-based switching
- **Small bundle size**: Only includes used styles in production builds
- **Complements Material**: Used alongside Angular Material for custom layouts and spacing

**Configuration**: Custom theme with dark/light mode variants and gradient utilities defined in `tailwind.config.js`.

### **React & React Flow (v19.2.3 / @xyflow/react v12.10.0)**
**Role**: Specialized visualization library integration

**Importance**: React is included specifically for React Flow, a professional node-based graph visualization library. This demonstrates:
- **Framework interoperability**: Proves that React libraries can be successfully integrated into Angular applications
- **Dynamic loading**: React and React Flow are loaded via dynamic imports to minimize initial bundle size
- **Wrapper pattern**: A custom Angular wrapper component (`ReactFlowWrapperComponent`) bridges React and Angular using `react-dom/client`, showing how to integrate framework-agnostic libraries

**Implementation**: See `guides/react-in-angular-integration.md` for detailed documentation on the integration approach.

### **Visualization Libraries**

#### **Three.js (v0.182.0)**
**Role**: 3D graphics rendering for knowledge graph visualization

**Importance**: Enables interactive 3D visualizations of knowledge graphs, providing spatial understanding of concept relationships.

#### **Cytoscape.js (v3.33.1)**
**Role**: Graph visualization and layout algorithms

**Importance**: Used for 2D graph layouts with advanced algorithms (`cytoscape-fcose`) for optimal node positioning and relationship visualization.

#### **D3.js (v7.9.0)**
**Role**: Data-driven document manipulation for custom visualizations

**Importance**: Provides low-level control for creating custom data visualizations, charts, and interactive graphics.

---

## 3. Backend Layer

### **NestJS (v11.0.0)**
**Role**: Progressive Node.js framework for building efficient and scalable server-side applications

**Importance**: 
- **Modular architecture**: Dependency injection and module system enable clean, testable code organization
- **TypeScript-first**: Built with TypeScript, ensuring type safety across the entire backend
- **Express integration**: Built on Express.js, leveraging the mature ecosystem
- **Decorators**: Provides clean, declarative API definitions similar to Angular patterns

**Key Modules**:
- `@nestjs/config`: Environment configuration management
- `@nestjs/jwt` + `@nestjs/passport`: Authentication and authorization
- `@nestjs/typeorm`: Database integration
- `@nestjs/swagger`: API documentation generation
- `@nestjs/websockets` + `@nestjs/platform-socket.io`: Real-time communication

### **TypeORM (v0.3.28)**
**Role**: Object-Relational Mapping (ORM) for database operations

**Importance**: 
- **Type-safe queries**: TypeScript decorators and entities ensure type safety in database operations
- **Migrations**: Built-in migration system for schema evolution
- **Relations**: Handles complex entity relationships with ease
- **Query builder**: Flexible query building for complex database operations

**Database Strategy**: Supports both SQLite (local development via Turso/libSQL) and PostgreSQL (production via Neon.tech) with minimal configuration changes.

### **Passport.js (v0.7.0) + JWT (v4.0.1)**
**Role**: Authentication middleware

**Importance**: Provides robust authentication and authorization:
- **JWT strategy**: Stateless authentication tokens
- **Extensible**: Easy to add additional authentication strategies (OAuth, local, etc.)
- **NestJS integration**: Seamless integration through `@nestjs/passport` decorators

### **Socket.io (v4.8.3)**
**Role**: Real-time bidirectional communication

**Importance**: Enables real-time features:
- Progress updates during content ingestion and synthesis
- Live collaboration features (future)
- Push notifications for learning reminders

### **class-validator & class-transformer**
**Role**: Validation and transformation decorators

**Importance**: 
- **DTO validation**: Automatic validation of request bodies and parameters
- **Type transformation**: Converts plain objects to class instances
- **Error handling**: Provides detailed validation error messages

---

## 4. Database & Data Layer

### **Turso / libSQL (v0.5.22)**
**Role**: Local development database

**Importance**: 
- **Postgres-compatible SQLite**: Provides a local SQLite database with PostgreSQL compatibility
- **Fast iteration**: No database server setup required for local development
- **Production-ready migration path**: Easy transition to PostgreSQL in production

### **SQLite3 (v5.1.7)**
**Role**: Direct SQLite driver for development

**Note**: Used alongside libSQL for low-level SQLite operations when needed.

### **Database Strategy**
**Local**: Turso (libSQL) - SQLite-compatible, zero configuration  
**Production**: Neon.tech (PostgreSQL) - Serverless Postgres with automatic scaling

**Vector Search**: Uses pgvector extension for embedding-based similarity search (no separate vector database required).

---

## 5. Python Services Layer

### **Python (3.11+)**
**Role**: Content processing, ML/AI operations, and data analysis

**Importance**: Python excels at:
- Data processing and transformation
- Machine learning model integration
- Natural language processing
- Scientific computing libraries

**Package Management**: Uses `uv` (fastest Python package manager) for rapid dependency resolution and installation.

### **Service Architecture**

#### **Patchbay** (`apps/patchbay/`)
**Purpose**: Content ingestion and routing

**Stack**:
- `feedparser`: RSS/Atom feed parsing
- `trafilatura`: Web article extraction (clean text from HTML)
- `beautifulsoup4`: HTML parsing and cleaning
- `PyPDF2`: PDF content extraction
- `pydantic`: Data validation and serialization
- `requests`: HTTP client for fetching content

**Workflow**: Fetches content from URLs, extracts clean text, and sends to API for storage.

#### **Synthesizer** (`apps/synthesizer/`)
**Purpose**: ML processing and knowledge unit generation

**Stack**:
- `anthropic` (v0.39.0+): **Claude Sonnet 4 API** for knowledge unit generation
- `sentence-transformers`: Text embeddings generation (all-MiniLM-L6-v2 model)
- `scikit-learn`: Clustering algorithms (K-means for topic clustering)
- `numpy`: Numerical computing for embeddings and clustering
- `pydantic`: Data validation

**AI Workflow**:
1. Generates embeddings for raw content using sentence-transformers
2. Clusters similar content using K-means
3. Generates knowledge units (flashcards) per cluster using Claude API
4. Uploads results to API via HTTP

#### **ML Services** (`apps/ml-services/`)
**Purpose**: Interactive learning notebooks

**Stack**:
- `marimo`: Reactive Python notebook framework (alternative to Jupyter)
- `pandas`: Data manipulation for exercises
- `numpy`: Numerical computing

**Features**: Interactive notebooks for learning exercises, embedded in the dashboard via iframe.

**Infrastructure**: Dockerized service (`docker-compose.yml`) for consistent notebook execution environment.

### **Python Tooling**

#### **uv**
**Role**: Ultra-fast Python package manager

**Importance**: 
- **10-100x faster** than pip for dependency resolution
- **Shared virtual environment**: Single `.venv/` at monorepo root for all Python projects
- **Lock file management**: `uv.lock` files ensure reproducible builds

#### **Shared Library** (`libs/python-shared/`)
**Role**: Common utilities shared across Python services

**Importance**: Promotes code reuse and consistency across Python services.

---

## 6. Testing & Quality Assurance

### **Unit Testing**

#### **Vitest (v4.0.8)** + **Vite (v7.0.0)**
**Role**: Fast unit testing for Angular applications and libraries

**Importance**: 
- **Vitest-angular**: Optimized for Angular component testing
- **Fast execution**: Vite's build system enables rapid test runs
- **Watch mode**: Automatic re-running of tests on file changes
- **Coverage**: `@vitest/coverage-v8` for code coverage reporting

#### **Jest (v30.0.2)**
**Role**: Unit testing for NestJS API

**Importance**: 
- **NestJS integration**: `@nestjs/testing` provides testing utilities
- **Mocks**: Powerful mocking capabilities for services and dependencies
- **Snapshot testing**: Useful for API response validation

#### **pytest**
**Role**: Python service testing

**Importance**: Industry-standard Python testing framework with fixtures and parametrization.

### **End-to-End Testing**

#### **Playwright (v1.36.0)**
**Role**: Browser automation and E2E testing

**Importance**: 
- **Cross-browser**: Tests run on Chromium, Firefox, and WebKit
- **Auto-waiting**: Built-in smart waiting eliminates flaky tests
- **Network interception**: Mock API responses for reliable testing
- **Nx integration**: `@nx/playwright` plugin provides seamless integration

**Projects**: Separate E2E projects for `dashboard-e2e`, `infiltrate-e2e`, and `api-e2e`.

### **Code Quality**

#### **ESLint (v9.8.0)**
**Role**: JavaScript/TypeScript linting

**Importance**: 
- **Angular ESLint**: `angular-eslint` provides Angular-specific rules
- **TypeScript ESLint**: `typescript-eslint` for TypeScript best practices
- **Prettier integration**: `eslint-config-prettier` prevents conflicts
- **Nx plugin**: `@nx/eslint` plugin provides caching and parallel execution

#### **Prettier (v3.6.2)**
**Role**: Code formatting

**Importance**: Ensures consistent code style across the entire codebase.

#### **Ruff + Black + MyPy**
**Role**: Python code quality tools

**Importance**: 
- **Ruff**: Fast Python linter (replaces flake8, isort, and more)
- **Black**: Opinionated code formatter
- **MyPy**: Static type checking for Python

---

## 7. AI & ML Tooling

### **Anthropic Claude SDK (`@anthropic-ai/sdk` v0.71.2)**
**Role**: LLM API client for TypeScript/Node.js services

**Importance**: Enables Claude API integration directly from the NestJS backend when needed.

### **Anthropic Python SDK (`anthropic` v0.39.0+)**
**Role**: Primary LLM client for knowledge unit generation

**Usage**: Used in the Synthesizer service to generate flashcards and learning content from clustered articles.

**Model**: Claude Sonnet 4 (primary) with GPT-4 as fallback option.

### **Sentence Transformers (`sentence-transformers` v2.2.0+)**
**Role**: Local text embedding generation

**Importance**: 
- **Zero API cost**: Runs locally, no API calls for embeddings
- **Model**: `all-MiniLM-L6-v2` - balanced performance and speed
- **Fast**: Generates embeddings for thousands of articles quickly
- **Privacy**: Content never leaves the local environment for embedding generation

**Workflow**: Converts raw text content into vector embeddings for similarity search and clustering.

### **scikit-learn (v1.3.0+)**
**Role**: Machine learning algorithms

**Usage**: 
- **K-means clustering**: Groups similar articles based on embedding similarity
- **Future**: Additional ML models for content analysis and recommendation

### **Vector Search Strategy**
**Approach**: pgvector extension in PostgreSQL (no separate vector database)

**Benefits**: 
- **Simplified architecture**: One database for all data types
- **Cost efficiency**: No additional vector database service costs
- **ACID guarantees**: Vector data benefits from PostgreSQL's transactional guarantees

---

## 8. Development Workflow & Tooling

### **Custom Nx Generators**
**Location**: `tools/` directory

#### **`@articool/ng-http-service-generator`**
**Purpose**: Generates HTTP service classes with full CRUD operations

**Importance**: 
- **Consistency**: Ensures all API services follow the same pattern
- **Speed**: Generates boilerplate code automatically
- **Type safety**: Includes TypeScript interfaces and error handling

#### **`@articool/ngrx-feature-generator`**
**Purpose**: Scaffolds complete NgRx feature slices

**Generates**: Actions, effects, reducers, selectors, and feature modules following NgRx best practices.

**Importance**: Reduces setup time for new features from hours to minutes.

#### **`@articool/nx-master-detail-view`**
**Purpose**: Generates master-detail view components

**Importance**: Common UI pattern for list/detail interfaces, generated with full CRUD integration.

### **SWC (`@swc/core` v1.5.7)**
**Role**: Fast TypeScript/JavaScript compiler

**Importance**: 
- **10-20x faster** than TypeScript compiler for transpilation
- **Used by**: Jest, some build processes
- **Performance**: Significantly reduces test and build times

### **Webpack (via `@nx/webpack`)**
**Role**: Module bundler for NestJS API

**Importance**: Bundles the NestJS application for deployment, handling TypeScript compilation and dependency resolution.

### **PostCSS (v8.4.5)**
**Role**: CSS processing

**Importance**: Processes Tailwind CSS and enables PostCSS plugins for CSS transformations.

### **Docker & Docker Compose**
**Role**: Containerization for Python services

**Usage**: 
- **Marimo notebook server**: Containerized environment for ML services notebooks
- **Consistent environments**: Ensures all developers and CI/CD have identical Python environments

---

## 9. API Documentation

### **Swagger / OpenAPI (`@nestjs/swagger` v11.2.3)**
**Role**: Automatic API documentation generation

**Importance**: 
- **Interactive docs**: Browse and test APIs directly from the documentation
- **Type generation**: Future possibility to generate client SDKs from OpenAPI specs
- **Team collaboration**: Clear API contracts for frontend/backend teams

---

## 10. Architecture Patterns

### **Shared Libraries Strategy**

#### **`@kasita/common-models`**
**Role**: Shared TypeScript interfaces and types

**Importance**: 
- **Single source of truth**: Data models defined once, used everywhere
- **Type safety**: Ensures frontend and backend use compatible types
- **Future**: Could generate Python models from TypeScript interfaces

#### **`@kasita/core-data`**
**Role**: HTTP client services and API integration

**Importance**: Centralized API communication layer with error handling and request/response transformation.

#### **`@kasita/core-state`**
**Role**: NgRx feature slices and state management

**Importance**: Organized state management following domain-driven design principles.

### **Microservices Communication**
**Pattern**: HTTP REST APIs

**Flow**: 
- Python services call NestJS endpoints via `requests`/`httpx`
- NestJS stores all data in the database
- Angular apps read from NestJS API
- WebSockets provide real-time updates

**Benefits**: 
- Language-agnostic architecture
- Easy to deploy services independently
- Clear service boundaries

---

## 11. Key Architectural Decisions

### **Why Nx?**
- **Monorepo benefits**: Code sharing, unified tooling, atomic commits
- **Build performance**: Intelligent caching reduces CI/CD times
- **Developer experience**: Unified commands, dependency graph visualization
- **Scalability**: Handles growth from prototype to enterprise

### **Why Angular + NgRx?**
- **Enterprise patterns**: Familiar architecture for large teams
- **Type safety**: End-to-end TypeScript ensures fewer runtime errors
- **State management**: NgRx provides predictable, testable state patterns
- **Ecosystem**: Rich ecosystem of Angular libraries and tools

### **Why NestJS?**
- **Angular familiarity**: Similar patterns to Angular (DI, decorators, modules)
- **Type safety**: Full TypeScript support
- **Scalability**: Built for large-scale applications
- **Extensibility**: Easy to add features (WebSockets, GraphQL, microservices)

### **Why Python for ML Services?**
- **Ecosystem**: Best-in-class ML/AI libraries
- **Rapid prototyping**: Fast iteration on ML experiments
- **Model integration**: Easy integration with transformer models and APIs

### **Why React Flow (React in Angular)?**
- **Library quality**: React Flow is the best-in-class node-based visualization library
- **Proven integration**: Demonstrates framework interoperability is achievable
- **Selective use**: Only where needed, not a full React migration
- **Learning opportunity**: Shows team can work with React ecosystem when beneficial

---

## 12. Deployment & Infrastructure

### **Build Targets**
- **Angular apps**: `@angular/build:application` with production optimizations
- **NestJS API**: Webpack bundling with Node.js runtime
- **Python services**: Docker containers for consistent deployment

### **CI/CD Ready**
All tools are configured for CI/CD pipelines:
- **Caching**: Nx provides intelligent caching for fast builds
- **Parallel execution**: Tests and builds run in parallel
- **Type checking**: TypeScript and MyPy ensure type safety
- **Linting**: ESLint and Ruff catch issues early

---

## Summary

This tech stack represents a modern, full-stack approach optimized for:

1. **Type Safety**: TypeScript and Python type checking end-to-end
2. **Developer Experience**: Fast builds, intelligent caching, code generation
3. **Scalability**: Monorepo architecture that grows with the project
4. **AI Integration**: Seamless integration of AI/ML services into a traditional web stack
5. **Framework Flexibility**: Ability to integrate best-in-class libraries regardless of framework
6. **Quality**: Comprehensive testing and linting at every layer
7. **Performance**: Fast build times, optimized bundles, intelligent caching

The stack demonstrates that modern web development can successfully integrate AI/ML capabilities while maintaining traditional web application architecture and best practices.
