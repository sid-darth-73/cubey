import { Outlet, useNavigate } from 'react-router-dom';
import { NavButton } from './ui/NavButton';
export function DashboardLayout() {
  const user = localStorage.getItem('user');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <div className="w-64 bg-slate-800 p-4 space-y-6">
        <div className='flex items-center justify-center'>
        <div className="font-bold text-lg mb-4">{user}</div>
        </div>
        <NavButton text='Solves' onClick={()=> navigate('/dashboard/solves')}></NavButton>
        <NavButton text='Averages' onClick={()=> navigate('/dashboard/averages')}></NavButton>
        <NavButton text='Learn' onClick={()=> navigate('/dashboard/learn')}></NavButton>
        <NavButton text='Improve' onClick={()=> navigate('/dashboard/improve')}></NavButton>
      </div>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
