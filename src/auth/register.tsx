export default function Register() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                <p className="text-gray-500 mb-6">Join Jee-ps Transport.</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-400 italic">Registration form coming soon...</p>
                    <a href="/login" className="text-[#006868] hover:text-[#008282] text-sm mt-4 block font-medium">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}
