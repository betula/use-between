import * as React from 'react'

type AnyHook = (...args: any[]) => any;
type ReactSharedInternalsType = {
  // React 18 and below
  ReactCurrentDispatcher: {
    current?: {
      [name: string]: AnyHook
    };
  };
} | {
  // React 19
  H: {
    [name: string]: AnyHook
  } | null
}

export const ReactSharedInternals: ReactSharedInternalsType =
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ??
  (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ??
  (React as any).__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function resolveDispatcher() {
  if("ReactCurrentDispatcher" in ReactSharedInternals) {
    return ReactSharedInternals.ReactCurrentDispatcher;
  } else {
    return Object.defineProperty({}, 'current', {
      get: () => ReactSharedInternals.H ?? undefined,
      set: (v) => { ReactSharedInternals.H = v },
    });
  }
}

export const ReactCurrentDispatcher = resolveDispatcher();
