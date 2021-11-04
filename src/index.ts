import { useEffect, useRef } from 'react'
import { ReactCurrentDispatcher } from './lib/react-shared-internals'
import { useForceUpdate } from './lib/use-force-update'

const notImplemented = (name: string) => () => {
  const msg = `Hook "${name}" no possible to using inside useBetween scope.`
  console.error(msg)
  throw new Error(msg)
}

const equals = (a: any, b: any) => Object.is(a, b)
const shouldUpdate = (a: any[], b: any[]) => (
  (!a || !b) ||
  (a.length !== b.length) ||
  a.some((dep: any, index: any) => !equals(dep, b[index]))
)

const detectServer = () => typeof window === 'undefined'

const instances = new Map<any, any>()

let boxes = [] as any[]
let pointer = 0
let useEffectQueue = [] as any[]
let useLayoutEffectQueue = [] as any[]
let nextTick = () => {}

let isServer = detectServer()
let initialData = undefined as any

const nextBox = () => {
  const index = pointer ++
  return (boxes[index] = boxes[index] || {})
}

const ownDisptacher = {
  useState(initialState?: any) {
    const box = nextBox()
    const tick = nextTick

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

  useReducer(reducer: any, initialState?: any, init?: any) {
    const box = nextBox()
    const tick = nextTick

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

  useEffect(fn: any, deps: any[]) {
    if (isServer) return
    const box = nextBox()

    if (!box.initialized) {
      box.deps = deps
      box.initialized = true
      useEffectQueue.push([box, deps, fn])
    }
    else if (shouldUpdate(box.deps, deps)) {
      box.deps = deps
      useEffectQueue.push([box, deps, fn])
    }
  },

  useLayoutEffect(fn: any, deps: any[]) {
    if (isServer) return
    const box = nextBox()

    if (!box.initialized) {
      box.deps = deps
      box.initialized = true
      useLayoutEffectQueue.push([box, deps, fn])
    }
    else if (shouldUpdate(box.deps, deps)) {
      box.deps = deps
      useLayoutEffectQueue.push([box, deps, fn])
    }
  },

  useCallback(fn: any, deps: any[]) {
    const box = nextBox()

    if (!box.initialized) {
      box.fn = fn
      box.deps = deps
      box.initialized = true
    }
    else if (shouldUpdate(box.deps, deps)) {
      box.deps = deps
      box.fn = fn
    }

    return box.fn
  },

  useMemo(fn: any, deps: any[]) {
    const box = nextBox()

    if (!box.initialized) {
      box.deps = deps
      box.state = fn()
      box.initialized = true
    }
    else if (shouldUpdate(box.deps, deps)) {
      box.deps = deps
      box.state = fn()
    }

    return box.state
  },

  useRef(initialValue: any) {
    const box = nextBox()

    if (!box.initialized) {
      box.state = { current: initialValue }
      box.initialized = true
    }

    return box.state
  },

  useImperativeHandle(ref: any, fn: any, deps: any[]) {
    if (isServer) return
    const box = nextBox()

    if (!box.initialized) {
      box.deps = deps
      box.initialized = true
      useLayoutEffectQueue.push([box, deps, () => {
        typeof ref === 'function' ? ref(fn()) : ref.current = fn()
      }])
    }
    else if (shouldUpdate(box.deps, deps)) {
      box.deps = deps
      useLayoutEffectQueue.push([box, deps, () => {
        typeof ref === 'function' ? ref(fn()) : ref.current = fn()
      }])
    }
  }
}
;[
  'readContext',
  'useContext',
  'useDebugValue',
  'useResponder',
  'useDeferredValue',
  'useTransition'
].forEach(key => (ownDisptacher as any)[key] = notImplemented(key))

const factory = (hook: any) => {
  const scopedBoxes = [] as any[]
  let syncs = [] as any[]
  let state = undefined as any

  const sync = () => {
    syncs.slice().forEach(fn => fn())
  }

  const tick = () => {
    const originDispatcher = ReactCurrentDispatcher.current
    const originState = [
      pointer,
      useEffectQueue,
      useLayoutEffectQueue,
      boxes,
      nextTick
    ] as any

    let tickAgain = false
    let tickBody = true

    pointer = 0
    useEffectQueue = []
    useLayoutEffectQueue = []
    boxes = scopedBoxes

    nextTick = () => {
      if (tickBody) {
        tickAgain = true
      } else {
        tick()
      }
    }

    ReactCurrentDispatcher.current = ownDisptacher as any
    state = hook(initialData)

    ;[ useLayoutEffectQueue, useEffectQueue ].forEach(queue => (
      queue.forEach(([box, deps, fn]) => {
        box.deps = deps
        if (box.unsub) {
          box.unsub()
        }
        const unsub = fn()
        if (typeof unsub === "function") {
          box.unsub = unsub
        } else {
          box.unsub = null
        }
      })
    ))

    ;[
      pointer,
      useEffectQueue,
      useLayoutEffectQueue,
      boxes,
      nextTick
    ] = originState
    ReactCurrentDispatcher.current = originDispatcher

    tickBody = false
    if (!tickAgain) {
      sync()
      return
    }
    tick()
  }

  const sub = (fn: any) => {
    syncs.push(fn)
  }

  const unsub = (fn: any) => {
    syncs = syncs.filter(f => f !== fn)
  }

  return {
    init: () => tick(),
    get: () => state,
    sub,
    unsub,
  }
}

type Hook<T> = (initialData?: any) => T;

export const useBetween = <T>(hook: Hook<T>): T => {
  const forceUpdate = useForceUpdate()
  let inst = instances.get(hook)
  if (!inst) {
    inst = factory(hook)
    instances.set(hook, inst)
    inst.init()
  }
  useEffect(() => (inst.sub(forceUpdate), () => inst.unsub(forceUpdate)), [inst])
  return inst.get()
}

export const useInitial = <T = any>(data?: T, server?: boolean) => {
  const ref = useRef<number>()
  if (!ref.current) {
    isServer = typeof server === 'undefined' ? detectServer() : server
    isServer && instances.clear();
    initialData = data
    ref.current = 1
  }
}

