import { useState, useCallback } from 'react'
import { clear, get, act } from '../src'

// ./shared-counter.js
const useCounter = () => {
  const [count, setCount] = useState(0)
  const inc = useCallback(() => setCount((c) => c + 1), [])
  const dec = useCallback(() => setCount((c) => c - 1), [])
  return {
    count,
    inc,
    dec
  }
}

// ./shared-counter.test.js

// Clean up after each test if necessary
afterEach(() => clear())

// Test example
it('It works', async () => {
  expect(get(useCounter).count).toBe(0)

  // It's good practice to use "act" for modifying operations
  await act(() => {
    get(useCounter).inc()
  })
  expect(get(useCounter).count).toBe(1)

  await act(() => {
    get(useCounter).dec()
  })
  expect(get(useCounter).count).toBe(0)
});

