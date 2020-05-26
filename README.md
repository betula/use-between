# use-between

[![npm](https://img.shields.io/npm/v/use-between?style=flat-square)](https://www.npmjs.com/package/use-between) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-between?style=flat-square)](https://bundlephobia.com/result?p=use-between)

When you want to separate your React hooks between several components it's can be very difficult, because all context data stored in React component function area.
If you want to share some of state parts or control functions to another component your need pass It thought React component props. But If you want to share It with sibling one level components or a set of scattered components, you will be frustrated.

`useBetween` hook is the solution to your problem :kissing_closed_eyes:

```javascript
// App.jsx
import React, { useState, useEffect } from 'react'
import { useBetween } from 'use-between'

const useCurrencyStore = () => {
  const [ dollars, setDollars ] = useState(0)
  const [ euros, setEuros ] = useState(0)

  useEffect(() => {
    setDollars(euros * 2)
  }, [euros])

  useEffect(() => {
    setEuros(dollars / 2)
  }, [dollars])

  return {
    dollars,
    euros,
    setDollars,
    setEuros
  }
}

const DollarInput = () => {
  const { dollars, setDollars } = useBetween(useCurrencyStore)
  return <input value={dollars} onChange={ev => setDollars(ev.target.value)} />
}

const EuroInput = () => {
  const { euros, setEuros } = useBetween(useCurrencyStore)
  return <input value={euros} onChange={ev => setEuros(ev.target.value)} />
}

const App = () => (
  <>
    <DollarInput />
    <EuroInput />
  </>
)

export default App
```
[![Example on codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/betula/use-between/tree/master/examples/basic-usage)

If you like this idea and would like to use it, please put star in github. It will be your first commit!

### Install

```bash
npm i --save use-between
# or
yarn add use-between
```
