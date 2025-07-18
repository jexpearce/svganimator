# Motif

> The Tailwind of motion – composable SVG animation primitives with AI scaffolding

[![CI](https://github.com/yourusername/motif/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/motif/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/yourusername/motif/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/motif)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is Motif?

Motif converts raw SVGs and natural language prompts into production-ready animation code. Unlike traditional "logo makers" that export video/GIF files, Motif generates clean, framework-specific code you can copy directly into your project.

### Key Features

- 🎯 **Smart SVG Analysis**: Understands SVG structure to enable conditional animations
- 🧩 **Composable Primitives**: Small, focused animation building blocks
- ⚡ **Minimal Bundle Size**: Core primitives < 6KB gzipped
- 🔒 **Security First**: Built-in sanitization with DOMPurify
- 📦 **Framework Agnostic**: Export to CSS, React, Vue, or vanilla JS
- 🚀 **Performance**: Uses Web Animations API for optimal runtime performance

## Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build
```

## Architecture

Motif is organized as a monorepo with the following packages:

- **`@motif/schema`** - Shared TypeScript types and interfaces
- **`@motif/analysis`** - SVG processing pipeline (sanitize → optimize → parse → classify)
- **`@motif/primitives`** - Animation primitive generators
- **`@motif/react`** - Headless React bindings

## Usage Example

```tsx
import { MotionElement } from '@motif/react';

function Logo() {
  const svgString = `<svg>...</svg>`;
  
  return (
    <MotionElement
      svgString={svgString}
      animationConfig={{
        type: 'fadeIn',
        options: { duration: 1000, from: 0, to: 1 }
      }}
    />
  );
}
```

## Available Primitives

### `fadeIn`
Fades an element from transparent to opaque.

```ts
fadeIn({ duration: 1000, from: 0, to: 1 })
```

### `scale`
Scales an element from one size to another.

```ts
scale({ duration: 800, from: 0.5, to: 1, origin: 'center' })
```

### `slideIn`
Slides an element in from a direction.

```ts
slideIn({ duration: 600, fromDirection: 'left', distance: '100px' })
```

### `drawPath`
Animates stroke-based SVGs as if being drawn. *(Requires stroke-based SVG)*

```ts
drawPath({ duration: 2000, stagger: 100 })
```

### `staggerFadeIn`
Fades in child elements with staggered timing. *(Requires structured SVG with groups)*

```ts
staggerFadeIn({ duration: 400, childSelector: 'g > *', stagger: 100 })
```

## Development

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Project Structure

```
motif/
├── packages/
│   ├── schema/       # TypeScript types
│   ├── analysis/     # SVG processing
│   ├── primitives/   # Animation generators  
│   └── react/        # React bindings
├── pnpm-workspace.yaml
└── vitest.config.ts
```

### Testing

We use Vitest for testing with property-based tests via fast-check:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:run --coverage

# Watch mode
pnpm test --watch
```

### Code Quality

- TypeScript with strict mode enabled
- ESLint with recommended rules
- Prettier for formatting
- 90%+ test coverage requirement

## Roadmap

### Phase 1 (Complete) ✅
- Core engine and primitive library
- SVG analysis pipeline
- React bindings
- Comprehensive test suite

### Phase 2 (Tomorrow)
- Web UI with drag-and-drop
- AI-powered animation suggestions
- Visual timeline editor

### Phase 3 (Next Week)
- Export pipeline (CSS, Vue, Svelte)
- Language-agnostic IR format
- iOS/Android code generation

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © 2025 Motif Contributors

---

Built with ❤️ by the Motif team. Inspired by the composability of Tailwind CSS and the magic of Framer Motion. 