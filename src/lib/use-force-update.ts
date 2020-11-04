import { useReducer } from 'react'

export const useForceUpdate = () => (useReducer as any)(() => ({}))[1] as () => void
