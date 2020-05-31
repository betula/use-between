import * as React from 'react'

type AnyHook = (...args: any[]) => any;
type ReactSharedInternalsType = {
  ReactCurrentDispatcher: {
    current?: {
      [name: string]: AnyHook
    };
  };
}

export const ReactSharedInternals =
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as ReactSharedInternalsType

export const ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher
