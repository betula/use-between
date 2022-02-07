import React, { useState, useEffect } from 'react'
import { render } from '@testing-library/react'
import { clear, useBetween } from '../src'


afterEach(clear)

it('Subscription should be immediately in render phase', async () => {
  const useShared = () => {
    const [a, setA] = useState(0)
    const [b, setB] = useState(0)
    useEffect(() => {
      setB(1)
    }, [a])

    return { a, setA, b, setB }
  }

  const Child = () => {
    const { b } = useBetween(useShared)
    return <i data-testid="b">{b}</i>
  }

  const Parent = () => {
    const { a, setA } = useBetween(useShared)
    if (a === 0) {
      setA(1)
    }
    return a ? <Child /> : null
  }

  const el = render(<Parent />)
  expect((await el.findByTestId('b')).textContent).toBe('1')
})
