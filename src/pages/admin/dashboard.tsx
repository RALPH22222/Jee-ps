export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-500 mb-6">System overview and management.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-teal-50 p-4 rounded-lg">
                        <span className="block text-2xl font-bold text-teal-700">12</span>
                        <span className="text-xs text-teal-600 uppercase">Active Jeeps</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <span className="block text-2xl font-bold text-blue-700">145</span>
                        <span className="text-xs text-blue-600 uppercase">Passengers</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
