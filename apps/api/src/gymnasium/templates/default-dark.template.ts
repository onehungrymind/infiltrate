/**
 * Default Dark Template for Gymnasium Sessions
 * Based on the k8s-dojo styling
 */

export const DEFAULT_DARK_CSS = `
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --bg-code: #0d1117;
  --accent-yellow: #FFCC00;
  --accent-yellow-dim: rgba(255, 204, 0, 0.15);
  --accent-yellow-glow: rgba(255, 204, 0, 0.08);
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-tertiary: #6e7681;
  --border-color: #30363d;
  --border-subtle: #21262d;
  --success: #3fb950;
  --info: #58a6ff;
  --warning: #d29922;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
  background: var(--bg-primary);
  scroll-behavior: smooth;
}

[id] {
  scroll-margin-top: 2rem;
}

body {
  font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.7;
  font-weight: 400;
}

@page {
  size: A4;
  margin: 0;
}

@media print {
  html, body {
    background: var(--bg-primary) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  .page-break {
    page-break-before: always;
  }
  .avoid-break {
    page-break-inside: avoid;
  }
  pre, .code-block, .exercise, .callout, .try-this, .key-learning {
    page-break-inside: avoid;
  }
  h2, h3, h4 {
    page-break-after: avoid;
  }
}

/* Cover Page */
.cover {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(255, 204, 0, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(255, 204, 0, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.cover-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-yellow-dim);
  border: 1px solid rgba(255, 204, 0, 0.3);
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-yellow);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 3rem;
}

.cover-title {
  font-size: 4.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-yellow) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cover-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  max-width: 600px;
}

.cover-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-tertiary);
}

.cover-divider {
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-yellow), transparent);
  margin: 2rem 0;
}

/* Container */
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 4rem;
  background: var(--bg-primary);
  min-height: 100vh;
}

/* Table of Contents */
.toc {
  padding: 3rem 4rem;
  max-width: 900px;
  margin: 0 auto;
  background: var(--bg-primary);
  min-height: 100vh;
}

.toc-header {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-yellow);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.toc-section {
  margin-bottom: 2.5rem;
  page-break-inside: avoid;
}

.toc-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toc-section-title .num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--accent-yellow);
  color: var(--bg-primary);
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
}

.toc-list {
  list-style: none;
  padding-left: 2.5rem;
}

.toc-list li {
  padding: 0.4rem 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  border-bottom: 1px dotted var(--border-subtle);
}

.toc-list li:last-child {
  border-bottom: none;
}

.toc-list a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
}

.toc-list a:hover {
  color: var(--accent-yellow);
}

/* Chapter Headers */
.chapter {
  margin-bottom: 4rem;
}

.chapter-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.chapter-num {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-yellow);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.chapter-num::before {
  content: '';
  display: block;
  width: 24px;
  height: 2px;
  background: var(--accent-yellow);
}

.chapter-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.chapter-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 700px;
}

/* Section Headers */
h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

h2::before {
  content: '';
  display: block;
  width: 4px;
  height: 28px;
  background: var(--accent-yellow);
  border-radius: 2px;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

h4 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--accent-yellow);
}

/* Text */
p {
  margin-bottom: 1.25rem;
  color: var(--text-secondary);
}

strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* Lists */
ul, ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
  color: var(--text-secondary);
}

li {
  margin-bottom: 0.5rem;
}

li::marker {
  color: var(--accent-yellow);
}

/* Code */
code {
  font-family: 'Source Code Pro', monospace;
  font-size: 0.9em;
  background: var(--bg-tertiary);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  color: var(--accent-yellow);
}

pre {
  font-family: 'Source Code Pro', monospace;
  background: var(--bg-code);
  border: 1px solid var(--border-color);
  border-radius: 0 0 8px 8px;
  padding: 1rem 0;
  overflow-x: auto;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  position: relative;
}

pre code {
  background: none;
  padding: 0;
  color: var(--text-primary);
  font-size: inherit;
  display: block;
}

.code-block {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-code);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
}

.code-filename {
  color: var(--text-secondary);
  font-family: 'Source Code Pro', monospace;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-filename::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  background: var(--accent-yellow);
  border-radius: 2px;
  opacity: 0.7;
}

.code-label {
  background: var(--accent-yellow);
  color: var(--bg-primary);
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Code lines structure */
.code-lines {
  font-family: 'Source Code Pro', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  background: var(--bg-code);
  padding: 1rem 0;
}

.code-row {
  display: flex;
  flex-direction: row;
}

.code-row.highlighted {
  background: rgba(255, 204, 0, 0.1);
  border-left: 3px solid var(--accent-yellow);
}

.code-row .ln {
  flex: 0 0 3em;
  padding-right: 1em;
  color: var(--text-tertiary);
  text-align: right;
  user-select: none;
  opacity: 0.5;
}

.code-row .lc {
  flex: 1;
  padding-left: 1em;
  white-space: pre;
  color: var(--text-primary);
  border-left: 1px solid var(--border-color);
}


/* Syntax highlighting colors */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6e7681;
}

.token.punctuation {
  color: #8b949e;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #79c0ff;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #a5d6ff;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #8b949e;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #ff7b72;
}

.token.function,
.token.class-name {
  color: #d2a8ff;
}

.token.regex,
.token.important,
.token.variable {
  color: #ffa657;
}

/* Command blocks */
.command {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent-yellow);
  padding: 1rem 1.25rem;
  border-radius: 0 8px 8px 0;
  margin-bottom: 1rem;
  font-family: 'Source Code Pro', monospace;
  font-size: 0.875rem;
}

.command::before {
  content: '$';
  color: var(--accent-yellow);
  font-weight: 600;
  flex-shrink: 0;
}

/* Callouts */
.callout {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
}

.callout-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.callout.tip {
  border-left: 3px solid var(--success);
}

.callout.tip .callout-header {
  color: var(--success);
}

.callout.note {
  border-left: 3px solid var(--info);
}

.callout.note .callout-header {
  color: var(--info);
}

.callout.warning {
  border-left: 3px solid var(--warning);
}

.callout.warning .callout-header {
  color: var(--warning);
}

.callout.info {
  border-left: 3px solid var(--info);
}

.callout.info .callout-header {
  color: var(--info);
}

.callout p:last-child {
  margin-bottom: 0;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

th {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid var(--accent-yellow);
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

tr:hover td {
  background: var(--bg-secondary);
}

/* Diagram */
.diagram {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  font-family: 'Source Code Pro', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre;
  color: var(--text-secondary);
}

/* Exercise blocks */
.exercise {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin: 2rem 0;
}

.exercise-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.exercise-badge {
  background: var(--accent-yellow);
  color: var(--bg-primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exercise-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.exercise-goal {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 2px solid var(--accent-yellow-dim);
}

/* Try This blocks */
.try-this {
  background: linear-gradient(135deg, var(--accent-yellow-glow), transparent);
  border: 1px solid rgba(255, 204, 0, 0.2);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
}

.try-this-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--accent-yellow);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.try-this ol, .try-this ul {
  margin-bottom: 0;
}

/* Structure tree */
.structure {
  background: var(--bg-code);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  font-family: 'Source Code Pro', monospace;
  font-size: 0.85rem;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre;
  overflow-x: auto;
}

/* Dividers */
hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 3rem 0;
}

/* Checklist */
.checklist {
  list-style: none;
  padding-left: 0;
}

.checklist li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.checklist li::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--success);
  color: var(--bg-primary);
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Key learning highlight */
.key-learning {
  background: var(--accent-yellow-dim);
  border-left: 3px solid var(--accent-yellow);
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  border-radius: 0 8px 8px 0;
}

.key-learning strong {
  color: var(--accent-yellow);
}

/* Section divider */
.section-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 3rem 0;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

/* Comment in code */
.code-comment {
  color: var(--text-tertiary);
}

/* Footer */
.footer {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  border-top: 1px solid var(--border-color);
  margin-top: 4rem;
  background: var(--bg-primary);
}

.footer-logo {
  color: var(--accent-yellow);
  font-weight: 600;
  margin-bottom: 0.5rem;
}
`;

export const DEFAULT_DARK_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{session.title}}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
{{{styles}}}
  </style>
</head>
<body>
  <!-- Cover Page -->
  <section class="cover">
    {{#if session.badgeText}}
    <div class="cover-badge">{{session.badgeText}}</div>
    {{/if}}
    <h1 class="cover-title">{{session.title}}</h1>
    {{#if session.subtitle}}
    <p class="cover-subtitle">{{session.subtitle}}</p>
    {{/if}}
    <div class="cover-divider"></div>
    {{#if session.coverMeta}}
    <div class="cover-meta">
      {{#each session.coverMeta}}
      <span>{{this}}</span>
      {{/each}}
    </div>
    {{/if}}
  </section>

  <!-- Table of Contents -->
  <section class="toc page-break">
    <div class="toc-header">Table of Contents</div>
    {{#each session.content.parts}}
    <div class="toc-section">
      <div class="toc-section-title"><span class="num">{{this.number}}</span> {{this.title}}</div>
      <ul class="toc-list">
        {{#each this.sections}}
        <li><a href="#{{this.anchor}}">{{this.title}}</a></li>
        {{/each}}
      </ul>
    </div>
    {{/each}}
  </section>

  <!-- Content -->
  {{#each session.content.parts}}
  <div class="container page-break">
    <div class="chapter">
      <div class="chapter-header">
        <div class="chapter-num">Part {{this.number}}</div>
        <h1 class="chapter-title">{{this.title}}</h1>
        {{#if this.description}}
        <p class="chapter-description">{{this.description}}</p>
        {{/if}}
      </div>

      {{#each this.sections}}
      <section id="{{this.anchor}}">
        <h2>{{this.title}}</h2>
        {{#each this.blocks}}
        {{{renderBlock this}}}
        {{/each}}
      </section>
      {{/each}}
    </div>
  </div>
  {{/each}}

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-logo">Gymnasium Session</div>
    <p>Generated on {{generatedAt}}</p>
  </footer>


</body>
</html>`;

export const DEFAULT_TEMPLATE_METADATA = {
  name: 'Default Dark',
  description: 'Professional dark theme based on GitHub styling. Optimized for screen reading and PDF export.',
  supportsPrint: true,
  supportsDarkMode: true,
  isSystem: true,
};
