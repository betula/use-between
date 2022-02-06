import { useState, useEffect } from 'react'
import { clear, get } from '../src'


afterEach(clear)

// Test example
it('Effect should works asynchronous for hooks body', async () => {
  let inc = 0
  const effect_spy = jest.fn()
  const hook_finish_spy = jest.fn()

  const hook = () => {
    const [ curr, update ] = useState(0)
    useEffect(() => {
      effect_spy(++inc, curr)
    }, [curr])
    hook_finish_spy(++inc)
    return { update }
  }

  expect(effect_spy).toBeCalledTimes(0)
  expect(hook_finish_spy).toBeCalledTimes(0)
  get(hook)
  expect(effect_spy).toBeCalledTimes(1)
  expect(effect_spy).toBeCalledWith(2, 0)
  expect(hook_finish_spy).toBeCalledTimes(1)
  expect(hook_finish_spy).toBeCalledWith(1)

  get(hook).update(7)
  expect(effect_spy).toBeCalledTimes(2)
  expect(effect_spy).toHaveBeenLastCalledWith(4, 7)
  expect(hook_finish_spy).toBeCalledTimes(2)
  expect(hook_finish_spy).toHaveBeenLastCalledWith(3)
})

