import React, { useState, useCallback } from 'react'
import { clear, get, waitForEffects, on, useBetween } from '../src'
import { act, render } from '@testing-library/react'
import { mount } from 'enzyme'

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
afterEach(clear) // or afterEach(() => clear())

// Test example
it('It works', async () => {
  expect(get(useCounter).count).toBe(0)

  get(useCounter).inc()

  // If you are using effects in your shared logic,
  // you should wait for them to complete.
  await waitForEffects()

  // Check result
  expect(get(useCounter).count).toBe(1)

  get(useCounter).inc()
  expect(get(useCounter).count).toBe(2)
})

it('It works with spy', () => {
  const spy = jest.fn()

  // Subscribe to a state change
  on(useCounter, (state) => spy(state.count))

  get(useCounter).inc()
  expect(spy).toBeCalledWith(1)

  get(useCounter).dec()
  expect(spy).toHaveBeenLastCalledWith(0)
})

it('It works with enzyme render component', async () => {
  const Counter = () => {
    const { count } = useBetween(useCounter)
    return <i>{count}</i>
  }

  const el = mount(<Counter />)
  expect(el.find('i').text()).toBe('0')

  // You should use "act" from @testing-library/react
  act(() => {
    get(useCounter).inc()
  })
  expect(el.find('i').text()).toBe('1')
})

it('It works with testing-library render component', async () => {
  const Counter = () => {
    const { count } = useBetween(useCounter)
    return <i data-testid="count">{count}</i>
  }

  const el = render(<Counter />)
  expect((await el.findByTestId('count')).textContent).toBe('0')

  // You should use "act" from @testing-library/react
  act(() => {
    get(useCounter).dec()
  })
  expect((await el.findByTestId('count')).textContent).toBe('-1')
})
