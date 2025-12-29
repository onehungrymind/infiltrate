# INFILTRATE - ML/AI Mastery Protocol

An interactive flashcard application designed to help you master core Machine Learning and Artificial Intelligence concepts. Built with Angular and Nx in a modern monorepo structure.

## 🎯 Purpose

INFILTRATE is a spaced repetition learning tool featuring 20 essential ML/AI flashcards covering topics from supervised learning to transformers, embedd7ings, and modern LLM techniques. The app provides an immersive, cyberpunk-themed interface for efficient knowledge acquisition.

## ✨ Features

- **20 Core ML/AI Flashcards** - Essential concepts from supervised learning to RAG and alignment
- **Interactive Card Flipping** - Click or use keyboard to flip cards and reveal answers
- **Progress Tracking** - Visual progress bar and statistics
- **Keyboard Navigation** - Arrow keys to navigate, spacebar to flip
- **Completion Screen** - Celebrate when you've reviewed all cards
- **Modern UI** - Cyberpunk-themed design with animated backgrounds and particles

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

The app will be available at `http://localhost:4200`

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

## 🏗️ Project Structure

This is an [Nx workspace](https://nx.dev) monorepo called **Kasita**:

```
kasita/
├── apps/
│   ├── infiltrate/          # INFILTRATE - ML/AI flashcard app
│   └── infiltrate-e2e/      # End-to-end tests
├── libs/
│   └── common-models/       # Shared data models
└── ...
```

## 🎮 Usage

1. **Navigate Cards**: Use the Previous/Next buttons or arrow keys
2. **Flip Cards**: Click the card or press spacebar to reveal the answer
3. **Track Progress**: Monitor your progress through the 20 flashcards
4. **Complete Protocol**: Finish all cards to see the completion screen

## 🛠️ Technology Stack

- **Angular 21** - Frontend framework
- **Nx 22** - Monorepo tooling
- **TypeScript** - Type-safe development
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📚 Topics Covered

The flashcards cover essential ML/AI concepts including:

- Supervised vs Unsupervised Learning
- Data Splitting & Validation
- Overfitting & Underfitting
- Bias-Variance Tradeoff
- Neural Networks & Deep Learning
- Transformers & Attention Mechanisms
- Embeddings
- Loss Functions
- Gradient Descent & Backpropagation
- Learning Rate
- Batch Size & Epochs
- Regularization
- Feature Engineering
- Hyperparameter Tuning
- Cross-Validation
- Precision, Recall, F1 Score
- Transfer Learning
- Prompt Engineering
- RAG (Retrieval-Augmented Generation)
- Hallucination & Alignment

## 🤝 Contributing

This is a learning project. Feel free to fork, modify, and extend it with additional flashcards or features!

## 📄 License

MIT

---

Built with ❤️ using [Nx](https://nx.dev) and [Angular](https://angular.io)

