import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  useContext
} from 'react'
import { render, fireEvent } from '@testing-library/react'
import { get, useBetween, free } from '../src'

test('Should work useState hook', () => {
  const useStore = () => useState(0)

  const A = () => {
    const [ a ] = useBetween(useStore)
    return <i data-testid="counter">{a}</i>
  }
  const B = () => {
    const [ , set ] = useBetween(useStore)
    return <button data-testid="increment" onClick={() => set(x => x + 1)} />
  }

  const el = render(<><A /><B /></>)
  expect(el.getByTestId('counter').textContent).toBe('0')
  fireEvent.click(el.getByTestId('increment'))
  expect(el.getByTestId('counter').textContent).toBe('1')
  fireEvent.click(el.getByTestId('increment'))
  expect(el.getByTestId('counter').textContent).toBe('2')
});

test('Should work function initial state useState hook', () => {
  const useStore = () => useState(() => 0)

  const A = () => {
    const [ a ] = useBetween(useStore)
    return <i data-testid="counter">{a}</i>
  }
  const B = () => {
    const [ , set ] = useBetween(useStore)
    return <button data-testid="increment" onClick={() => set(x => x + 1)} />
  }

  const el = render(<><A /><B /></>)
  expect(el.getByTestId('counter').textContent).toBe('0')
  fireEvent.click(el.getByTestId('increment'))
  expect(el.getByTestId('counter').textContent).toBe('1')
  fireEvent.click(el.getByTestId('increment'))
  expect(el.getByTestId('counter').textContent).toBe('2')
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
    return <div data-testid="component-a">
      <i data-testid="value-a">{a}</i>
      <button data-testid="button-a" onClick={() => setA(10)} />
    </div>
  }
  const B = () => {
    const { b, setB } = useBetween(useStore)
    return <div data-testid="component-b">
      <i data-testid="value-b">{b}</i>
      <button data-testid="button-b" onClick={() => setB(10)} />
    </div>
  }
  const C = () => <><A /><B /></>
  const el = render(<C />)
  
  const getA = () => el.getByTestId('value-a').textContent
  const getB = () => el.getByTestId('value-b').textContent

  expect(getA()).toBe('0')
  expect(getB()).toBe('0')
  fireEvent.click(el.getByTestId('button-a'))
  expect(getA()).toBe('10')
  expect(getB()).toBe('5')
  fireEvent.click(el.getByTestId('button-b'))
  expect(getA()).toBe('20')
  expect(getB()).toBe('10')
  fireEvent.click(el.getByTestId('button-a'))
  expect(getA()).toBe('10')
  expect(getB()).toBe('5')

  expect(off).toBeCalledTimes(0)
  el.unmount()
  free(useStore)
  expect(off).toBeCalledTimes(1)
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

  const A = () => <i data-testid="count">{useBetween(useStore)[0].count}</i>
  const B = () => {
    const [ , dispatch ] = useBetween(useStore)
    return (
      <>
        <button data-testid="decrement" onClick={() => dispatch({type: 'decrement'})} />
        <button data-testid="increment" onClick={() => dispatch({type: 'increment'})} />
      </>
    )
  }

  const el = render(<><A /><B /></>)
  const getText = () => el.getByTestId('count').textContent

  expect(getText()).toBe('0')
  fireEvent.click(el.getByTestId('decrement'))
  expect(getText()).toBe('-1')
  fireEvent.click(el.getByTestId('decrement'))
  expect(getText()).toBe('-2')
  fireEvent.click(el.getByTestId('increment'))
  fireEvent.click(el.getByTestId('increment'))
  fireEvent.click(el.getByTestId('increment'))
  expect(getText()).toBe('1')
});

test('Should work useCallback hook', () => {
  let lastFn: any
  const fns: (() => void)[] = []
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
      <button data-testid="set-a" onClick={() => setA(x => x + 1)} />
      <button data-testid="set-b" onClick={() => setB(x => x + 1)} />
    </>
  }

  const el = render(<A />)

  expect(fns.length).toBe(1)
  expect(fns[0] === lastFn).toBeTruthy()
  fireEvent.click(el.getByTestId('set-b'))
  expect(fns.length).toBe(2)
  expect(fns[0] === lastFn).toBeTruthy()
  expect(fns[1] === lastFn).toBeFalsy()
  fireEvent.click(el.getByTestId('set-a'))
  expect(fns.length).toBe(3)
  expect(fns[2] === lastFn).toBeTruthy()
});

test('Should work useLayoutEffect hook', () => {
  const [ fn1, fn2, fn3, fn4 ] = [ jest.fn(), jest.fn(), jest.fn(), jest.fn() ]
  const [ un1, un2, un3, un4 ] = [ jest.fn(), jest.fn(), jest.fn(), jest.fn() ]
  let i = 0
  const useDep = () => useState(0);
  const useStore = () => {
    const d = useBetween(useDep)[0];
    useLayoutEffect(() => (fn1(i++,d), () => un1(i++,d)), [d])
    useEffect(() => (fn2(i++,d), () => un2(i++,d)), [d])
    useLayoutEffect(() => (fn3(i++,d), () => un3(i++,d)), [d])
    useEffect(() => (fn4(i++,d), () => un4(i++,d)), [d])
  }
  const A = () => (useBetween(useStore), <a />)
  const B = () => (useBetween(useStore), <b />)
  const M = () => <button data-testid="increment" onClick={useBetween(useDep)[1].bind(null, v => v+1)} />
  const C = () => <><A /><B /><M /></>
  const el = render(<C />)

  expect(fn1).toBeCalledWith(0, 0)
  expect(fn3).toBeCalledWith(1, 0)
  expect(fn2).toBeCalledWith(2, 0)
  expect(fn4).toBeCalledWith(3, 0)
  expect(un1).toBeCalledTimes(0)
  expect(un2).toBeCalledTimes(0)
  expect(un3).toBeCalledTimes(0)
  expect(un4).toBeCalledTimes(0)

  fireEvent.click(el.getByTestId('increment'))
  expect(fn1).toHaveBeenLastCalledWith(5, 1)
  expect(fn3).toHaveBeenLastCalledWith(7, 1)
  expect(fn2).toHaveBeenLastCalledWith(9, 1)
  expect(fn4).toHaveBeenLastCalledWith(11, 1)
  expect(un1).toBeCalledWith(4, 0)
  expect(un3).toBeCalledWith(6, 0)
  expect(un2).toBeCalledWith(8, 0)
  expect(un4).toBeCalledWith(10, 0)

  fireEvent.click(el.getByTestId('increment'))
  expect(fn1).toHaveBeenLastCalledWith(13, 2)
  expect(fn3).toHaveBeenLastCalledWith(15, 2)
  expect(fn2).toHaveBeenLastCalledWith(17, 2)
  expect(fn4).toHaveBeenLastCalledWith(19, 2)
  expect(un1).toBeCalledWith(12, 1)
  expect(un3).toBeCalledWith(14, 1)
  expect(un2).toBeCalledWith(16, 1)
  expect(un4).toBeCalledWith(18, 1)

  expect(fn1).toBeCalledTimes(3)
  expect(fn2).toBeCalledTimes(3)
  expect(fn3).toBeCalledTimes(3)
  expect(fn4).toBeCalledTimes(3)
  el.unmount()
  free(useStore, useDep)
  expect(un1).toBeCalledTimes(3)
  expect(un2).toBeCalledTimes(3)
  expect(un3).toBeCalledTimes(3)
  expect(un4).toBeCalledTimes(3)
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
      <b data-testid="value-b">{b}</b>
      <button data-testid="set-a" onClick={() => setA(x => x + 1)} />
    </>
  }

  const el = render(<A />)
  const getB = () => +el.getByTestId('value-b').textContent

  expect(fa).toBeCalledWith(0)
  expect(fb).toBeCalledTimes(1)
  expect(getB()).toBe(1)
  fireEvent.click(el.getByTestId('set-a'))
  expect(fa).toBeCalledTimes(2)
  expect(fa).toHaveBeenLastCalledWith(1)
  expect(getB()).toBe(2)
  expect(fb).toBeCalledTimes(1)
  fireEvent.click(el.getByTestId('set-a'))
  fireEvent.click(el.getByTestId('set-a'))
  expect(fa).toBeCalledTimes(4)
  expect(fa).toHaveBeenLastCalledWith(3)
  expect(getB()).toBe(4)
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
    return <button data-testid="increment" onClick={() => set(v => v + 1)} />
  }
  const el = render(<A />)

  expect(fn).toHaveBeenLastCalledWith({ current: 0 })
  fireEvent.click(el.getByTestId('increment'))
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
        <i data-testid="ref-value">{ref.current}</i>
        <button data-testid="set-u" onClick={() => setU(u => u + 1)} />
        <button data-testid="set-v" onClick={() => setV(v => v + 1)} />
      </>
    )
  }
  const el = render(<A />)
  const getRefValue = () => el.getByTestId('ref-value').textContent

  expect(fn).toBeCalledWith(5)
  expect(getRefValue()).toBe('0')
  fireEvent.click(el.getByTestId('set-v'))
  expect(getRefValue()).toBe('1')
  fireEvent.click(el.getByTestId('set-v'))
  expect(getRefValue()).toBe('2')
  fireEvent.click(el.getByTestId('set-u'))
  expect(getRefValue()).toBe('2')
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
        <button data-testid="set-v" onClick={() => setV(v => v + 1)} />
      </>
    )
  }
  const el = render(<A />)

  expect(ref).toBeCalledWith(1)
  fireEvent.click(el.getByTestId('set-v'))
  expect(ref).toHaveBeenLastCalledWith(2)
});

test('Should throw exception for useContext hook', () => {
  const log = jest.spyOn(console, 'error').mockReturnValue()

  expect(() => {
    get(() => useContext({} as any))
  }).toThrow('Hook "useContext" no possible to using inside useBetween scope.')

  expect(log).toHaveBeenCalledWith('Hook "useContext" no possible to using inside useBetween scope.')
  log.mockReset()

  const A = () => {
    useBetween(() => useContext({} as any))
    return null
  }

  expect(() => {
    render(<A />)
  }).toThrow('Hook "useContext" no possible to using inside useBetween scope.')

  expect(log).toHaveBeenCalledWith('Hook "useContext" no possible to using inside useBetween scope.')
  log.mockRestore()
});
