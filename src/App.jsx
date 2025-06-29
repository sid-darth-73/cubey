import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Signin } from './pages/Signin'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { RequireAuth } from './components/RequireAuth'

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/signin" element={<Signin/>}/>

      <Route path="/signup" element={<Signup/>}/>

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
