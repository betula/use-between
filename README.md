# use-between-new

React hook library for sharing state between components using TypeScript.

## Installation

```bash
npm install use-between-new
```

## Usage

### Basic Example

```tsx
import React from 'react';
import { between, Context } from 'use-between-new';

// Create a shared hook
const useCounter = between(() => {
  const [count, setCount] = React.useState(0);
  
  return {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1)
  };
});

// Component A
function ComponentA() {
  const { count, increment } = useCounter();
  
  return (
    <div>
      <h2>Component A</h2>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// Component B
function ComponentB() {
  const { count, decrement } = useCounter();
  
  return (
    <div>
      <h2>Component B</h2>
      <p>Count: {count}</p>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}

// App with Context
function App() {
  return (
    <Context>
      <ComponentA />
      <ComponentB />
    </Context>
  );
}
```

### API

#### `between(hookFn: () => any): () => any`

Creates a shared hook from a regular hook function. The returned hook will maintain the same state across all components that use it.

#### `Context`

A context component that should wrap your app to enable the use-between functionality. Place this at the root of your React component tree.

## Features

- ✅ TypeScript support
- ✅ Minimal bundle size
- ✅ React hooks compatibility
- ✅ Automatic state synchronization
- ✅ Memory efficient

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests in coverage mode
npm run test:coverage

# Build the library
npm run build

# Development mode (watch)
npm run dev
```

## License

MIT
