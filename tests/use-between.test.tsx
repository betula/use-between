import React, { useState, useReducer } from 'react'
import { mount } from 'enzyme'
import { useBetween } from '../src'

test('Should update component with useState', () => {
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

test('Should update component with useReducer', () => {
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
