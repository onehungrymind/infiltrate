// Seed payload for Kasita domain model
// Only seeds up to learning paths - downstream entities (concepts, sub-concepts, KUs, etc.)
// are added via AI generation in the app
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
    {
      email: 'admin@test.com',
      password: 'insecure',
      name: 'Admin User',
      role: 'admin' as const,
    },
  ],
  learningPaths: [
    {
      name: 'React Server Components',
      domain: 'Web Development',
      targetSkill: 'Build production-ready RSC applications',
      status: 'not-started' as const,
      visibility: 'shared' as const,
    },
    {
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
      status: 'not-started' as const,
      visibility: 'private' as const,
    },
  ],
};
