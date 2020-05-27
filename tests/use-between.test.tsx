import React, { useState, useReducer, useEffect, useCallback } from 'react'
import { mount } from 'enzyme'
import { useBetween } from '../src'

test('Should work useState hook', () => {
  const useStore = () => useState(0)

  const A = () => <i>{useBetween(useStore)[0]}</i>
  const B = () => {
    const [ , set ] = useBetween(useStore)
    return <button onClick={() => set(x => x + 1)} />
  }

  const el = mount(<><A /><B /></>)
  expect(el.find('i').text()).toBe('0')
  el.find('button').simulate('click')
  expect(el.find('i').text()).toBe('1')
  el.find('button').simulate('click')
  expect(el.find('i').text()).toBe('2')
});

test('Should work useEffect hook', () => {
  const useStore = () => {
    const [ a, setA ] = useState(0)
    const [ b, setB ] = useState(0)
    useEffect(() => { setA(b * 2) }, [b])
    useEffect(() => { setB(a / 2) }, [a])
    return { a, b, setA, setB }
  }
  const A = () => {
    const { a, setA } = useBetween(useStore)
    return <><i>{a}</i><button onClick={() => setA(10)} /></>
  }
  const B = () => {
    const { b, setB } = useBetween(useStore)
    return <><i>{b}</i><button onClick={() => setB(10)} /></>
  }
  const el = mount(<><A /><B /></>)
  const a = () => el.find(A).find('i').text()
  const b = () => el.find(B).find('i').text()
  const setA = () => el.find(A).find('button').simulate('click')
  const setB = () => el.find(B).find('button').simulate('click')

  expect(a()).toBe('0')
  expect(b()).toBe('0')
  setA()
  expect(a()).toBe('10')
  expect(b()).toBe('5')
  setB()
  expect(a()).toBe('20')
  expect(b()).toBe('10')
  setA()
  expect(a()).toBe('10')
  expect(b()).toBe('5')
});

test('Should work useReducer hook', () => {
  const initialState = { count: 0 }
  const reducer = (state: typeof initialState, action: { type: string }) => {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 }
      case 'decrement':
        return { count: state.count - 1 }
      default:
        throw new Error()
    }
  }

  const useStore = () => useReducer(reducer, initialState)

  const A = () => <i>{useBetween(useStore)[0].count}</i>
  const B = () => {
    const [ , dispatch ] = useBetween(useStore)
    return (
      <>
        <button onClick={() => dispatch({type: 'decrement'})} />
        <button onClick={() => dispatch({type: 'increment'})} />
      </>
    )
  }

  const el = mount(<><A /><B /></>)
  const text = () => el.find('i').text()
  const dec = () => el.find('button').at(0).simulate('click')
  const inc = () => el.find('button').at(1).simulate('click')

  expect(text()).toBe('0')
  dec()
  expect(text()).toBe('-1')
  dec()
  expect(text()).toBe('-2')
  inc()
  inc()
  inc()
  expect(text()).toBe('1')
});

test('Should work useCallback hook', () => {
  let lastFn: any
  const fns = []
  const useStore = () => {
    const [ a, setA ] = useState(0)
    const [ , setB ] = useState(0)
    const f = () => null
    fns.push(f)
    const fn = useCallback(f, [a])
    lastFn = fn
    return [ fn, setA, setB ]
  }

  const A = () => {
    const [ , setA, setB ] = useBetween(useStore)
    return <>
      <button onClick={() => setA(x => x + 1)} />
      <button onClick={() => setB(x => x + 1)} />
    </>
  }

  const el = mount(<A />)
  const setA = () => el.find('button').at(0).simulate('click')
  const setB = () => el.find('button').at(1).simulate('click')

  expect(fns.length).toBe(1)
  expect(fns[0] === lastFn).toBeTruthy()
  setB()
  expect(fns.length).toBe(2)
  expect(fns[0] === lastFn).toBeTruthy()
  expect(fns[1] === lastFn).toBeFalsy()
  setA()
  expect(fns.length).toBe(3)
  expect(fns[2] === lastFn).toBeTruthy()
});
