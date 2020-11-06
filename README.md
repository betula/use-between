# use-between

[![npm version](https://img.shields.io/npm/v/use-between?style=flat-square)](https://www.npmjs.com/package/use-between) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-between?style=flat-square)](https://bundlephobia.com/result?p=use-between) [![build status](https://img.shields.io/github/workflow/status/betula/use-between/Tests?style=flat-square)](https://github.com/betula/use-between/actions?workflow=Tests) [![code coverage](https://img.shields.io/coveralls/github/betula/use-between?style=flat-square)](https://coveralls.io/github/betula/use-between) [![typescript supported](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/betula/use-between)

When you want to separate your React hooks between several components it's can be very difficult, because all context data stored in React component function area.
If you want to share some of state parts or control functions to another component your need pass It thought React component props. But If you want to share It with sibling one level components or a set of scattered components, you will be frustrated.

`useBetween` hook is the solution to your problem :kissing_closed_eyes:

```javascript
import React, { useState, useCallback } from 'react';
import { useBetween } from 'use-between';

const useCounter = () => {
  const [count, setCount] = useState(0);
  const inc = useCallback(() => setCount(c => c + 1), []);
  const dec = useCallback(() => setCount(c => c - 1), []);
  return {
    count,
    inc,
    dec
  };
};

const useSharedCounter = () => useBetween(useCounter);

const Count = () => {
  const { count } = useSharedCounter();
  return <p>{count}</p>;
};

const Buttons = () => {
  const { inc, dec } = useSharedCounter();
  return (
    <>
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
    </>
  );
};

const App = () => (
  <>
    <Count />
    <Buttons />
    <Count />
    <Buttons />
  </>
);

export default App;
```
[![Edit Counter with useBetween](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/counter-with-usebetween-zh4tp?file=/src/App.js)

`useBetween` is a way to call any hook. But so that the state will not be stored in the React component. For the same hook, the result of the call will be the same. So we can call one hook in different components and work together on one state. When updating the shared state, each component using it will be updated too.

If you like this idea and would like to use it, please put star in github. It will be your first contribution!

### Supported hooks

```diff
+ useState
+ useEffect
+ useReducer
+ useCallback
+ useMemo
+ useRef
+ useImperativeHandle
```

If you found some bug or want to propose improvement please make an Issue. I would be happy for your help to make It better! :wink:

+ [How to use SSR](./docs/ssr.md)
+ [Try Todos demo on CodeSandbox](https://codesandbox.io/s/todos-use-bettwen-8d2th?file=/src/components/todo-list.jsx)

### Install

```bash
npm i --save use-between
# or
yarn add use-between
```

Enjoy and happy coding!
