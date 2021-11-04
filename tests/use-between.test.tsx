import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useImperativeHandle
} from 'react'
import { mount } from 'enzyme'
import { useBetween } from '../src'

test('Should work useState hook', () => {
  const useStore = () => useState(0)

  const A = () => {
    const [ a ] = useBetween(useStore)
    return <i>{a}</i>
  }
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
  const off = jest.fn()
  const useStore = () => {
    const [ a, setA ] = useState(0)
    const [ b, setB ] = useState(0)
    useEffect(() => {
      setA(b * 2)
    }, [b])
    useEffect(() => {
      setB(a / 2)
    }, [a])
    useEffect(() => off, [])
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
  const C = () => <><A /><B /></>
  const el = mount(<C />)
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

  expect(off).toBeCalledTimes(0)
  el.unmount()
  expect(off).toBeCalledTimes(0)
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

test('Should work useLayoutEffect hook', () => {
  const [ fn1, fn2, fn3, fn4 ] = [ jest.fn(), jest.fn(), jest.fn(), jest.fn() ]
  const [ un1, un2, un3, un4 ] = [ jest.fn(), jest.fn(), jest.fn(), jest.fn() ]
  let i = 0
  const useStore = () => {
    useLayoutEffect(() => (fn1(i++), () => un1(i++)), [])
    useEffect(() => (fn2(i++), () => un2(i++)), [])
    useLayoutEffect(() => (fn3(i++), () => un3(i++)), [])
    useEffect(() => (fn4(i++), () => un4(i++)), [])
  }
  const A = () => (useBetween(useStore), <a />)
  const B = () => (useBetween(useStore), <b />)
  const C = () => <><A /><B /></>
  const el = mount(<C />)

  expect(fn1).toBeCalledWith(0)
  expect(fn3).toBeCalledWith(1)
  expect(fn2).toBeCalledWith(2)
  expect(fn4).toBeCalledWith(3)
  expect(un1).toBeCalledTimes(0)
  expect(un2).toBeCalledTimes(0)
  expect(un3).toBeCalledTimes(0)
  expect(un4).toBeCalledTimes(0)
  el.unmount()
  expect(fn1).toBeCalledTimes(1)
  expect(fn2).toBeCalledTimes(1)
  expect(fn3).toBeCalledTimes(1)
  expect(fn4).toBeCalledTimes(1)
  expect(un1).toBeCalledTimes(0)
  expect(un2).toBeCalledTimes(0)
  expect(un3).toBeCalledTimes(0)
  expect(un4).toBeCalledTimes(0)
});

test('Should work useMemo hook', () => {
  const fa = jest.fn();
  const fb = jest.fn();

  const useStore = () => {
    const [ a, setA ] = useState(0)
    const b = useMemo(() => (fa(a), a + 1), [a])
    useMemo(() => fb(), [])
    return { a, b, setA }
  }

  const A = () => {
    const { b, setA } = useBetween(useStore)
    return <>
      <b>{b}</b>
      <button onClick={() => setA(x => x + 1)} />
    </>
  }

  const el = mount(<A />)
  const setA = () => el.find('button').simulate('click')
  const b = () => +el.find('b').text()

  expect(fa).toBeCalledWith(0)
  expect(fb).toBeCalledTimes(1)
  expect(b()).toBe(1)
  setA()
  expect(fa).toBeCalledTimes(2)
  expect(fa).toHaveBeenLastCalledWith(1)
  expect(b()).toBe(2)
  expect(fb).toBeCalledTimes(1)
  setA()
  setA()
  expect(fa).toBeCalledTimes(4)
  expect(fa).toHaveBeenLastCalledWith(3)
  expect(b()).toBe(4)
  expect(fb).toBeCalledTimes(1)
});

test('Should work useRef hook', () => {
  const fn = jest.fn()
  const useStore = () => {
    const [v, set ] = useState(0)
    fn(useRef(v))
    return { set }
  }
  const A = () => {
    const { set } = useBetween(useStore)
    return <button onClick={() => set(v => v + 1)} />
  }
  const el = mount(<A />)
  const inc = () => el.find('button').simulate('click')

  expect(fn).toHaveBeenLastCalledWith({ current: 0 })
  inc()
  expect(fn).toHaveBeenLastCalledWith({ current: 0 })
});

test('Should work useImperativeHandle hook', () => {
  const fn = jest.fn()
  const useStore = () => {
    const [, setU] = useState(0)
    const [v, setV] = useState(0)
    const ref = useRef(5)
    useImperativeHandle(ref, () => v, [v])
    fn(ref.current)
    return {
      ref,
      setU,
      setV
    }
  }
  const A = () => {
    const { ref, setU, setV } = useBetween(useStore)
    return (
      <>
        <i>{ref.current}</i>
        <button onClick={() => setU(u => u + 1)} />
        <button onClick={() => setV(v => v + 1)} />
      </>
    )
  }
  const el = mount(<A />)
  const i = () => el.find('i').text()
  const setU = () => el.find('button').at(0).simulate('click')
  const setV = () => el.find('button').at(1).simulate('click')

  expect(fn).toBeCalledWith(5)
  expect(i()).toBe('0')
  setV()
  expect(i()).toBe('1')
  setV()
  expect(i()).toBe('2')
  setU()
  expect(i()).toBe('2')
});

test('Should work useImperativeHandle hook with callback ref', () => {
  const ref = jest.fn()
  const useStore = () => {
    const [v, setV] = useState(1)
    useImperativeHandle(ref, () => v, [v])
    return {
      setV
    }
  }
  const A = () => {
    const { setV } = useBetween(useStore)
    return (
      <>
        <button onClick={() => setV(v => v + 1)} />
      </>
    )
  }
  const el = mount(<A />)
  const setV = () => el.find('button').at(0).simulate('click')

  expect(ref).toBeCalledWith(1)
  setV()
  expect(ref).toHaveBeenLastCalledWith(2)
});
