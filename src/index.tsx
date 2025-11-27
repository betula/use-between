import React, { Fragment, useState, useEffect, useRef, memo, MemoExoticComponent } from "react";

/**
 * Minimal class-based Event implementation using Set
 */
export class Event<T = void> {
  private listeners = new Set<(value: T) => void>();

  fire(value: T): void {
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

/**
 * Minimal hook classes registry
 */
const hookClasses: HookClass[] = [];
const onHookClassesUpdated = new Event<void>();

/**
 * Symbol to store the cache
 */
const cacheSymbol = Symbol();

/**
 * Symbol to store the onRefresh event
 */
const onRefreshSymbol = Symbol();

/**
 * Symbol to store the last state
 */
const lastStateSymbol = Symbol();

/**
 * Symbol to store the id
 */
const idSymbol = Symbol();

/**
 * Hook class interface
 */
interface HookClass extends MemoExoticComponent<() => null> {
  [idSymbol]?: number;
  [lastStateSymbol]?: unknown;
  [onRefreshSymbol]?: Event<unknown>;
}

/**
 * Minimal shallow equal implementation
 */
export function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Minimal evruistic id generator
 */
function getNextHookClassId(): number {
  return hookClasses.length + 1;
}

/**
 * between hook factory
 */
export function between<T>(hookFn: () => T): () => T {
  const _hookFn = hookFn as (typeof hookFn & { [cacheSymbol]?: () => T });

  // Return the cached hook if it exists
  if (_hookFn[cacheSymbol]) {
    return _hookFn[cacheSymbol]!;
  }
  
  const Class: HookClass = memo(() => {
    const ref = useRef<any>(undefined);
    
    const nextState = _hookFn();

    if (!shallowEqual(ref.current, nextState)) {
      ref.current = nextState;
      Class[lastStateSymbol] = nextState;
      
      // Next tick if needed
      // Promise.resolve().then(Class[onRefreshSymbol]!.fire);
      Class[onRefreshSymbol]!.fire(nextState);
    }

    return null;
  });
  Class[onRefreshSymbol] = new Event<unknown>();
  Class[idSymbol] = getNextHookClassId();

  hookClasses.push(Class);
  onHookClassesUpdated.fire();

  function hook(): T {
    const [value, setValue] = useState<T>(Class[lastStateSymbol] as T);
    useEffect(() => {
      return Class[onRefreshSymbol]!.subscribe(setValue as () => T);
    }, []);

    return value;
  }

  _hookFn[cacheSymbol] = hook;
  return hook;
}

/**
 * Executor component
 */
const Executor = memo(() => {
  const [classes, setClasses] = useState<HookClass[]>(hookClasses);
  
  useEffect(() => {
    return onHookClassesUpdated.subscribe(() => {
      setClasses(hookClasses.slice());
    });
  }, []);

  return <Fragment>
    {classes.map((Class: HookClass) => <Class key={Class[idSymbol]} />)}
  </Fragment>;
});

/**
 * Root context for the use-between app.
 * Hooks used between will obtain their own context from this place in your React hierarchy.
 * This means that we can now use the useContext hook inside hooks used between. 
 * Now, react-router-dom and much more will be available to you within the "use-between" hooks.
 */
export const Context = ({ children }: { children: React.ReactNode }) => {
  return <Fragment>
    <Executor />
    {children}
  </Fragment>
}
