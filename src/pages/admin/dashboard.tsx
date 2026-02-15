import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

interface DashboardStats {
    jeeps: number;
    users: number;
    routes: number;
    logs: number;
    jeepsPerRoute: { name: string; value: number }[];
    logsActivity: { date: string; name: string; logs: number }[];
}

const StatCard = ({ title, value, color, icon }: { title: string, value: number, color: string, icon: React.ReactNode }) => (
    <div className={`bg-white p-6 rounded-xl border border-${color}-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between`}>
        <div>
            <span className={`block text-3xl font-extrabold text-${color}-600 mb-1`}>{value}</span>
            <span className={`text-xs text-${color}-500 uppercase tracking-widest font-semibold`}>{title}</span>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-full text-${color}-600`}>
            {icon}
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse flex items-center justify-between">
        <div className="space-y-3">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
    </div>
);

const SkeletonChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-96 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setStats(data);
            if (isRefresh) toast.success('Dashboard refreshed');
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || 'Failed to update dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleRefresh = () => {
        fetchStats(true);
    };

    if (error && !stats) {
        return (
            <div className="flex-1 p-8 ml-64 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <div className="text-red-500 text-lg font-semibold mb-4">Unable to load dashboard</div>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => fetchStats()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 ml-64 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
                        <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className={`p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-teal-600 hover:border-teal-200 transition-all ${refreshing ? 'animate-spin' : ''}`}
                            title="Refresh Data"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Active Jeeps"
                                value={stats?.jeeps || 0}
                                color="teal"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Total Users"
                                value={stats?.users || 0}
                                color="blue"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Routes"
                                value={stats?.routes || 0}
                                color="orange"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Logs Today"
                                value={stats?.logs || 0}
                                color="purple"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                }
                            />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {loading ? (
                        <>
                            <SkeletonChart />
                            <SkeletonChart />
                        </>
                    ) : (
                        <>
                            {/* Jeeps per Route Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-teal-500 rounded-full inline-block"></span>
                                    Jeep Distribution
                                </h2>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.jeepsPerRoute || []} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    padding: '12px 16px'
                                                }}
                                                itemStyle={{ color: '#0f766e', fontWeight: 600 }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar
                                                dataKey="value"
                                                name="Jeeps Assigned"
                                                fill="#0d9488"
                                                radius={[6, 6, 0, 0]}
                                                barSize={40}
                                                animationDuration={1500}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Daily Logs Activity Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                                    Weekly Log Activity
                                </h2>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats?.logsActivity || []} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    padding: '12px 16px'
                                                }}
                                                itemStyle={{ color: '#7c3aed', fontWeight: 600 }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Line
                                                type="monotone"
                                                dataKey="logs"
                                                name="Logs Processed"
                                                stroke="#8b5cf6"
                                                strokeWidth={4}
                                                dot={{ r: 4, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }}
                                                activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                                                animationDuration={1500}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
