import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import brandingBg from '../assets/branding-bg.jpg';
import { API_URL } from '../config';
import { CustomToast } from '../components/CustomToast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            console.log('Login successful:', data);
            localStorage.setItem('token', data.session?.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.custom((t) => (
                <CustomToast t={t} message="Login Successful!" type="success" />
            ), { duration: 3000 });

            setTimeout(() => {
                const userRole = data.user?.user_metadata?.role || data.user?.role;

                if (userRole === 'admin') {
                    navigate('/admin/dashboard');
                } else if (userRole === 'passenger') {
                    navigate('/passenger/map');
                } else {
                    console.warn('Unknown user role:', userRole);
                    navigate('/');
                }
            }, 1000);

        } catch (err: any) {
            setError(err.message);
            toast.custom((t) => (
                <CustomToast t={t} message={err.message || 'Login failed'} type="error" />
            ), { duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans animate-fade-in">
            {/* Left Side - Branding (Image Background) */}
            <div
                className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${brandingBg})` }}
            >
                <div className="absolute inset-0 "></div>

                <div className="relative z-10 text-center animate-fade-in-up">
                    <div className="mb-8 inline-flex items-center justify-center w-48 h-48 transition-transform hover:scale-105 duration-300 p-2">
                        <img src={logo} alt="Jee-ps Logo" className="w-full h-full object-contain drop-shadow-xl" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900">
                        Jee-ps
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-800 font-light max-w-sm mx-auto leading-relaxed tracking-wide drop-shadow-sm font-medium">
                        Official Jeep Seat Monitoring System for Taguig City
                    </p>
                </div>

                <div className="absolute bottom-8 text-xs text-gray-600 font-semibold tracking-widest uppercase z-10">
                    © 2026 Taguig City Transport
                </div>
            </div>

            {/* Right Side - Form (Now Teal Gradient) */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#008282] to-[#004d4d] flex items-center justify-center p-8 md:p-12 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-teal-100">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border-l-4 border-red-400 p-4 rounded-r shadow-sm animate-pulse">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-100">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="group">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-teal-50 mb-1 transition-colors group-focus-within:text-white"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg border border-transparent bg-white/10 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200 ease-in-out hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-teal-50 transition-colors group-focus-within:text-white"
                                    >
                                        Password
                                    </label>
                                    <a
                                        href="#"
                                        className="text-sm font-medium text-teal-200 hover:text-white transition-colors underline-offset-2 hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg border border-transparent bg-white/10 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200 ease-in-out hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-black/20 text-sm font-bold text-[#006868] bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#006868]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-teal-100">
                                    Don't have an account?
                                </span>
                                <a href="/register" className="font-semibold text-white hover:text-teal-200 transition-colors flex items-center justify-center gap-2 group">
                                    <span>Create an account</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
