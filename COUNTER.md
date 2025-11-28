
## Basic Example

```tsx
import React from 'react';
import { between, Context } from 'use-between-new';

// Create a shared hook
const useSharedCounter = between(() => {
  const [count, setCount] = React.useState(0);
  
  return {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1)
  };
});

// Component A
function ComponentA() {
  const { count, increment } = useSharedCounter();
  
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
  const { count, decrement } = useSharedCounter();
  
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

[![Edit Counter with useBetween](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/counter-with-usebetween-new-vwymy6)
