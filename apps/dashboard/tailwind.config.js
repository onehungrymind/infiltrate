/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'theme': {
          // Dark theme (primary) - blues and purples
          'dark-bg': '#0a0a0f',
          'dark-bg-secondary': '#0f0f1a',
          'dark-surface': '#151520',
          'dark-surface-elevated': '#1a1a2e',
          'dark-border': '#2a2a3e',
          'dark-text': '#e0e0f0',
          'dark-text-muted': '#a0a0b8',
          'dark-accent-blue': '#3b82f6',
          'dark-accent-purple': '#8b5cf6',
          'dark-accent-indigo': '#6366f1',
          
          // Light theme - soft blues and purples
          'light-bg': '#f8f9ff',
          'light-bg-secondary': '#f0f2ff',
          'light-surface': '#ffffff',
          'light-surface-elevated': '#fafbff',
          'light-border': '#e0e4f0',
          'light-text': '#1a1a2e',
          'light-text-muted': '#6b7280',
          'light-accent-blue': '#2563eb',
          'light-accent-purple': '#7c3aed',
          'light-accent-indigo': '#4f46e5',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
        'gradient-dark-subtle': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        'gradient-light': 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 50%, #fafbff 100%)',
        'gradient-light-subtle': 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-accent-light': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

