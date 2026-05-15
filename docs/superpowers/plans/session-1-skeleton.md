# Session 1 — Skeleton, Theme, Routing, Topic Grid

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Read `docs/superpowers/plans/2026-05-14-dsa-visualizer-master-plan.md` before starting — it is canonical on architecture and naming.

**Goal:** Produce a Vite + React + TypeScript app that, on `pnpm dev`, shows a dark-themed home page with 9 topic cards in a responsive grid, with a top bar and left sidebar topic navigation, and routes to placeholder pages for each topic. Pass `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. CI green on first commit.

**Architecture:** Pure client SPA scaffold. No engine, no algorithms, no visualizers yet — those come in Session 2a. Tailwind with semantic color tokens, React Router v6 layout-based routing, Zustand stores stubbed for use in 2a. Dark mode only via `<html class="dark">`.

**Tech Stack:** pnpm + Vite + React + TypeScript (strict) + Tailwind CSS + React Router + Zustand + Framer Motion (installed, unused) + Vitest + React Testing Library + ESLint + Prettier. **No version pins** — `pnpm create vite@latest` + accept current stable.

---

## File Plan (created this session)

```
DSAWebApp/
├── .github/workflows/ci.yml
├── public/favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── router.tsx
│   ├── routes/{HomePage,ArraysPage,StackQueuePage,LinkedListPage,
│   │           BinaryTreePage,BSTPage,GraphPage,SortingPage,
│   │           HashTablePage,DPPage}.tsx
│   ├── components/
│   │   ├── layout/{AppShell,Sidebar,TopBar,TopicNav}.tsx
│   │   ├── panels/TopicHeader.tsx
│   │   └── primitives/{Button,Badge,Tabs,Tooltip,Slider}.tsx
│   ├── store/{topicStore,prefsStore}.ts
│   ├── data/topics.ts
│   ├── types/topic.ts
│   ├── utils/classNames.ts
│   └── constants/colors.ts
├── tests/
│   ├── setup.ts
│   ├── store/{topicStore,prefsStore}.test.ts
│   ├── components/{Button,Badge,TopicHeader,AppShell,Sidebar,TopicNav,HomePage}.test.tsx
│   └── integration/routing.test.tsx
├── index.html
├── package.json, tsconfig.json, tsconfig.node.json
├── vite.config.ts, tailwind.config.ts, postcss.config.js
├── .eslintrc.cjs, .prettierrc, .gitignore
└── README.md
```

---

## Task 1: Initialize Vite + React + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`

- [ ] **Step 1.1: Scaffold with current-stable Vite**

Run (working directory `/Users/patipanb/Obsidian/DSAWebApp`):
```bash
pnpm create vite@latest . --template react-ts
```

Accept current stable. If prompted because the directory is non-empty, choose "Ignore files and continue" (do not overwrite `.claude/` or `docs/`).

- [ ] **Step 1.2: Install scaffold dependencies**

```bash
pnpm install
```

- [ ] **Step 1.3: Verify dev server boots**

```bash
pnpm dev
```
Expected: Vite logs a local URL and serves without errors. Kill with Ctrl-C.

- [ ] **Step 1.4: Strict TypeScript**

Open `tsconfig.json` and ensure `compilerOptions` contains: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`, `"verbatimModuleSyntax": true`. Add an alias:

```json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

Mirror the alias in `vite.config.ts`:
```ts
import path from 'node:path';
// ...
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

- [ ] **Step 1.5: Smoke check**

```bash
pnpm tsc -b --noEmit
```
Expected: zero errors.

- [ ] **Step 1.6: Initialize git + commit scaffold**

```bash
git init
git add -A
git commit -m "chore: scaffold vite + react + ts"
```

---

## Task 2: Install full dependency set

**Files:** `package.json` (modified by pnpm)

- [ ] **Step 2.1: Runtime deps**

```bash
pnpm add react-router-dom zustand framer-motion clsx \
  @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

- [ ] **Step 2.2: Tailwind + PostCSS**

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p
```

- [ ] **Step 2.3: Test stack**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @types/node
```

- [ ] **Step 2.4: Lint + format**

```bash
pnpm add -D eslint prettier eslint-plugin-react-refresh eslint-plugin-react \
  eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

- [ ] **Step 2.5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install runtime, test, and tooling deps"
```

---

## Task 3: Configure Tailwind with semantic tokens + fonts

**Files:**
- Modify: `tailwind.config.ts` (rename from `.js` if scaffold generated `.js`)
- Modify: `postcss.config.js`
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `src/main.tsx`

- [ ] **Step 3.1: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:     { base: '#020617', surface: '#0f172a', elevated: '#1e293b' },
        border: { subtle: '#1e293b', strong: '#334155' },
        text:   { primary: '#f1f5f9', secondary: '#cbd5e1', muted: '#94a3b8' },
        accent: { primary: '#fbbf24', secondary: '#22d3ee' },
        status: { success: '#34d399', warn: '#fb923c', danger: '#fb7185', info: '#60a5fa' },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Delete `tailwind.config.js` if present.

- [ ] **Step 3.2: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { height: 100%; }
  body {
    @apply bg-bg-base text-text-primary font-sans antialiased;
  }
}
```

- [ ] **Step 3.3: Set dark class in `index.html`**

In `index.html` change `<html lang="en">` to `<html lang="en" class="dark">` and update the `<title>` to `DSA Visualizer`.

- [ ] **Step 3.4: Load fonts in `src/main.tsx`**

At the top, before existing imports:

```ts
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
```

- [ ] **Step 3.5: Verify Tailwind compiles**

Edit `src/App.tsx` to:
```tsx
export default function App() {
  return <div className="p-8 text-accent-primary font-mono">DSA Visualizer</div>;
}
```

Run `pnpm dev` and open the page. Expected: amber text on near-black background, monospace font.

- [ ] **Step 3.6: Commit**

```bash
git add -A
git commit -m "feat: tailwind tokens, dark theme, variable fonts"
```

---

## Task 4: Configure Vitest

**Files:**
- Create: `tests/setup.ts`
- Modify: `vite.config.ts` (add `test` block)
- Modify: `package.json` (add scripts)

- [ ] **Step 4.1: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4.2: Update `vite.config.ts`**

Add a `test` block:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
  },
});
```

- [ ] **Step 4.3: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc -b --noEmit",
  "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
  "format": "prettier --write ."
}
```

- [ ] **Step 4.4: Write smoke test**

Create `tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest is wired up', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4.5: Run test**

```bash
pnpm test
```
Expected: 1 passed.

- [ ] **Step 4.6: Commit**

```bash
git add -A
git commit -m "chore: configure vitest with jsdom and jest-dom matchers"
```

---

## Task 5: ESLint + Prettier

**Files:**
- Create: `.eslintrc.cjs`, `.prettierrc`, `.eslintignore`, `.prettierignore`

- [ ] **Step 5.1: `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'react-refresh'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.*'],
};
```

- [ ] **Step 5.2: `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true,
  "arrowParens": "always"
}
```

- [ ] **Step 5.3: `.eslintignore` and `.prettierignore`**

Both files, identical content:
```
dist
node_modules
pnpm-lock.yaml
```

- [ ] **Step 5.4: Verify**

```bash
pnpm lint
pnpm format
```
Expected: lint passes; format rewrites any non-conforming files.

- [ ] **Step 5.5: Commit**

```bash
git add -A
git commit -m "chore: eslint + prettier config"
```

---

## Task 6: Types, constants, and utilities

**Files:**
- Create: `src/types/topic.ts`, `src/data/topics.ts`, `src/utils/classNames.ts`, `src/constants/colors.ts`

- [ ] **Step 6.1: `src/types/topic.ts`**

```ts
export type TopicId =
  | 'arrays'
  | 'stack-queue'
  | 'linked-list'
  | 'binary-tree'
  | 'bst'
  | 'graph'
  | 'sorting'
  | 'hash-table'
  | 'dp';

export interface TopicMeta {
  id: TopicId;
  title: string;
  shortDescription: string;
  longDescription: string;
  path: `/${string}`;
  number: number;
  emoji: string;
}
```

- [ ] **Step 6.2: `src/data/topics.ts`**

```ts
import type { TopicMeta } from '@/types/topic';

export const TOPICS: TopicMeta[] = [
  { id: 'arrays', number: 1, emoji: '📊', title: 'Arrays',
    path: '/arrays',
    shortDescription: 'Two pointers, sliding window',
    longDescription: 'Visualize pointer-based traversals and sliding windows on arrays. Step through index movement, window expansion, and running aggregates.' },
  { id: 'stack-queue', number: 2, emoji: '🥞', title: 'Stack & Queue',
    path: '/stack-queue',
    shortDescription: 'Brackets, monotonic stack, FIFO',
    longDescription: 'Push, pop, and monotonic stack patterns. See how balanced brackets validate, and how a monotonic stack solves next-greater-element problems.' },
  { id: 'linked-list', number: 3, emoji: '🔗', title: 'Linked List',
    path: '/linked-list',
    shortDescription: 'Singly & doubly linked',
    longDescription: 'Singly and doubly linked lists with animated pointer rewiring. Watch traverse, insert, delete, and reverse operations build intuition for pointer manipulation.' },
  { id: 'binary-tree', number: 4, emoji: '🌲', title: 'Binary Tree',
    path: '/binary-tree',
    shortDescription: 'In/pre/post/level-order traversals',
    longDescription: 'All four traversal orders with a live call-stack and visited list. Builds the recursion mental model needed for tree problems.' },
  { id: 'bst', number: 5, emoji: '🌳', title: 'Binary Search Tree',
    path: '/bst',
    shortDescription: 'Insert, search, delete',
    longDescription: 'BST operations with comparison highlights. Delete handles all three cases (leaf, one child, two children with in-order successor) visibly.' },
  { id: 'graph', number: 6, emoji: '🕸️', title: 'Graph',
    path: '/graph',
    shortDescription: 'BFS & DFS (grid + adjacency)',
    longDescription: 'Run BFS and DFS on both a grid and an adjacency-list graph. Edit walls or graph topology and watch the frontier expand step by step.' },
  { id: 'sorting', number: 7, emoji: '📈', title: 'Sorting',
    path: '/sorting',
    shortDescription: 'Bubble, merge, quick, heap',
    longDescription: 'Four sorts side-by-side with race mode — wall-clock-synced so the asymptotic complexity differences are visually obvious.' },
  { id: 'hash-table', number: 8, emoji: '🗂️', title: 'Hash Table',
    path: '/hash-table',
    shortDescription: 'Chaining + open addressing',
    longDescription: 'Two collision strategies, both animated: chaining grows buckets, open addressing probes for the next slot. Hash computation shown live.' },
  { id: 'dp', number: 9, emoji: '🧮', title: 'Dynamic Programming',
    path: '/dp',
    shortDescription: 'Fib, 0/1 knapsack, LCS',
    longDescription: 'Memoization tables fill in real time. Recurrence reads light up the cells they consult, current-fill cells are highlighted, and LCS shows the final traceback path.' },
];
```

- [ ] **Step 6.3: `src/utils/classNames.ts`**

```ts
import clsx, { type ClassValue } from 'clsx';
export function cn(...inputs: ClassValue[]): string { return clsx(...inputs); }
```

- [ ] **Step 6.4: `src/constants/colors.ts`**

```ts
// Re-exports the semantic palette keys for use in TS (mirrors tailwind.config.ts).
export const COLORS = {
  bg: { base: '#020617', surface: '#0f172a', elevated: '#1e293b' },
  border: { subtle: '#1e293b', strong: '#334155' },
  text: { primary: '#f1f5f9', secondary: '#cbd5e1', muted: '#94a3b8' },
  accent: { primary: '#fbbf24', secondary: '#22d3ee' },
  status: { success: '#34d399', warn: '#fb923c', danger: '#fb7185', info: '#60a5fa' },
} as const;
```

- [ ] **Step 6.5: Verify**

```bash
pnpm typecheck && pnpm lint
```
Expected: zero errors.

- [ ] **Step 6.6: Commit**

```bash
git add -A
git commit -m "feat: topic types, registry, color tokens, cn helper"
```

---

## Task 7: Zustand stores (TDD)

**Files:**
- Test: `tests/store/topicStore.test.ts`, `tests/store/prefsStore.test.ts`
- Create: `src/store/topicStore.ts`, `src/store/prefsStore.ts`

- [ ] **Step 7.1: Failing test for `topicStore`**

`tests/store/topicStore.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useTopicStore } from '@/store/topicStore';

describe('topicStore', () => {
  beforeEach(() => useTopicStore.setState({ selectedTopicId: null }));

  it('defaults selectedTopicId to null', () => {
    expect(useTopicStore.getState().selectedTopicId).toBeNull();
  });

  it('sets the selected topic id', () => {
    useTopicStore.getState().setSelectedTopicId('arrays');
    expect(useTopicStore.getState().selectedTopicId).toBe('arrays');
  });

  it('clears the selection when given null', () => {
    useTopicStore.getState().setSelectedTopicId('graph');
    useTopicStore.getState().setSelectedTopicId(null);
    expect(useTopicStore.getState().selectedTopicId).toBeNull();
  });
});
```

- [ ] **Step 7.2: Run — expect fail**

```bash
pnpm test -- topicStore
```
Expected: FAIL with "Cannot find module '@/store/topicStore'".

- [ ] **Step 7.3: Implement `topicStore`**

`src/store/topicStore.ts`:
```ts
import { create } from 'zustand';
import type { TopicId } from '@/types/topic';

interface TopicState {
  selectedTopicId: TopicId | null;
  setSelectedTopicId: (id: TopicId | null) => void;
}

export const useTopicStore = create<TopicState>((set) => ({
  selectedTopicId: null,
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),
}));
```

- [ ] **Step 7.4: Run — expect pass**

```bash
pnpm test -- topicStore
```
Expected: 3 passed.

- [ ] **Step 7.5: Failing test for `prefsStore`**

`tests/store/prefsStore.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { usePrefsStore } from '@/store/prefsStore';

describe('prefsStore', () => {
  beforeEach(() => usePrefsStore.setState({ speedIndex: 2 }));

  it('defaults speedIndex to 2 (1× preset)', () => {
    expect(usePrefsStore.getState().speedIndex).toBe(2);
  });

  it('updates speedIndex within bounds', () => {
    usePrefsStore.getState().setSpeedIndex(4);
    expect(usePrefsStore.getState().speedIndex).toBe(4);
  });

  it('clamps speedIndex to [0,4]', () => {
    usePrefsStore.getState().setSpeedIndex(99);
    expect(usePrefsStore.getState().speedIndex).toBe(4);
    usePrefsStore.getState().setSpeedIndex(-3);
    expect(usePrefsStore.getState().speedIndex).toBe(0);
  });
});
```

- [ ] **Step 7.6: Run — expect fail**

```bash
pnpm test -- prefsStore
```
Expected: FAIL.

- [ ] **Step 7.7: Implement `prefsStore`**

`src/store/prefsStore.ts`:
```ts
import { create } from 'zustand';

interface PrefsState {
  speedIndex: number; // 0..4 — index into SPEED_PRESETS (defined in Session 2a)
  setSpeedIndex: (i: number) => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const usePrefsStore = create<PrefsState>((set) => ({
  speedIndex: 2,
  setSpeedIndex: (i) => set({ speedIndex: clamp(i, 0, 4) }),
}));
```

- [ ] **Step 7.8: Run all tests**

```bash
pnpm test
```
Expected: 6 passed total.

- [ ] **Step 7.9: Commit**

```bash
git add -A
git commit -m "feat(store): topicStore + prefsStore with bounded speed index"
```

---

## Task 8: `Button` primitive (TDD)

**Files:**
- Test: `tests/components/Button.test.tsx`
- Create: `src/components/primitives/Button.tsx`

- [ ] **Step 8.1: Failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/primitives/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies primary variant class', () => {
    render(<Button variant="primary">P</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-accent-primary/);
  });

  it('supports disabled state', () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

- [ ] **Step 8.2: Run — expect fail**

```bash
pnpm test -- Button
```

- [ ] **Step 8.3: Implement `Button`**

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/classNames';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent-primary text-bg-base hover:brightness-110',
  secondary: 'bg-bg-elevated text-text-primary border border-border-strong hover:bg-bg-surface',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-elevated',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'secondary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
```

- [ ] **Step 8.4: Run — expect pass**

```bash
pnpm test -- Button
```
Expected: 4 passed.

- [ ] **Step 8.5: Commit**

```bash
git add -A
git commit -m "feat(ui): Button primitive with primary/secondary/ghost variants"
```

---

## Task 9: `Badge` primitive (TDD)

**Files:**
- Test: `tests/components/Badge.test.tsx`
- Create: `src/components/primitives/Badge.tsx`

- [ ] **Step 9.1: Failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/primitives/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>O(n)</Badge>);
    expect(screen.getByText('O(n)')).toBeInTheDocument();
  });
  it('applies tone class', () => {
    render(<Badge tone="success">ok</Badge>);
    expect(screen.getByText('ok').className).toMatch(/status-success/);
  });
});
```

- [ ] **Step 9.2: Run — expect fail.**

- [ ] **Step 9.3: Implement `Badge`**

```tsx
import { cn } from '@/utils/classNames';
import type { ReactNode } from 'react';

type Tone = 'info' | 'success' | 'warn' | 'danger' | 'neutral';
const toneClass: Record<Tone, string> = {
  info:    'bg-status-info/15  text-status-info  border-status-info/30',
  success: 'bg-status-success/15 text-status-success border-status-success/30',
  warn:    'bg-status-warn/15 text-status-warn border-status-warn/30',
  danger:  'bg-status-danger/15 text-status-danger border-status-danger/30',
  neutral: 'bg-bg-elevated text-text-secondary border-border-strong',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-mono rounded-md border', toneClass[tone])}>
      {children}
    </span>
  );
}
```

- [ ] **Step 9.4: Run — expect pass.**

- [ ] **Step 9.5: Commit**

```bash
git add -A
git commit -m "feat(ui): Badge primitive"
```

---

## Task 10: `Tabs`, `Tooltip`, `Slider` primitives (light TDD)

These three are used by Session 2a/2b — we build minimal accessible shells now so their imports exist.

**Files:**
- Test: `tests/components/Primitives.test.tsx`
- Create: `src/components/primitives/{Tabs,Tooltip,Slider}.tsx`

- [ ] **Step 10.1: Failing combined test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/primitives/Tabs';
import { Tooltip } from '@/components/primitives/Tooltip';
import { Slider } from '@/components/primitives/Slider';

describe('Tabs', () => {
  it('renders tabs and switches active on click', async () => {
    const { rerender } = render(
      <Tabs value="a" onChange={() => {}} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
    );
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    let v = 'a';
    rerender(
      <Tabs value={v} onChange={(x) => { v = x; }} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
    );
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  });
});

describe('Tooltip', () => {
  it('renders trigger and tooltip text', () => {
    render(<Tooltip label="help"><button>btn</button></Tooltip>);
    expect(screen.getByRole('button', { name: 'btn' })).toBeInTheDocument();
    expect(screen.getByText('help')).toBeInTheDocument();
  });
});

describe('Slider', () => {
  it('renders with given value and responds to arrow keys', async () => {
    let v = 2;
    const { rerender } = render(<Slider min={0} max={4} value={v} onChange={(x) => { v = x; }} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(v).toBe(3);
    rerender(<Slider min={0} max={4} value={v} onChange={(x) => { v = x; }} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '3');
  });
});
```

- [ ] **Step 10.2: Run — expect fail.**

- [ ] **Step 10.3: Implement `Tabs`**

```tsx
import { cn } from '@/utils/classNames';

interface Option<T extends string> { value: T; label: string }

export function Tabs<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: Option<T>[] }) {
  return (
    <div role="tablist" className="inline-flex gap-1 p-1 bg-bg-elevated rounded-lg border border-border-subtle">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'px-3 h-8 text-sm rounded-md transition',
              active ? 'bg-accent-primary text-bg-base font-medium' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 10.4: Implement `Tooltip`** (minimal — visible label rendered as a sibling, full hover-popover behavior deferred)

```tsx
import type { ReactNode } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-mono bg-bg-elevated border border-border-strong rounded text-text-secondary opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap"
      >
        {label}
      </span>
    </span>
  );
}
```
Note: test asserts the label is *in the DOM* (not visible) — opacity-0 still renders, which is correct.

- [ ] **Step 10.5: Implement `Slider`** (discrete, 5-position)

```tsx
import { cn } from '@/utils/classNames';
import { useId, type KeyboardEvent } from 'react';

interface Props {
  min: number; max: number; value: number; onChange: (v: number) => void;
  label?: string;
}

export function Slider({ min, max, value, onChange, label }: Props) {
  const id = useId();
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + 1)); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(min, value - 1)); }
    if (e.key === 'Home') { e.preventDefault(); onChange(min); }
    if (e.key === 'End')  { e.preventDefault(); onChange(max); }
  };
  const ticks = max - min + 1;
  return (
    <div className="flex flex-col gap-1" id={id}>
      {label && <span className="text-xs text-text-muted font-mono">{label}</span>}
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={handleKey}
        className="relative h-2 w-40 bg-bg-elevated rounded-full border border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-primary"
          style={{ left: `calc(${(value - min) / (ticks - 1) * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 10.6: Run — expect pass.**

```bash
pnpm test
```

- [ ] **Step 10.7: Commit**

```bash
git add -A
git commit -m "feat(ui): Tabs, Tooltip, Slider primitives"
```

---

## Task 11: `TopicHeader` panel (TDD)

**Files:**
- Test: `tests/components/TopicHeader.test.tsx`
- Create: `src/components/panels/TopicHeader.tsx`

- [ ] **Step 11.1: Failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicHeader } from '@/components/panels/TopicHeader';

describe('TopicHeader', () => {
  it('renders the topic title and number', () => {
    render(<TopicHeader topicId="arrays" />);
    expect(screen.getByText('Arrays')).toBeInTheDocument();
    expect(screen.getByText(/#01/)).toBeInTheDocument();
  });
  it('renders nothing useful for unknown id', () => {
    // @ts-expect-error invalid id intentionally
    render(<TopicHeader topicId="nope" />);
    expect(screen.queryByText('Arrays')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 11.2: Run — expect fail.**

- [ ] **Step 11.3: Implement**

```tsx
import { TOPICS } from '@/data/topics';
import type { TopicId } from '@/types/topic';

export function TopicHeader({ topicId }: { topicId: TopicId }) {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return null;
  return (
    <header className="flex items-baseline gap-3 px-8 py-6 border-b border-border-subtle">
      <span className="font-mono text-text-muted text-sm">#{String(topic.number).padStart(2, '0')}</span>
      <span className="text-3xl">{topic.emoji}</span>
      <h1 className="text-2xl font-semibold text-text-primary">{topic.title}</h1>
      <p className="text-sm text-text-muted ml-auto max-w-md text-right">{topic.shortDescription}</p>
    </header>
  );
}
```

- [ ] **Step 11.4: Run — expect pass.**

- [ ] **Step 11.5: Commit**

```bash
git add -A
git commit -m "feat(ui): TopicHeader panel"
```

---

## Task 12: `TopBar`, `TopicNav`, `Sidebar`, `AppShell` (TDD layout)

**Files:**
- Test: `tests/components/Sidebar.test.tsx`, `tests/components/TopicNav.test.tsx`, `tests/components/AppShell.test.tsx`
- Create: `src/components/layout/{TopBar,TopicNav,Sidebar,AppShell}.tsx`

- [ ] **Step 12.1: Failing test — `TopicNav`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopicNav } from '@/components/layout/TopicNav';
import { TOPICS } from '@/data/topics';

describe('TopicNav', () => {
  it('renders a link for every topic', () => {
    render(<MemoryRouter><TopicNav /></MemoryRouter>);
    for (const t of TOPICS) {
      expect(screen.getByRole('link', { name: new RegExp(t.title) })).toHaveAttribute('href', t.path);
    }
  });
});
```

- [ ] **Step 12.2: Implement `TopicNav`**

```tsx
import { NavLink } from 'react-router-dom';
import { TOPICS } from '@/data/topics';
import { cn } from '@/utils/classNames';

export function TopicNav() {
  return (
    <nav aria-label="Topics" className="flex flex-col gap-0.5 p-3">
      {TOPICS.map((t) => (
        <NavLink
          key={t.id}
          to={t.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 h-10 rounded-lg border-l-2 transition',
              isActive
                ? 'bg-bg-elevated text-accent-primary border-accent-primary'
                : 'text-text-secondary border-transparent hover:bg-bg-elevated hover:text-text-primary',
            )
          }
        >
          <span className="font-mono text-xs text-text-muted w-6">#{String(t.number).padStart(2, '0')}</span>
          <span className="text-base">{t.emoji}</span>
          <span className="text-sm font-medium">{t.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 12.3: Failing test — `Sidebar`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar', () => {
  it('renders the Topics heading and the topic nav', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText(/Topics/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Topics' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 12.4: Implement `Sidebar`**

```tsx
import { TopicNav } from './TopicNav';

export function Sidebar() {
  return (
    <aside className="h-full bg-bg-surface border-r border-border-subtle overflow-y-auto">
      <h2 className="px-6 pt-6 pb-2 text-xs font-mono uppercase tracking-wider text-text-muted">Topics</h2>
      <TopicNav />
    </aside>
  );
}
```

- [ ] **Step 12.5: Implement `TopBar`** (no test — trivial visual)

```tsx
import { Link } from 'react-router-dom';

export function TopBar() {
  return (
    <header className="h-14 bg-bg-surface border-b border-border-subtle flex items-center px-6">
      <Link to="/" className="font-mono text-accent-primary text-base hover:brightness-110">
        DSA Visualizer
      </Link>
    </header>
  );
}
```

- [ ] **Step 12.6: Failing test — `AppShell`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

describe('AppShell', () => {
  it('renders TopBar, Sidebar, and the child route via outlet', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/test" element={<div data-testid="child">Hello</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'DSA Visualizer' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Topics' })).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
```

- [ ] **Step 12.7: Implement `AppShell`**

```tsx
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="grid grid-rows-[auto_1fr] h-full">
      <TopBar />
      <div className="grid grid-cols-[260px_1fr] min-h-0">
        <Sidebar />
        <main className="overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
```

- [ ] **Step 12.8: Run — expect pass.**

```bash
pnpm test
```

- [ ] **Step 12.9: Commit**

```bash
git add -A
git commit -m "feat(layout): TopBar, Sidebar, TopicNav, AppShell"
```

---

## Task 13: `HomePage` with 9 topic cards (TDD)

**Files:**
- Test: `tests/components/HomePage.test.tsx`
- Create: `src/routes/HomePage.tsx`

- [ ] **Step 13.1: Failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/routes/HomePage';
import { TOPICS } from '@/data/topics';

describe('HomePage', () => {
  it('renders a card for every topic with a link to its path', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const t of TOPICS) {
      const link = screen.getByRole('link', { name: new RegExp(t.title) });
      expect(link).toHaveAttribute('href', t.path);
    }
  });
  it('shows the long description for each card', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const t of TOPICS) {
      expect(screen.getByText(t.longDescription)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 13.2: Run — expect fail.**

- [ ] **Step 13.3: Implement `HomePage`**

```tsx
import { Link } from 'react-router-dom';
import { TOPICS } from '@/data/topics';

export function HomePage() {
  return (
    <section className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text-primary">Visualize a data structure.</h1>
        <p className="mt-2 text-text-muted max-w-2xl">
          Nine topics. Step-through animations, your own input, the executing code highlighted in real time,
          Big-O at a glance, and curated NeetCode problems for each pattern.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TOPICS.map((t) => (
          <Link
            key={t.id}
            to={t.path}
            aria-label={`Open ${t.title}`}
            className="group bg-bg-surface border border-border-subtle rounded-2xl p-6 hover:border-accent-primary transition flex flex-col gap-3"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-text-muted text-sm">#{String(t.number).padStart(2, '0')}</span>
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-lg font-semibold text-text-primary">{t.title}</span>
            </div>
            <p className="text-sm text-text-secondary">{t.longDescription}</p>
            <span className="mt-auto text-sm font-mono text-accent-primary group-hover:translate-x-0.5 transition">Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 13.4: Run — expect pass.**

- [ ] **Step 13.5: Commit**

```bash
git add -A
git commit -m "feat(home): topic grid with 9 cards"
```

---

## Task 14: Stub topic pages (9 files)

**Files (Create all nine):**

| File | Component name | `topicId` argument |
|---|---|---|
| `src/routes/ArraysPage.tsx` | `ArraysPage` | `'arrays'` |
| `src/routes/StackQueuePage.tsx` | `StackQueuePage` | `'stack-queue'` |
| `src/routes/LinkedListPage.tsx` | `LinkedListPage` | `'linked-list'` |
| `src/routes/BinaryTreePage.tsx` | `BinaryTreePage` | `'binary-tree'` |
| `src/routes/BSTPage.tsx` | `BSTPage` | `'bst'` |
| `src/routes/GraphPage.tsx` | `GraphPage` | `'graph'` |
| `src/routes/SortingPage.tsx` | `SortingPage` | `'sorting'` |
| `src/routes/HashTablePage.tsx` | `HashTablePage` | `'hash-table'` |
| `src/routes/DPPage.tsx` | `DPPage` | `'dp'` |

- [ ] **Step 14.1: Write all nine files using the template below.**

Template (replace `<COMPONENT>` and `<TOPIC_ID>` from the table above):

```tsx
import { TopicHeader } from '@/components/panels/TopicHeader';

export function <COMPONENT>() {
  return (
    <>
      <TopicHeader topicId="<TOPIC_ID>" />
      <div className="p-8 text-text-muted">
        <p>Coming soon. Engine and visualizer ship in Session 2a.</p>
        <div data-testid="visualizer-slot" className="mt-6 h-64 bg-bg-surface border border-dashed border-border-strong rounded-2xl" />
      </div>
    </>
  );
}
```

So `ArraysPage.tsx` is:

```tsx
import { TopicHeader } from '@/components/panels/TopicHeader';

export function ArraysPage() {
  return (
    <>
      <TopicHeader topicId="arrays" />
      <div className="p-8 text-text-muted">
        <p>Coming soon. Engine and visualizer ship in Session 2a.</p>
        <div data-testid="visualizer-slot" className="mt-6 h-64 bg-bg-surface border border-dashed border-border-strong rounded-2xl" />
      </div>
    </>
  );
}
```

…and the other eight follow the same shape, varying only the component name and the `topicId` string per the table.

- [ ] **Step 14.2: Verify**

```bash
pnpm typecheck
```
Expected: zero errors. (No tests for these — they're trivial wrappers and the integration test in Task 15 exercises them.)

- [ ] **Step 14.3: Commit**

```bash
git add -A
git commit -m "feat(routes): stub pages for all 9 topics"
```

---

## Task 15: Router + wiring `topicStore` to active route (TDD)

**Files:**
- Create: `src/router.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/components/layout/AppShell.tsx`
- Test: `tests/integration/routing.test.tsx`

- [ ] **Step 15.1: Create `src/router.tsx`**

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/routes/HomePage';
import { ArraysPage } from '@/routes/ArraysPage';
import { StackQueuePage } from '@/routes/StackQueuePage';
import { LinkedListPage } from '@/routes/LinkedListPage';
import { BinaryTreePage } from '@/routes/BinaryTreePage';
import { BSTPage } from '@/routes/BSTPage';
import { GraphPage } from '@/routes/GraphPage';
import { SortingPage } from '@/routes/SortingPage';
import { HashTablePage } from '@/routes/HashTablePage';
import { DPPage } from '@/routes/DPPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'arrays', element: <ArraysPage /> },
      { path: 'stack-queue', element: <StackQueuePage /> },
      { path: 'linked-list', element: <LinkedListPage /> },
      { path: 'binary-tree', element: <BinaryTreePage /> },
      { path: 'bst', element: <BSTPage /> },
      { path: 'graph', element: <GraphPage /> },
      { path: 'sorting', element: <SortingPage /> },
      { path: 'hash-table', element: <HashTablePage /> },
      { path: 'dp', element: <DPPage /> },
    ],
  },
]);
```

- [ ] **Step 15.2: Update `src/App.tsx`**

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 15.3: Wire `topicStore` to the active route in `AppShell`**

Update `src/components/layout/AppShell.tsx`:

```tsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useTopicStore } from '@/store/topicStore';
import { TOPICS } from '@/data/topics';

export function AppShell() {
  const { pathname } = useLocation();
  const setSelected = useTopicStore((s) => s.setSelectedTopicId);
  useEffect(() => {
    const match = TOPICS.find((t) => t.path === pathname);
    setSelected(match?.id ?? null);
  }, [pathname, setSelected]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-full">
      <TopBar />
      <div className="grid grid-cols-[260px_1fr] min-h-0">
        <Sidebar />
        <main className="overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
```

- [ ] **Step 15.4: Routing integration test**

`tests/integration/routing.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/routes/HomePage';
import { ArraysPage } from '@/routes/ArraysPage';
import { GraphPage } from '@/routes/GraphPage';
import { useTopicStore } from '@/store/topicStore';

function buildRouter(initial: string) {
  return createMemoryRouter(
    [{
      element: <AppShell />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'arrays', element: <ArraysPage /> },
        { path: 'graph', element: <GraphPage /> },
      ],
    }],
    { initialEntries: [initial] },
  );
}

describe('routing', () => {
  it('home page → arrays page sets topicStore', async () => {
    render(<RouterProvider router={buildRouter('/')} />);
    await userEvent.click(screen.getByRole('link', { name: /Open Arrays/ }));
    await waitFor(() => expect(screen.getByText('Coming soon. Engine and visualizer ship in Session 2a.')).toBeInTheDocument());
    expect(useTopicStore.getState().selectedTopicId).toBe('arrays');
  });

  it('directly mounting /graph sets topicStore', async () => {
    render(<RouterProvider router={buildRouter('/graph')} />);
    await waitFor(() => expect(useTopicStore.getState().selectedTopicId).toBe('graph'));
  });
});
```

- [ ] **Step 15.5: Run all tests**

```bash
pnpm test
```
Expected: every test passes.

- [ ] **Step 15.6: Manual browser check**

```bash
pnpm dev
```
Open the URL. Verify:
1. Home shows 9 cards, dark theme, amber accents.
2. Clicking each card navigates to the right placeholder page.
3. Sidebar TopicNav highlights the active topic.
4. Top bar "DSA Visualizer" link returns home.
5. No console errors. Kill server.

- [ ] **Step 15.7: Commit**

```bash
git add -A
git commit -m "feat: react-router wiring + active-topic sync to store"
```

---

## Task 16: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 16.1: Workflow file**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

- [ ] **Step 16.2: Verify locally that every script the CI invokes works**

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
Expected: all four succeed. If `--frozen-lockfile` fails, drop the flag locally but keep it in CI — the lockfile was just regenerated by `pnpm install` in Task 2.

- [ ] **Step 16.3: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions workflow for lint/typecheck/test/build"
```

---

## Task 17: README + handoff note

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/plans/session-1-skeleton.md` (this file — add a "Session 1 outcome" appendix)

- [ ] **Step 17.1: `README.md`**

```markdown
# DSA Visualizer

Interactive visualizations of data structures and algorithms with play/pause/step controls, real-time code highlighting, Big-O badges, and mapped NeetCode practice problems.

## Stack

Vite · React · TypeScript (strict) · Tailwind CSS · Framer Motion · Zustand · React Router · Vitest · pnpm.

## Develop

```bash
pnpm install
pnpm dev
```

## Verify

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Architecture

See `docs/superpowers/plans/2026-05-14-dsa-visualizer-master-plan.md` for the canonical design document. Each implementation session has its own plan under `docs/superpowers/plans/session-N-*.md`.
```

- [ ] **Step 17.2: Append handoff appendix to this file**

Append to `docs/superpowers/plans/session-1-skeleton.md`:

```markdown
---

## Session 1 Outcome (filled in at session end)

- Dependencies resolved (paste `pnpm list --depth=0` output):
  - …
- Deviations from this plan:
  - …
- State for Session 2a:
  - Engine: not present
  - Algorithms: not present
  - Visualizers: not present
  - Visualizer slots: `data-testid="visualizer-slot"` in every topic page
  - Shared panels present: `TopicHeader` only
  - Primitives present: `Button`, `Badge`, `Tabs`, `Tooltip`, `Slider`
  - Stores present: `topicStore`, `prefsStore` (both wired, used)
  - Tests passing: <N>
  - CI: green on commit <sha>
```

- [ ] **Step 17.3: Final commit**

```bash
git add -A
git commit -m "docs: README and Session 1 handoff appendix"
```

---

## Final Verification

- [ ] Run the full check suite one more time and paste output into the session-end report:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview &
sleep 2 && curl -s http://localhost:4173 | grep -i "dsa visualizer"
kill %1
```
Expected: all green; the curl finds the title in the preview HTML.

- [ ] Use `superpowers:verification-before-completion` before declaring Session 1 done — paste real command output, not summaries.

---

## Out of Scope (defer to later sessions)

- Engine / runner / `useAlgorithmRun` / `serializeRun` → Session 2a
- Algorithm files of any kind → Session 2a (twoPointers), 2b (slidingWindow), 3+
- Visualizer components → Session 2a (ArrayVisualizer) onward
- `CodePanel`, `ComplexityBadge`, `ProblemsSidebar`, `StepNarration`, `VariableInspector`, `CallStackPanel`, `KeyInsightCallout`, `InputPanel`, `AlgorithmTabs`, `PlaybackControls`, `SpeedSlider`, `ProgressBar` → 2a builds the three runtime-loop ones; 2b builds the rest
- Data files (`codeSnippets`, `complexities`, `neetcodeProblems`, `defaultInputs`, `keyInsights`) → 2b for arrays only
- Parsers (`parseArray`, `parseTree`, `parseGraph`, `parseLinkedList`) → topic sessions
- Framer Motion is installed but unused — first appearance is in Session 2a's `ArrayVisualizer`

If a task tempts you toward any of the above, stop and end Session 1.
