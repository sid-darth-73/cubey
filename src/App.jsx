import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Signin } from './pages/Signin';
import { Signup } from './pages/Signup';
import Solves from './pages/dashboard/Solves';
import { DashboardLayout } from './components/DashboardLayout';
import { RequireAuth } from './components/RequireAuth';
import Averages from './pages/dashboard/Averages';
import Learn from './pages/dashboard/Learn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<Solves />} />
          <Route path="solves" element={<Solves />} />
          <Route path="averages" element={<Averages/>} />
          <Route path="learn" element={<Learn/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
