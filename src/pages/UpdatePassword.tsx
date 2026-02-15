import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import brandingBg from '../assets/branding-bg.jpg';
import { API_URL } from '../config';
import { CustomToast } from '../components/CustomToast';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check for tokens in the URL hash
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) {
            toast.error('Invalid or expired password reset link.');
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        // Extract tokens from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
            setError('Invalid reset link. Please try again.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update password');
            }

            toast.custom((t) => (
                <CustomToast t={t} message="Password updated successfully! Please login." type="success" />
            ), { duration: 4000 });

            // Clear hash
            window.location.hash = '';

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
            toast.custom((t) => (
                <CustomToast t={t} message={err.message || 'Failed to update password'} type="error" />
            ), { duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans animate-fade-in">
            {/* Left Side - Branding (Image Background) - Same as Login */}
            <div
                className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${brandingBg})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-800/50 to-transparent"></div>

                <div className="relative z-10 text-center animate-fade-in-up">
                    <div className="mb-8 inline-flex items-center justify-center w-48 h-48 bg-white/10 backdrop-blur-md rounded-full shadow-2xl border border-white/20 transition-transform hover:scale-105 duration-300 p-8">
                        <img src={logo} alt="Jee-ps Logo" className="w-full h-full object-contain drop-shadow-xl" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-4 drop-shadow-lg">
                        Jee-ps
                    </h1>
                    <p className="text-xl md:text-2xl text-teal-50 font-light max-w-sm mx-auto leading-relaxed tracking-wide drop-shadow-md">
                        Secure your account with a new password.
                    </p>
                </div>

                <div className="absolute bottom-8 text-xs text-teal-200/60 font-semibold tracking-widest uppercase z-10">
                    © 2026 Taguig City Transport
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#008282] to-[#004d4d] flex items-center justify-center p-8 md:p-12 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-sm text-teal-100">
                            Enter your new password below.
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
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-teal-50 mb-1 transition-colors group-focus-within:text-white"
                                >
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg border border-transparent bg-white/10 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200 ease-in-out hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="group">
                                <label
                                    htmlFor="confirm-password"
                                    className="block text-sm font-semibold text-teal-50 mb-1 transition-colors group-focus-within:text-white"
                                >
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg border border-transparent bg-white/10 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200 ease-in-out hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>

                        <div className="text-center mt-4">
                            <a href="/login" className="text-sm font-medium text-teal-200 hover:text-white transition-colors">
                                Back to Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
