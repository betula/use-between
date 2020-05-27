import { useEffect } from 'react'
import { ReactCurrentDispatcher } from './use-between/react-shared-internals'
import { useForceUpdate } from './use-between/use-force-update'

type Hook<T> = () => T

const notImplemented = (name: string) => () => {
  const msg = `Hook "${name}" no possible to using inside useBetween scope yet. It's coming soon!`
  console.error(msg)
  throw new Error(msg)
}

const equals = (a: any, b: any) => Object.is(a, b)
const shallowArrayEquals = (a: any[], b: any[]) => (
  a.length === b.length &&
  a.every((dep: any, index: any) => equals(dep, b[index]))
)

const stores = new Map<any, any>()

let boxes = [] as any[]
let pointer = 0
let useEffectQueue = [] as any[]
let nextTick = () => {}

const nextBox = () => {
  const index = pointer ++
  return (boxes[index] = boxes[index] || {})
}

const ownDisptacher = {
  useState: (initialState?: any) => {
    const box = nextBox()
    const tick = nextTick;

    if (!box.initialized) {
      box.state = typeof initialState === "function" ? initialState() : initialState

      box.set = (fn: any) => {
        if (typeof fn === 'function') {
          return box.set(fn(box.state))
        }
        if (!equals(fn, box.state)) {
          box.state = fn
          tick()
        }
      }
      box.initialized = true
    }

    return [ box.state, box.set ]
  },

  useReducer: (reducer: any, initialState?: any, init?: any) => {
    const box = nextBox()
    const tick = nextTick;

    if (!box.initialized) {
      box.state = init ? init(initialState) : initialState

      box.dispatch = (action: any) => {
        const state = reducer(box.state, action)
        if (!equals(state, box.state)) {
          box.state = state
          tick()
        }
      }
      box.initialized = true
    }

    return [ box.state, box.dispatch ]
  },

  useEffect: (fn: any, deps: any[]) => {
    const box = nextBox()

    if (!box.initialized) {
      box.deps = deps
      box.initialized = true
    }
    else if (!shallowArrayEquals(box.deps, deps)) {
      useEffectQueue.push(() => {
        box.deps = deps
        fn()
      })
    }
  },

  useCallback: (fn: any, deps: any[]) => {
    const box = nextBox()

    if (!box.initialized) {
      box.fn = fn
      box.deps = deps
      box.initialized = true
    }
    else if (!shallowArrayEquals(box.deps, deps)) {
      box.fn = fn
    }

    return box.fn
  },

  readContext: notImplemented('readContext'),
  useContext: notImplemented('useContext'),
  useImperativeHandle: notImplemented('useImperativeHandle'),
  useLayoutEffect: notImplemented('useLayoutEffect'),
  useMemo: notImplemented('useMemo'),
  useRef: notImplemented('useRef'),
  useDebugValue: notImplemented('useDebugValue'),
  useResponder: notImplemented('useResponder'),
  useDeferredValue: notImplemented('useDeferredValue'),
  useTransition: notImplemented('useTransition')
}


const factory = (hook: any) => {
  const scopedBoxes = [] as any[]
  let subscribers = [] as any[]
  let state = undefined as any

  const sync = () => {
    subscribers.slice().forEach(fn => fn())
  }

  const tick = () => {
    const originDispatcher = ReactCurrentDispatcher.current
    const originState = [
      pointer,
      useEffectQueue,
      boxes,
      nextTick
    ] as any

    let tickAgain = false
    let tickBody = true

    pointer = 0
    useEffectQueue = []
    boxes = scopedBoxes

    nextTick = () => {
      if (tickBody) {
        tickAgain = true
      } else {
        tick()
      }
    }

    ReactCurrentDispatcher.current = ownDisptacher
    state = hook()

    useEffectQueue.forEach(fn => fn())

    ;[ pointer, useEffectQueue, boxes, nextTick ] = originState
    ReactCurrentDispatcher.current = originDispatcher

    tickBody = false
    if (!tickAgain) {
      sync()
      return
    }
    tick()
  }

  const subscribe = (fn: any) => {
    subscribers.push(fn)
    return () => {
      subscribers = subscribers.filter(f => f !== fn)
    }
  }

  const get = () => state
  const init = () => tick()

  return {
    subscribe,
    get,
    init
  }
}

export const useBetween = <T>(hook: Hook<T>): T => {
  const forceUpdate = useForceUpdate()
  let store = stores.get(hook)
  if (!store) {
    store = factory(hook)
    stores.set(hook, store)
    store.init()
  }
  useEffect(() => store.subscribe(forceUpdate), [store])
  return store.get()
}
