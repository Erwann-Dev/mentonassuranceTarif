import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import 'react-datepicker/dist/react-datepicker.css'
import './i18n'
import { App } from './App'

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

