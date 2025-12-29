# Kasita

An [Nx](https://nx.dev) monorepo workspace for building modern web applications.

## 🏗️ Project Structure

```
kasita/
├── apps/
│   ├── infiltrate/          # INFILTRATE - ML/AI flashcard app
│   └── infiltrate-e2e/      # End-to-end tests for infiltrate
├── libs/
│   └── common-models/       # Shared data models
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm start
# or
npm run dev
```

### Building

Build for production:

```sh
npm run build:prod
```

## 📜 Available Scripts

### Development
- `npm start` / `npm run dev` - Start development server
- `npm run build` - Build for development
- `npm run build:prod` - Build for production

### Testing
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run e2e` - Run end-to-end tests
- `npm run e2e:ui` - Run e2e tests with Playwright UI

### Code Quality
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and auto-fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Utilities
- `npm run graph` - Visualize Nx dependency graph
- `npm run clean` - Reset Nx cache

## 🛠️ Technology Stack

- **Angular 21** - Frontend framework
- **Nx 22** - Monorepo tooling
- **TypeScript** - Type-safe development
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📚 Applications

### [INFILTRATE](./apps/infiltrate/README.md)

An interactive flashcard application for mastering ML/AI concepts. See the [INFILTRATE README](./apps/infiltrate/README.md) for more details.

## 📄 License

MIT

---

Built with ❤️ using [Nx](https://nx.dev) and [Angular](https://angular.io)
