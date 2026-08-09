import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Signin } from './pages/Signin';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import Solves from './pages/dashboard/Solves';
import { DashboardLayout } from './components/DashboardLayout';
import { RequireAuth } from './components/RequireAuth';
import Averages from './pages/dashboard/Averages';
import Learn from './pages/dashboard/Learn';
import Timer from './pages/dashboard/Timer';
import { LandingPage } from './pages/LandingPage';
import { Improve } from './pages/dashboard/Improve';
import { PublicProfile } from './pages/PublicProfile';
import BattleRoom from './pages/dashboard/BattleRoom';
import { SocketProvider } from './context/SocketContext';
import { ChallengePopup } from './components/ChallengePopup';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <ChallengePopup />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/:shareLink" element={<PublicProfile />} />

          {/* Full-screen battle room — outside dashboard layout */}
          <Route path="/battle/:roomId" element={<RequireAuth><BattleRoom /></RequireAuth>} />

          <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Timer />} />
            <Route path="timer" element={<Timer />} />
            <Route path="solves" element={<Solves />} />
            <Route path="averages" element={<Averages/>} />
            <Route path="learn" element={<Learn/>} />
            <Route path="improve" element={<Improve/>} />
          </Route>
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
