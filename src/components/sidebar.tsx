import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-teal-800 text-white' : 'text-teal-100 hover:bg-teal-700 hover:text-white';
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="bg-teal-900 w-64 min-h-screen flex flex-col text-white transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-50">
            <div className="flex items-center justify-center h-20 border-b border-teal-800 bg-teal-950">
                <img src={logo} alt="Jee-ps Logo" className="h-10 w-10 mr-2" />
                <span className="text-xl font-bold tracking-wider">Jee-ps Admin</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/admin/dashboard')}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </Link>

                <Link to="/admin/register-jeep" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/admin/register-jeep')}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Jeep Registration
                </Link>

                <Link to="/admin/users" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/admin/users')}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                </Link>
            </nav>

            <div className="p-4 border-t border-teal-800 bg-teal-950">
                <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-red-300 hover:text-white hover:bg-red-800 rounded-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
    