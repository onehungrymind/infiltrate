/**
 * Sample Session for Testing
 * This can be used to seed a test session via the API
 */

import { CreateSessionDto } from './dto';

export const SAMPLE_SESSION: CreateSessionDto = {
  title: 'TypeScript Fundamentals',
  subtitle: 'A Hands-On Practice Guide',
  description: 'Master TypeScript basics through practical exercises and real-world examples.',
  domain: 'Frontend Development',
  tags: ['typescript', 'javascript', 'frontend', 'types'],
  difficulty: 'beginner',
  estimatedMinutes: 45,
  badgeText: 'Practice Guide',
  coverMeta: ['12 Exercises', 'Beginner Friendly'],
  visibility: 'public',
  content: {
    parts: [
      {
        id: 'part-1',
        number: 'I',
        title: 'Getting Started',
        description: 'Set up your TypeScript development environment and learn the basics.',
        sections: [
          {
            id: 'section-1-1',
            number: 1,
            title: 'Introduction to TypeScript',
            anchor: 'introduction',
            blocks: [
              {
                type: 'prose',
                content: 'TypeScript is a strongly typed programming language that builds on JavaScript. It adds **optional static typing** and **class-based object-oriented programming** to the language.',
              },
              {
                type: 'callout',
                variant: 'tip',
                title: 'Why TypeScript?',
                content: 'TypeScript helps catch errors early through static type checking, provides better IDE support with autocompletion, and makes code more self-documenting.',
              },
              {
                type: 'heading',
                level: 3,
                text: 'Key Benefits',
              },
              {
                type: 'checklist',
                items: [
                  'Catch errors at compile time instead of runtime',
                  'Better IDE support with intelligent code completion',
                  'Easier refactoring with confidence',
                  'Self-documenting code through type annotations',
                ],
              },
            ],
          },
          {
            id: 'section-1-2',
            number: 2,
            title: 'Setting Up Your Environment',
            anchor: 'setup',
            blocks: [
              {
                type: 'prose',
                content: 'To get started with TypeScript, you need Node.js installed on your machine.',
              },
              {
                type: 'command',
                command: 'npm install -g typescript',
              },
              {
                type: 'prose',
                content: 'Verify the installation:',
              },
              {
                type: 'command',
                command: 'tsc --version',
              },
              {
                type: 'tryThis',
                steps: [
                  'Open your terminal',
                  'Run `npm install -g typescript`',
                  'Verify with `tsc --version`',
                  'You should see a version number like `5.x.x`',
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'part-2',
        number: 'II',
        title: 'Basic Types',
        description: 'Learn about TypeScript primitive types and how to use them.',
        sections: [
          {
            id: 'section-2-1',
            number: 3,
            title: 'Primitive Types',
            anchor: 'primitive-types',
            blocks: [
              {
                type: 'prose',
                content: 'TypeScript supports the same primitive types as JavaScript: `string`, `number`, `boolean`, `null`, `undefined`, and `symbol`.',
              },
              {
                type: 'code',
                language: 'typescript',
                label: 'TypeScript',
                code: `// String
let name: string = "Alice";

// Number
let age: number = 30;

// Boolean
let isActive: boolean = true;

// Array
let numbers: number[] = [1, 2, 3];

// Tuple
let tuple: [string, number] = ["hello", 10];`,
              },
              {
                type: 'exercise',
                badge: 'Exercise 1',
                title: 'Declare Your Variables',
                goal: 'Practice declaring variables with explicit type annotations.',
                content: `Create a new file called \`practice.ts\` and declare the following variables with appropriate types:
- Your name (string)
- Your age (number)
- Whether you like TypeScript (boolean)
- A list of your favorite programming languages (string array)`,
              },
            ],
          },
          {
            id: 'section-2-2',
            number: 4,
            title: 'Type Inference',
            anchor: 'type-inference',
            blocks: [
              {
                type: 'prose',
                content: 'TypeScript can **infer types** automatically based on the value you assign. You do not always need to explicitly annotate types.',
              },
              {
                type: 'code',
                language: 'typescript',
                label: 'TypeScript',
                code: `// TypeScript infers these types automatically
let message = "Hello"; // inferred as string
let count = 42;        // inferred as number
let items = [1, 2, 3]; // inferred as number[]

// Explicit annotation is optional but can be useful
let explicitMessage: string = "Hello";`,
              },
              {
                type: 'callout',
                variant: 'note',
                content: 'Type inference works well for simple cases, but explicit annotations help with function parameters, return types, and complex objects.',
              },
              {
                type: 'keyLearning',
                content: 'Use type inference for simple assignments, but add explicit annotations for function signatures and complex types.',
              },
            ],
          },
        ],
      },
      {
        id: 'part-3',
        number: 'III',
        title: 'Functions and Interfaces',
        description: 'Define typed functions and create reusable interface definitions.',
        sections: [
          {
            id: 'section-3-1',
            number: 5,
            title: 'Typed Functions',
            anchor: 'typed-functions',
            blocks: [
              {
                type: 'prose',
                content: 'Functions in TypeScript can have typed parameters and return types.',
              },
              {
                type: 'code',
                language: 'typescript',
                label: 'TypeScript',
                code: `// Function with typed parameters and return type
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Arrow function with types
const add = (a: number, b: number): number => {
  return a + b;
};

// Optional parameters
function log(message: string, level?: string): void {
  console.log(\`[\${level || 'INFO'}] \${message}\`);
}`,
              },
              {
                type: 'tryThis',
                steps: [
                  'Create a function `multiply` that takes two numbers and returns their product',
                  'Create a function `formatUser` that takes a name and optional title, returning a formatted string',
                  'Test both functions with different inputs',
                ],
              },
            ],
          },
          {
            id: 'section-3-2',
            number: 6,
            title: 'Interfaces',
            anchor: 'interfaces',
            blocks: [
              {
                type: 'prose',
                content: 'Interfaces define the **shape of objects**. They are one of the most powerful features in TypeScript.',
              },
              {
                type: 'code',
                language: 'typescript',
                label: 'TypeScript',
                code: `// Define an interface
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // Optional property
}

// Use the interface
function createUser(user: User): void {
  console.log(\`Creating user: \${user.name}\`);
}

// This works
createUser({
  id: 1,
  name: "Alice",
  email: "alice@example.com"
});

// This would error - missing required properties
// createUser({ name: "Bob" });`,
              },
              {
                type: 'exercise',
                badge: 'Exercise 2',
                title: 'Define a Product Interface',
                goal: 'Create an interface for an e-commerce product.',
                content: `Define a \`Product\` interface with:
- id (number, required)
- name (string, required)
- price (number, required)
- description (string, optional)
- inStock (boolean, required)
- tags (string array, optional)

Then create a function \`displayProduct\` that takes a Product and logs its details.`,
              },
              {
                type: 'divider',
                label: 'Advanced Topics',
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Interfaces vs Types',
                content: 'Both `interface` and `type` can define object shapes. Interfaces are preferred for object definitions as they can be extended and merged.',
              },
            ],
          },
        ],
      },
    ],
  },
};
