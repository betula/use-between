import React from 'react'

type AnyHook = (...args: any[]) => any;
type ReactSharedInternalsType = {
  ReactCurrentDispatcher: {
    current?: {
      readContext: AnyHook;
      useCallback: AnyHook;
      useContext: AnyHook;
      useEffect: AnyHook;
      useImperativeHandle: AnyHook;
      useLayoutEffect: AnyHook;
      useMemo: AnyHook;
      useReducer: AnyHook;
      useRef: AnyHook;
      useState: AnyHook;
      useDebugValue: AnyHook;
      useResponder: AnyHook;
      useDeferredValue: AnyHook;
      useTransition: AnyHook;
    };
  };
}

export const ReactSharedInternals =
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as ReactSharedInternalsType

export const ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher
