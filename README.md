# use-between-new

An **easy-to-use** React hook library for sharing state between components

[![npm version](https://img.shields.io/npm/v/use-between-new?style=flat-square)](https://www.npmjs.com/package/use-between-new) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-between-new?style=flat-square)](https://bundlephobia.com/result?p=use-between-new) [![typescript supported](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/betula/use-between)


Imagine you have a large office with many rooms (React components), and in each room people work with their own data. Normally in React, each "room" lives its own life, and if you need to pass information from one room to another, you have to run "wires" through all the walls (prop drilling) or use complex systems like Redux.

**This code solves this problem in an elegant way!** 🎯

## How does it work?

The code creates something like a **"magic radio"** for your React application. Each shared hook acts like a radio station, broadcasting its updates to all connected components.

1. **The `between()` function** — this is the main magic! You give it a regular React hook, and it transforms it into a "shared hook" that different components can connect to simultaneously. They will all see **the same data** in real-time.

2. **Context** — this is the "coverage area" of your magic radio. Inside this zone, all components can use the shared hooks.

## Why is this needed?

Instead of passing data through dozens of components or setting up heavyweight state management systems, you simply wrap your hook in `between()` — and voilà! Any component can use this hook and receive up-to-date data automatically.

**Real-life example**: if one user changes the theme, all open application windows instantly switch — no manual synchronization needed! ✨

Here's how you could implement this with `between()`:

```javascript
import { useState } from "react";
import { between, Context } from "use-between-new";

// Using regular React hooks
const useSharedTheme = between(() => {
  const [theme, setTheme] = useState('light');

  return { 
    theme, 
    setTheme
  };
});

// Now use it in any component!
function Header() {
  const { theme, setTheme } = useSharedTheme();
  
  return (
    <header className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}

function Sidebar() {
  const { theme } = useSharedTheme();

  return <aside className={theme}>Sidebar content</aside>;
}

// Wrap your app with Context
function App() {
  return (
    <Context>
      <Header />
      <Sidebar />
      <Footer />
    </Context>
  );
}
```

[![Edit Theme with useBetween New](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/theme-with-usebetween-new-j4lg8d)

When you click the button in Header, both Sidebar and Footer instantly update to the new theme — no props passed, no context provider boilerplate, no Redux store. Just simple, shared state! 🎨

The code uses memoization and optimizations so components only re-render when the data actually changes.

## Supported hooks

**All hooks** including `useContext` and `react-router-dom`.

## Installation

```bash
npm install use-between-new
```

## Features

- ✅ TypeScript support
- ✅ Minimal bundle size
- ✅ React hooks compatibility
- ✅ Automatic state synchronization
- ✅ Memory efficient


Enjoy your code!

And good luck! 🍀