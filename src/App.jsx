import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Signin } from './pages/Signin';
import { Signup } from './pages/Signup';
import Solves from './pages/dashboard/Solves';
import { DashboardLayout } from './components/DashboardLayout';
import { RequireAuth } from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<Solves />} />
          <Route path="solves" element={<Solves />} />
          {/* other sections like /dashboard/averages etc */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
