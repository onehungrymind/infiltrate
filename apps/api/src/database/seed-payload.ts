// Seed payload for Kasita domain model
export const seedPayload = {
  users: [
    {
      email: 'test@test.com',
      password: 'insecure',
      name: 'Test User',
      role: 'user' as const,
    },
    {
      email: 'mentor@test.com',
      password: 'insecure',
      name: 'Sarah Chen',
      role: 'mentor' as const,
    },
  ],
  learningPaths: [
    {
      mentorId: 'mentor-1', // Will be replaced with actual mentor ID
      name: 'React Server Components',
      domain: 'Web Development',
      targetSkill: 'Build production-ready RSC applications',
      status: 'in-progress' as const,
      visibility: 'shared' as const,
    },
    {
      mentorId: 'mentor-1', // Will be replaced with actual mentor ID
      name: 'Machine Learning Fundamentals',
      domain: 'Data Science',
      targetSkill: 'Understand core ML concepts and algorithms',
      status: 'not-started' as const,
      visibility: 'public' as const,
    },
    {
      name: 'TypeScript Advanced Patterns',
      domain: 'Web Development',
      targetSkill: 'Master advanced TypeScript features',
      status: 'in-progress' as const,
      visibility: 'private' as const,
    },
  ],
  principles: [
    // React Server Components Principles
    {
      pathId: 'path-1',
      name: 'Server Components Fundamentals',
      description: 'Understanding the core concepts of React Server Components, including how they render on the server and their relationship with Client Components.',
      estimatedHours: 2,
      difficulty: 'foundational' as const,
      prerequisites: [],
      order: 0,
      status: 'pending' as const,
    },
    {
      pathId: 'path-1',
      name: 'Streaming & Suspense',
      description: 'Learn how Server Components enable streaming SSR and progressive rendering using Suspense boundaries.',
      estimatedHours: 3,
      difficulty: 'intermediate' as const,
      prerequisites: [], // Will be populated with actual ID
      order: 1,
      status: 'pending' as const,
    },
    {
      pathId: 'path-1',
      name: 'Data Fetching Patterns',
      description: 'Master data fetching strategies in Server Components, including parallel fetching, waterfall prevention, and caching.',
      estimatedHours: 4,
      difficulty: 'intermediate' as const,
      prerequisites: [],
      order: 2,
      status: 'pending' as const,
    },
    {
      pathId: 'path-1',
      name: 'Server Actions',
      description: 'Implement form handling and mutations using Server Actions for seamless client-server interaction.',
      estimatedHours: 3,
      difficulty: 'advanced' as const,
      prerequisites: [],
      order: 3,
      status: 'pending' as const,
    },
    // Machine Learning Principles
    {
      pathId: 'path-2',
      name: 'Mathematical Foundations',
      description: 'Linear algebra, calculus, and probability theory fundamentals needed for machine learning.',
      estimatedHours: 8,
      difficulty: 'foundational' as const,
      prerequisites: [],
      order: 0,
      status: 'pending' as const,
    },
    {
      pathId: 'path-2',
      name: 'Optimization Algorithms',
      description: 'Understand gradient descent and its variants: SGD, Adam, RMSprop, and learning rate schedules.',
      estimatedHours: 4,
      difficulty: 'intermediate' as const,
      prerequisites: [],
      order: 1,
      status: 'pending' as const,
    },
    {
      pathId: 'path-2',
      name: 'Neural Network Architectures',
      description: 'Deep dive into CNNs, RNNs, Transformers, and when to use each architecture.',
      estimatedHours: 6,
      difficulty: 'advanced' as const,
      prerequisites: [],
      order: 2,
      status: 'pending' as const,
    },
    // TypeScript Principles
    {
      pathId: 'path-3',
      name: 'Type System Basics',
      description: 'Master TypeScript type primitives, unions, intersections, and type narrowing.',
      estimatedHours: 2,
      difficulty: 'foundational' as const,
      prerequisites: [],
      order: 0,
      status: 'pending' as const,
    },
    {
      pathId: 'path-3',
      name: 'Generics & Constraints',
      description: 'Write flexible, reusable code with generics, constraints, and default type parameters.',
      estimatedHours: 3,
      difficulty: 'intermediate' as const,
      prerequisites: [],
      order: 1,
      status: 'pending' as const,
    },
    {
      pathId: 'path-3',
      name: 'Conditional & Mapped Types',
      description: 'Create advanced utility types using conditional types, mapped types, and template literal types.',
      estimatedHours: 4,
      difficulty: 'advanced' as const,
      prerequisites: [],
      order: 2,
      status: 'pending' as const,
    },
  ],
  knowledgeUnits: [
    // React Server Components
    {
      pathId: 'path-1', // Will be replaced with actual ID
      concept: 'Server Components',
      question: 'What are React Server Components and how do they differ from Client Components?',
      answer: 'Server Components are React components that render exclusively on the server. They differ from Client Components in that they can directly access backend resources like databases and file systems, cannot use browser-only APIs, and cannot maintain client-side state or handle user interactions.',
      elaboration: 'Server Components are part of React\'s architecture for building applications that leverage both server and client rendering. They enable better performance by reducing JavaScript bundle size and allowing data fetching directly in components.',
      examples: [
        'A Server Component that fetches data from a database without exposing API routes',
        'Using Server Components to render static content that doesn\'t require interactivity',
        'Composing Server and Client Components together in the same component tree',
      ],
      analogies: [
        'Think of Server Components like a restaurant kitchen - they prepare the meal (render) before it reaches you, while Client Components are like the table service - interactive and present during your meal.',
      ],
      commonMistakes: [
        'Trying to use useState or useEffect in Server Components',
        'Importing browser-only APIs like window or document',
        'Passing non-serializable props (functions, class instances) from Server to Client Components',
      ],
      difficulty: 'intermediate' as const,
      cognitiveLevel: 'understand' as const,
      estimatedTimeSeconds: 300,
      tags: ['react', 'server-components', 'rendering'],
      sourceIds: [],
      status: 'approved' as const,
    },
    {
      pathId: 'path-1',
      concept: 'Streaming SSR',
      question: 'How does React Server Components enable streaming and progressive rendering?',
      answer: 'React Server Components enable streaming by allowing the server to send component output as it renders, rather than waiting for the entire page. This means critical content can appear immediately while non-critical sections load progressively.',
      elaboration: 'Streaming works by sending a stream of HTML/React instructions that the client can process incrementally. Suspense boundaries define chunks that can be streamed independently.',
      examples: [
        'A blog post header streaming immediately while comments load separately',
        'Product details appearing before reviews finish loading',
      ],
      analogies: [
        'Like watching a video on slow internet - you see the beginning immediately while the rest buffers.',
      ],
      commonMistakes: [
        'Forgetting to wrap async Server Components in Suspense',
        'Not properly handling loading states',
      ],
      difficulty: 'advanced' as const,
      cognitiveLevel: 'apply' as const,
      estimatedTimeSeconds: 420,
      tags: ['react', 'streaming', 'ssr', 'performance'],
      sourceIds: [],
      status: 'approved' as const,
    },
    // Machine Learning
    {
      pathId: 'path-2',
      concept: 'Gradient Descent',
      question: 'How does gradient descent optimize machine learning models?',
      answer: 'Gradient descent is an optimization algorithm that minimizes a cost function by iteratively moving in the direction of the steepest descent (negative gradient). It updates model parameters step by step until reaching a minimum (or convergence).',
      elaboration: 'There are variants like stochastic gradient descent (SGD) which uses random samples, and batch gradient descent which uses the entire dataset. Learning rate controls step size.',
      examples: [
        'Training a linear regression model to fit a line through data points',
        'Optimizing neural network weights during backpropagation',
      ],
      analogies: [
        'Like walking down a hill blindfolded, always taking a step in the steepest downward direction until you reach the bottom.',
      ],
      commonMistakes: [
        'Setting learning rate too high (overshooting) or too low (too slow)',
        'Not normalizing features before gradient descent',
        'Getting stuck in local minima',
      ],
      difficulty: 'beginner' as const,
      cognitiveLevel: 'understand' as const,
      estimatedTimeSeconds: 600,
      tags: ['machine-learning', 'optimization', 'gradient-descent'],
      sourceIds: [],
      status: 'approved' as const,
    },
    // TypeScript
    {
      pathId: 'path-3',
      concept: 'Conditional Types',
      question: 'What are TypeScript conditional types and when would you use them?',
      answer: 'Conditional types allow types to be selected based on a condition using the syntax `T extends U ? X : Y`. They enable type-level logic and are useful for creating utility types that transform or filter other types.',
      elaboration: 'Conditional types are evaluated recursively and can be combined with mapped types and template literal types for powerful type manipulation. They\'re the foundation of many built-in utility types like Exclude, Extract, and NonNullable.',
      examples: [
        'Creating a utility type that extracts return types from functions',
        'Filtering object properties based on their value types',
        'Building type-safe API client types from endpoint definitions',
      ],
      analogies: [
        'Like a type-level if-else statement that chooses one type or another based on a condition.',
      ],
      commonMistakes: [
        'Creating overly complex conditional type chains that become unreadable',
        'Not understanding distributivity in conditional types',
        'Trying to use conditional types at runtime (they\'re compile-time only)',
      ],
      difficulty: 'advanced' as const,
      cognitiveLevel: 'apply' as const,
      estimatedTimeSeconds: 480,
      tags: ['typescript', 'types', 'advanced', 'generics'],
      sourceIds: [],
      status: 'approved' as const,
    },
  ],
  sourceConfigs: [
    {
      pathId: 'path-1',
      url: 'https://javascriptweekly.com/rss',
      type: 'rss' as const,
      name: 'JavaScript Weekly',
      enabled: true,
    },
    {
      pathId: 'path-1',
      url: 'https://react.statuscode.com/rss',
      type: 'rss' as const,
      name: 'React Status',
      enabled: true,
    },
    {
      pathId: 'path-2',
      url: 'https://distill.pub/rss.xml',
      type: 'rss' as const,
      name: 'Distill.pub',
      enabled: true,
    },
  ],
  rawContent: [
    {
      pathId: 'path-1',
      sourceType: 'rss',
      sourceUrl: 'https://javascriptweekly.com/issues/600',
      title: 'React Server Components: The Full Guide',
      content: 'React Server Components represent a paradigm shift in how we think about React applications...',
      author: 'Dan Abramov',
      publishedDate: new Date('2024-01-15'),
      metadata: {
        feed: 'JavaScript Weekly',
        category: 'React',
      },
    },
    {
      pathId: 'path-2',
      sourceType: 'article',
      sourceUrl: 'https://example.com/gradient-descent-explained',
      title: 'Understanding Gradient Descent: A Visual Guide',
      content: 'Gradient descent is one of the most fundamental optimization algorithms in machine learning...',
      author: 'ML Expert',
      publishedDate: new Date('2024-02-01'),
      metadata: {
        readingTime: 8,
        tags: ['machine-learning', 'optimization'],
      },
    },
  ],
  userProgress: [
    {
      userId: 'demo-user-1',
      unitId: 'unit-1', // Will be replaced with actual ID
      masteryLevel: 'learning' as const,
      confidence: 65,
      easinessFactor: 2.3,
      interval: 1,
      repetitions: 2,
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      attempts: 3,
      lastAttemptAt: new Date(),
    },
  ],
  challenges: [
    // React Server Components Challenges
    {
      unitId: 'unit-1', // Will be replaced with actual ID
      title: 'Build a Server Component Dashboard',
      description: 'Create a dashboard page using React Server Components that fetches and displays user statistics. The component should render on the server and include proper loading states using Suspense.',
      difficulty: 'intermediate' as const,
      estimatedMinutes: 45,
      rubricCriteria: [
        { name: 'Server-side Rendering', description: 'Component properly renders on the server without client-side JavaScript', maxPoints: 25 },
        { name: 'Data Fetching', description: 'Data is fetched directly in the component without useEffect', maxPoints: 25 },
        { name: 'Suspense Integration', description: 'Proper use of Suspense boundaries for loading states', maxPoints: 25 },
        { name: 'Code Quality', description: 'Clean, readable code following best practices', maxPoints: 25 },
      ],
      successCriteria: [
        'Dashboard renders user statistics from a database query',
        'No useState or useEffect hooks are used',
        'Suspense boundary wraps async operations',
        'Page works with JavaScript disabled',
      ],
      contentTypes: ['code'],
      isActive: true,
    },
    {
      unitId: 'unit-2', // Will be replaced with actual ID
      title: 'Implement Streaming SSR',
      description: 'Modify an existing page to use streaming SSR with progressive loading. The page should show critical content immediately while secondary content loads in the background.',
      difficulty: 'advanced' as const,
      estimatedMinutes: 60,
      rubricCriteria: [
        { name: 'Streaming Implementation', description: 'Content streams progressively to the client', maxPoints: 30 },
        { name: 'Critical Path', description: 'Critical content appears within 100ms', maxPoints: 30 },
        { name: 'User Experience', description: 'Loading states are smooth and non-jarring', maxPoints: 20 },
        { name: 'Performance', description: 'Time to First Byte is under 200ms', maxPoints: 20 },
      ],
      successCriteria: [
        'Page header renders immediately',
        'Secondary content loads progressively',
        'No layout shift during loading',
      ],
      contentTypes: ['code'],
      isActive: true,
    },
    // Machine Learning Challenge
    {
      unitId: 'unit-3', // Will be replaced with actual ID (ML unit)
      title: 'Implement Gradient Descent from Scratch',
      description: 'Write a Python implementation of gradient descent to train a simple linear regression model. Include both batch and stochastic variants.',
      difficulty: 'intermediate' as const,
      estimatedMinutes: 90,
      rubricCriteria: [
        { name: 'Correctness', description: 'Algorithm converges to the optimal solution', maxPoints: 35 },
        { name: 'Implementation', description: 'Both batch and SGD variants implemented correctly', maxPoints: 35 },
        { name: 'Visualization', description: 'Loss curve is plotted showing convergence', maxPoints: 15 },
        { name: 'Documentation', description: 'Code is well-commented explaining the math', maxPoints: 15 },
      ],
      successCriteria: [
        'Loss decreases over iterations',
        'Model fits the training data',
        'Learning rate parameter is configurable',
      ],
      contentTypes: ['code'],
      isActive: true,
    },
    // TypeScript Challenge
    {
      unitId: 'unit-4', // Will be replaced with actual ID (TS unit)
      title: 'Build Advanced Utility Types',
      description: 'Create a set of advanced TypeScript utility types including DeepPartial, DeepReadonly, and a type-safe Pick variant that validates keys at compile time.',
      difficulty: 'advanced' as const,
      estimatedMinutes: 45,
      rubricCriteria: [
        { name: 'DeepPartial', description: 'Correctly makes all nested properties optional', maxPoints: 25 },
        { name: 'DeepReadonly', description: 'Correctly makes all nested properties readonly', maxPoints: 25 },
        { name: 'StrictPick', description: 'Pick variant that errors on invalid keys', maxPoints: 30 },
        { name: 'Test Cases', description: 'Includes type tests demonstrating functionality', maxPoints: 20 },
      ],
      successCriteria: [
        'All utility types compile without errors',
        'Types work with nested objects',
        'Invalid usage produces compile-time errors',
      ],
      contentTypes: ['code'],
      isActive: true,
    },
  ],
  projects: [
    // React Server Components Project
    {
      pathId: 'path-1',
      name: 'Full-Stack RSC E-commerce Store',
      description: 'Build a complete e-commerce storefront using React Server Components, including product listing, shopping cart, and checkout flow. This project integrates all RSC concepts including streaming, server actions, and data fetching patterns.',
      objectives: [
        'Understand how to structure a full RSC application',
        'Master data fetching patterns in Server Components',
        'Implement forms and mutations with Server Actions',
        'Create optimal loading experiences with streaming',
      ],
      requirements: [
        'Product listing page with server-side filtering',
        'Product detail page with related products',
        'Shopping cart using Server Actions for mutations',
        'Checkout flow with form validation',
        'Admin dashboard for product management',
      ],
      estimatedHours: 20,
      difficulty: 'advanced' as const,
      isActive: true,
    },
    // Machine Learning Project
    {
      pathId: 'path-2',
      name: 'Image Classification Pipeline',
      description: 'Build an end-to-end image classification system from data preparation to model deployment. This project covers the full ML lifecycle including data preprocessing, model training, evaluation, and serving.',
      objectives: [
        'Learn data preprocessing and augmentation techniques',
        'Understand CNN architectures for image classification',
        'Master model evaluation and hyperparameter tuning',
        'Deploy a model for inference',
      ],
      requirements: [
        'Data loading and preprocessing pipeline',
        'CNN model implementation using PyTorch or TensorFlow',
        'Training loop with validation monitoring',
        'Model evaluation with confusion matrix and metrics',
        'Simple web interface for predictions',
      ],
      estimatedHours: 30,
      difficulty: 'intermediate' as const,
      isActive: true,
    },
    // TypeScript Project
    {
      pathId: 'path-3',
      name: 'Type-Safe API Client Generator',
      description: 'Create a code generator that reads an OpenAPI specification and generates a fully type-safe TypeScript API client. The generated client should provide compile-time type checking for all API calls.',
      objectives: [
        'Parse and process OpenAPI specifications',
        'Generate TypeScript types from JSON schemas',
        'Create type-safe fetch wrappers',
        'Handle generic response types and error cases',
      ],
      requirements: [
        'OpenAPI 3.0 specification parser',
        'TypeScript type generator for request/response types',
        'Generated client with full type inference',
        'Support for path parameters, query strings, and request bodies',
        'Error handling with discriminated unions',
      ],
      estimatedHours: 15,
      difficulty: 'expert' as const,
      isActive: true,
    },
  ],
  submissions: [
    // Challenge submission - approved with AI feedback
    {
      userId: 'user-1',
      challengeId: 'challenge-1',
      pathId: 'path-1',
      title: 'Server Component Dashboard Implementation',
      contentType: 'text' as const,
      content: `// app/dashboard/page.tsx
import { Suspense } from 'react';
import { getUserStats } from '@/lib/db';

async function DashboardStats() {
  const stats = await getUserStats();
  return (
    <div className="stats-grid">
      <div className="stat">{stats.totalUsers}</div>
      <div className="stat">{stats.activeUsers}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>
    </main>
  );
}`,
      status: 'approved' as const,
      score: 85,
      submittedAt: new Date('2025-01-10'),
      reviewedAt: new Date('2025-01-10'),
    },
    // Challenge submission - submitted, awaiting review
    {
      userId: 'user-1',
      challengeId: 'challenge-2',
      pathId: 'path-1',
      title: 'Streaming SSR Implementation',
      contentType: 'url' as const,
      content: 'https://github.com/testuser/streaming-ssr-demo',
      status: 'submitted' as const,
      submittedAt: new Date('2025-01-14'),
    },
    // Project submission - approved with mentor feedback
    {
      userId: 'user-1',
      projectId: 'project-1',
      pathId: 'path-1',
      title: 'RSC E-commerce Store - Final Submission',
      contentType: 'url' as const,
      content: 'https://github.com/testuser/rsc-ecommerce',
      status: 'approved' as const,
      grade: 'accepted' as const,
      score: 92,
      submittedAt: new Date('2025-01-08'),
      reviewedAt: new Date('2025-01-09'),
    },
    // Project submission - needs work
    {
      userId: 'user-1',
      projectId: 'project-2',
      pathId: 'path-2',
      title: 'Image Classification Pipeline - Draft',
      contentType: 'url' as const,
      content: 'https://github.com/testuser/ml-image-classifier',
      status: 'rejected' as const,
      grade: 'needs_work' as const,
      score: 58,
      submittedAt: new Date('2025-01-12'),
      reviewedAt: new Date('2025-01-13'),
    },
    // Challenge submission - draft (not submitted)
    {
      userId: 'user-1',
      challengeId: 'challenge-4',
      pathId: 'path-3',
      title: 'TypeScript Utility Types - WIP',
      contentType: 'text' as const,
      content: `type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// TODO: Implement DeepReadonly and StrictPick`,
      status: 'draft' as const,
    },
  ],
  feedback: [
    // AI feedback for first challenge submission
    {
      submissionId: 'submission-1',
      source: 'ai' as const,
      overallScore: 85,
      rubricBreakdown: [
        { criterion: 'Server-side Rendering', achieved: 23, maximum: 25, feedback: 'Excellent use of async Server Component with proper data fetching.' },
        { criterion: 'Data Fetching', achieved: 25, maximum: 25, feedback: 'Perfect! Data is fetched directly in the component without client-side hooks.' },
        { criterion: 'Suspense Integration', achieved: 22, maximum: 25, feedback: 'Good Suspense boundary usage. Consider adding more granular loading states.' },
        { criterion: 'Code Quality', achieved: 15, maximum: 25, feedback: 'Clean code but could benefit from TypeScript types and error boundaries.' },
      ],
      suggestions: [
        'Add TypeScript types for the stats data structure',
        'Consider adding an error boundary for better error handling',
        'Add loading skeleton instead of plain text fallback',
      ],
      content: 'Great implementation of a Server Component dashboard! Your code correctly fetches data on the server and uses Suspense for loading states. The component will render without client-side JavaScript, which is exactly what we want. Consider enhancing the user experience with skeleton loaders and adding proper TypeScript types for better maintainability.',
    },
    // Mentor feedback for project submission
    {
      submissionId: 'submission-3',
      source: 'mentor' as const,
      reviewerId: 'mentor-1',
      overallScore: 92,
      rubricBreakdown: [
        { criterion: 'Architecture', achieved: 28, maximum: 30, feedback: 'Well-structured RSC architecture with clear separation of concerns.' },
        { criterion: 'Server Actions', achieved: 25, maximum: 25, feedback: 'Excellent implementation of cart mutations using Server Actions.' },
        { criterion: 'Performance', achieved: 22, maximum: 25, feedback: 'Good streaming implementation. TTFB could be improved with edge deployment.' },
        { criterion: 'Code Quality', achieved: 17, maximum: 20, feedback: 'Clean code with good documentation. Some areas could use more comments.' },
      ],
      suggestions: [
        'Consider deploying to edge for better global performance',
        'Add more inline documentation for complex Server Action flows',
        'Implement optimistic updates for cart operations',
      ],
      content: 'Excellent work on your e-commerce project! You\'ve demonstrated a solid understanding of React Server Components architecture. The separation between Server and Client Components is well thought out, and your use of Server Actions for mutations is exactly right. The streaming implementation provides a great user experience. For future improvements, consider edge deployment and optimistic updates to further enhance perceived performance.',
    },
    // Mentor feedback for rejected project
    {
      submissionId: 'submission-4',
      source: 'mentor' as const,
      reviewerId: 'mentor-1',
      overallScore: 58,
      rubricBreakdown: [
        { criterion: 'Data Pipeline', achieved: 15, maximum: 25, feedback: 'Basic pipeline exists but lacks proper data validation and augmentation.' },
        { criterion: 'Model Architecture', achieved: 18, maximum: 25, feedback: 'Simple CNN implemented but not optimized for the dataset.' },
        { criterion: 'Training & Evaluation', achieved: 15, maximum: 25, feedback: 'Training loop works but missing validation monitoring and early stopping.' },
        { criterion: 'Documentation', achieved: 10, maximum: 25, feedback: 'Minimal documentation. Need more explanation of design decisions.' },
      ],
      suggestions: [
        'Add data augmentation (random crops, flips, color jittering)',
        'Implement proper train/validation split with monitoring',
        'Add early stopping and model checkpointing',
        'Include confusion matrix and per-class metrics',
        'Add documentation explaining your architecture choices',
      ],
      content: 'Your project shows a good start but needs more work before it can be accepted. The basic pipeline is there, but it\'s missing crucial components like data augmentation and proper validation monitoring. The model architecture is too simple for the task - consider using transfer learning or a more sophisticated architecture. Please address the suggestions above and resubmit.',
    },
  ],
};
