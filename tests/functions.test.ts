import { useEffect, useState } from 'react'
import { get, free, clear, on, waitForEffects } from '../src'

afterEach(clear)

test('Should work get function', async () => {
  const counter_spy = jest.fn()
  const useCounter = () => {
    counter_spy()
    const [count, setCount] = useState(10)
    return { count, setCount }
  }

  expect(counter_spy).toBeCalledTimes(0)
  expect(get(useCounter).count).toBe(10)
  expect(counter_spy).toBeCalledTimes(1)
  expect(get(useCounter).count).toBe(10)
  expect(counter_spy).toBeCalledTimes(1)

  get(useCounter).setCount(v => v + 5)
  await waitForEffects()

  expect(get(useCounter).count).toBe(15)
  expect(counter_spy).toBeCalledTimes(2)

  clear()
  expect(get(useCounter).count).toBe(10)
  expect(counter_spy).toBeCalledTimes(3)
})

test('Should work free function', () => {
  const effect_spy = jest.fn()
  const un_effect_spy = jest.fn()
  const useCounter = () => {
    const [count, setCount] = useState(10)
    useEffect(() => (effect_spy(count), () => un_effect_spy(count)), [count])
    return { count, setCount }
  }

  const { count, setCount} = get(useCounter)
  expect(count).toBe(10)
  expect(effect_spy).toBeCalledWith(10)

  setCount(v => v + 7)
  expect(effect_spy).toHaveBeenLastCalledWith(17)
  expect(un_effect_spy).toBeCalledWith(10)

  setCount(v => v + 9)
  expect(get(useCounter).count).toBe(26)
  expect(effect_spy).toHaveBeenLastCalledWith(26)
  expect(un_effect_spy).toHaveBeenLastCalledWith(17)

  free()
  expect(un_effect_spy).toHaveBeenLastCalledWith(26)
})

test('Should work few hooks free function', () => {
  const useA = () => useState(0)
  const useB = () => useState(0)
  const useC = () => useState(0)

  get(useA)[1](5)
  get(useB)[1](6)
  get(useC)[1](7)

  expect(get(useA)[0]).toBe(5)
  free(useA)
  expect(get(useA)[0]).toBe(0)

  get(useA)[1](15)

  expect(get(useB)[0]).toBe(6)
  expect(get(useC)[0]).toBe(7)
  free(useB, useC)

  expect(get(useB)[0]).toBe(0)
  expect(get(useC)[0]).toBe(0)

  expect(get(useA)[0]).toBe(15)
  free()
  expect(get(useA)[0]).toBe(0)
})

test('Should work on function', () => {
  const constr = jest.fn()
  const spy = jest.fn()
  const useA = () => (constr(), useState(0))

  on(useA, (state) => spy(state[0]))
  expect(constr).toBeCalledTimes(1)
  expect(spy).toBeCalledTimes(0)

  get(useA)[1](6)
  expect(spy).toBeCalledWith(6)
  get(useA)[1](10)
  expect(spy).toHaveBeenLastCalledWith(10)
  expect(spy).toHaveBeenCalledTimes(2)

  free(useA)
  expect(get(useA)[0]).toBe(0)
  expect(spy).toHaveBeenCalledTimes(2)

  get(useA)[1](17)
  expect(spy).toHaveBeenCalledTimes(2)

  const unsub = on(useA, (state) => spy(state[0]))
  get(useA)[1](18)
  expect(spy).toHaveBeenLastCalledWith(18)
  expect(spy).toHaveBeenCalledTimes(3)

  unsub()
  get(useA)[1](19)
  expect(spy).toHaveBeenCalledTimes(3)
})
