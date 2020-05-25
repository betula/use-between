import React, { useState, useEffect } from 'react'
import { useBetween } from 'use-between'

const useCurrencyStore = () => {
  const [ dollars, setDollars ] = useState(0)
  const [ euros, setEuros ] = useState(0)

  useEffect(() => {
    setDollars(euros * 2)
  }, [euros])

  useEffect(() => {
    setEuros(dollars / 2)
  }, [dollars])

  return {
    dollars,
    euros,
    setDollars,
    setEuros
  }
}

const DollarInput = () => {
  const { dollars, setDollars } = useBetween(useCurrencyStore)
  return <input value={dollars} onChange={(ev: any) => setDollars(ev.target.value)} />
}

const EuroInput = () => {
  const { euros, setEuros } = useBetween(useCurrencyStore)
  return <input value={euros} onChange={(ev: any) => setEuros(ev.target.value)} />
}

const App = () => (
  <>
    <DollarInput />
    <EuroInput />
  </>
)

export default App
