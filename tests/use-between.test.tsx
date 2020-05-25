import React, { useState } from 'react'
import { mount } from 'enzyme'
import { useBetween } from '../src'

test('Should update component with useBetween', () => {
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
