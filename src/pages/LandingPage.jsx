import { Link } from 'react-router-dom';
import {HeartIcon} from '../components/ui/HeartIcon'
import {GetStartedButton} from '../components/ui/GetStartedButton';
import { useNavigate } from 'react-router-dom';
export const LandingPage = () => {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 w-full max-w-xl rounded-2xl shadow-lg flex flex-col gap-6 items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Welcome to <span className="text-blue-400">Cubey</span></h1>
        <p className="text-lg text-slate-200 text-center max-w-lg">
          <b>Cubey</b> is your all-in-one platform for speedcubing improvement. Track your solves, analyze your averages, and learn new algorithms—all in one place. Whether you're a beginner or a seasoned cuber, Cubey helps you get faster, smarter, and more efficient with every solve.
        </p>
        <div className="flex gap-4 w-full justify-center">
          <GetStartedButton onClick={()=> navigate("/signup")} text="Get Started" />
        </div>
        <footer className="mt-4 text-slate-400 text-sm text-center">
          <div className='flex'>
            <div>Made with </div>
            <div><HeartIcon></HeartIcon></div>
            <div> by <a href="https://github.com/sid-darth-73/cubey" target='_blank'>unbit</a> </div>

          </div>
        </footer>
      </div>
    </div>
  );
};
