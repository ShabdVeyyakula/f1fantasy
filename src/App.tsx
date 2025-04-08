import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import { SignUpPage } from './pages/SignUpPage'
import { TeamBuilderPage } from './pages/TeamBuilderPage'
import { Dashboard } from './components/Dashboard'
import '@radix-ui/themes/styles.css'
import './App.css'

function App() {
  return (
    <Theme appearance="light" accentColor="crimson">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUpPage />} />
          <Route path="/build-team" element={<TeamBuilderPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  )
}

export default App
