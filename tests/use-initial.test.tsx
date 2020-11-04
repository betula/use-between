import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useImperativeHandle
} from 'react'
import { mount } from 'enzyme'
import { useBetween, useInitial } from '../src'

test('Should work initial data', () => {
  const spy = jest.fn()
  const useStoreA = (data) => spy(data)
  const useStoreB = (data) => spy(data)

  const A = () => {
    useBetween(useStoreA)
    return null
  }
  const B = () => {
    useBetween(useStoreB)
    return null
  }
  const C = () => {
    useInitial(10)
    return <><A /><B /></>
  }

  mount(<C/>)
  expect(spy).toHaveBeenNthCalledWith(1, 10)
  expect(spy).toHaveBeenNthCalledWith(2, 10)
  expect(spy).toHaveBeenCalledTimes(2)
});

test('Should set initial data once', () => {
  const spy1 = jest.fn()
  const spy2 = jest.fn()

  let inital = 0

  const useStore = (data) => {
    const up = useState({})[1]
    spy1(data)
    return up
  }
  const A = () => {
    const up2 = useState({})[1]
    useInitial(inital)
    const up1 = useBetween(useStore)
    spy2(inital)
    return (
      <>
        <button onClick={() => up1({})} />
        <button onClick={() => up2({})} />
      </>
    )
  }

  const el = mount(<A/>)
  const up1 = () => el.find('button').at(0).simulate('click')
  const up2 = () => el.find('button').at(1).simulate('click')

  expect(spy1).toHaveBeenLastCalledWith(0)
  expect(spy2).toHaveBeenLastCalledWith(0)
  inital = 1
  up2()
  expect(spy2).toHaveBeenLastCalledWith(1)
  up1()
  expect(spy1).toHaveBeenLastCalledWith(0)
  expect(spy2).toHaveBeenLastCalledWith(1)
  expect(spy1).toHaveBeenCalledTimes(2)
  expect(spy2).toHaveBeenCalledTimes(3)
});

test('Should block effect hooks on server', () => {
  const fn = jest.fn()
  const fnA = jest.fn()
  const fnB = jest.fn()
  const fnC = jest.fn()
  const useStore = () => {
    useEffect(fnA, [])
    useLayoutEffect(fnB, [])
    useImperativeHandle(fnC, () => 10, [])
    fn()
  }

  const A = () => {
    useBetween(useStore)
    return null
  }
  const B = () => {
    useBetween(useStore)
    return null
  }
  const C = () => {
    useInitial(null, true)
    return <><A /><B /></>
  }

  mount(<C/>)
  expect(fn).toBeCalledTimes(1)
  expect(fnA).toBeCalledTimes(0)
  expect(fnB).toBeCalledTimes(0)
  expect(fnC).toBeCalledTimes(0)
});

test('Should reset instances each server run', () => {
  let el
  let server = false
  let inital = 0
  const fn = jest.fn()

  const useStore = (v) => {
    fn(v)
    return useState(v)[0]
  }
  const A = () => {
    useInitial(inital, server)
    return <i>{useBetween(useStore)}</i>
  }

  el = mount(<A/>)
  expect(el.find('i').text()).toBe('0')
  inital = 1
  el = mount(<A/>)
  expect(el.find('i').text()).toBe('0')
  server = true
  el = mount(<A/>)
  expect(el.find('i').text()).toBe('1')
  inital = 2
  el = mount(<A/>)
  expect(el.find('i').text()).toBe('2')
});
