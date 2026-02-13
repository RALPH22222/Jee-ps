import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../assets/logo.png';

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
            const response = await fetch('https://jee-ps-server.onrender.com/auth/login', {
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

            toast.success('Login Successful!');
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
            toast.error(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#008282] to-[#004d4d] flex-col justify-center items-center p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-[#69B0AC] blur-3xl"></div>
                </div>

                <div className="relative z-10 text-center animate-fade-in-up">
                    <div className="mb-8 inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-transform hover:scale-105 duration-300 p-5">
                        <img src={logo} alt="Jee-ps Logo" className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                        Jee-ps
                    </h1>
                    <p className="text-xl md:text-2xl text-[#e0f2f2] font-light max-w-sm mx-auto leading-relaxed tracking-wide drop-shadow-sm">
                        Official Jeep Seat Monitoring System for Taguig City
                    </p>
                </div>

                <div className="absolute bottom-8 text-xs text-white/40 tracking-widest uppercase">
                    © 2026 Taguig City Transport
                </div>
            </div>
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-12 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm animate-pulse">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="group">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-[#008282]"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008282] focus:border-transparent focus:bg-white transition-all duration-200 ease-in-out hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-[#008282]"
                                    >
                                        Password
                                    </label>
                                    <a
                                        href="#"
                                        className="text-sm font-medium text-[#006868] hover:text-[#008282] transition-colors underline-offset-2 hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008282] focus:border-transparent focus:bg-white transition-all duration-200 ease-in-out hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#006868]/20 text-sm font-bold text-white bg-[#006868] hover:bg-[#005858] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006868] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <a href="/register" className="font-semibold text-[#006868] hover:text-[#008282] transition-colors flex items-center justify-center gap-2 group">
                                <span>Create an account</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
