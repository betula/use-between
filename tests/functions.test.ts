import { useEffect, useState } from 'react'
import { get, free, clear, on, mock, useBetween } from '../src'

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

test('Should work mock function', () => {
  const spy = jest.fn()
  const useA = () => useState(10)
  const useB = () => useBetween(useA)

  on(useB, (state) => spy(state[0]))
  expect(spy).toHaveBeenCalledTimes(0)

  expect(get(useB)[0]).toBe(10)
  get(useA)[1](5)
  expect(get(useB)[0]).toBe(5)
  expect(spy).toHaveBeenLastCalledWith(5)
  expect(spy).toHaveBeenCalledTimes(1)

  const unmock = mock(useA, [20])
  expect(get(useB)[0]).toBe(20)
  expect(spy).toHaveBeenLastCalledWith(20)
  expect(spy).toHaveBeenCalledTimes(2)

  expect(get(useA)).toStrictEqual([20])

  unmock()
  expect(get(useB)[0]).toBe(5)
  expect(spy).toHaveBeenLastCalledWith(5)
  expect(spy).toHaveBeenCalledTimes(3)

  get(useB)[1](9)
  expect(get(useB)[0]).toBe(9)
  expect(spy).toHaveBeenLastCalledWith(9)
  expect(spy).toHaveBeenCalledTimes(4)
})

test('Should work mock function without original function run', () => {
  const spy = jest.fn().mockReturnValue(1)
  const useA = () => spy()
  const unmock = mock(useA, 15)

  expect(get(useA)).toBe(15)
  expect(spy).toBeCalledTimes(0)

  mock(useA, 17)
  expect(get(useA)).toBe(17)
  expect(spy).toBeCalledTimes(0)

  unmock()
  expect(get(useA)).toBe(1)
  expect(spy).toBeCalledTimes(1)
})
