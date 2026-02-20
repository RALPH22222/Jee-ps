import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

interface Device {
    mac_address: string;
}

interface Route {
    route_name: string;
}

interface Jeep {
    id: string;
    plate_number: string;
    max_capacity: number;
    driver_name: string;
    fare: number;
    device_id?: string;
    devices?: Device;
    routes?: Route;
}

export default function JeepManagement() {
    const [jeeps, setJeeps] = useState<Jeep[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedJeepId, setSelectedJeepId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        plate_number: '',
        max_capacity: '',
        driver_name: '',
        fare: '',
        mac_address: ''
    });

    useEffect(() => {
        fetchJeeps();
    }, []);

    const fetchJeeps = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/jeeps`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jeeps');
            }

            const data = await response.json();
            setJeeps(data);
        } catch (error) {
            console.error('Error fetching jeeps:', error);
            toast.error('Could not load jeeps list.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openEditModal = (jeep: Jeep) => {
        setSelectedJeepId(jeep.id || (jeep as any).jeep_id);
        setFormData({
            plate_number: jeep.plate_number || '',
            max_capacity: jeep.max_capacity?.toString() || '',
            driver_name: jeep.driver_name || '',
            fare: jeep.fare?.toString() || '',
            mac_address: jeep.devices?.mac_address || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                plate_number: formData.plate_number,
                max_capacity: parseInt(formData.max_capacity) || null,
                driver_name: formData.driver_name,
                fare: parseFloat(formData.fare) || null,
                mac_address: formData.mac_address
            };

            const response = await fetch(`${API_URL}/admin/jeeps/${selectedJeepId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update jeep');
            }

            toast.success('Jeep updated successfully!');
            setShowModal(false);
            fetchJeeps();
        } catch (error: any) {
            console.error('Error updating jeep:', error);
            toast.error(error.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this jeep? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/jeeps/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete jeep');
            }

            toast.success('Jeep deleted successfully');
            fetchJeeps();
        } catch (error: any) {
            console.error('Error deleting jeep:', error);
            toast.error(error.message || 'Failed to delete jeep');
        }
    };

    return (
        <div className="flex-1 p-8 ml-64 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#006868] tracking-tight">Jeep Management</h1>
                    <p className="mt-1 text-gray-500">View, update, and delete active jeeps in the system.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jeep Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device & Route</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity & Fare</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : jeeps.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            <p className="text-lg font-medium">No jeeps found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jeeps.map((jeep) => (
                                    <tr key={jeep.id || (jeep as any).jeep_id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{jeep.plate_number}</div>
                                            <div className="text-sm text-gray-500">Driver: {jeep.driver_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">MAC: {jeep.devices?.mac_address || 'Unassigned'}</div>
                                            <div className="text-sm text-gray-500">Route: {jeep.routes?.route_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Capacity: {jeep.max_capacity}</div>
                                            <div className="text-sm text-gray-500">Fare: ₱{jeep.fare}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(jeep)}
                                                    className="text-indigo-600 hover:text-indigo-900 hover:underline transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(jeep.id || (jeep as any).jeep_id)}
                                                    className="text-red-500 hover:text-red-700 hover:underline transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 pointer-events-none">
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block w-full max-w-lg p-0 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl sm:my-8 sm:align-middle pointer-events-auto relative z-10" onClick={(e) => e.stopPropagation()}>
                            <div className="relative bg-[#006868] px-6 py-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2" id="modal-title">
                                    Update Jeep
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Plate Number</label>
                                        <input
                                            type="text"
                                            name="plate_number"
                                            required
                                            value={formData.plate_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006868]/50 focus:border-[#006868] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Device MAC Address</label>
                                        <input
                                            type="text"
                                            name="mac_address"
                                            required
                                            value={formData.mac_address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006868]/50 focus:border-[#006868] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Driver Name</label>
                                    <input
                                        type="text"
                                        name="driver_name"
                                        required
                                        value={formData.driver_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006868]/50 focus:border-[#006868] transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Max Capacity</label>
                                        <input
                                            type="number"
                                            name="max_capacity"
                                            required
                                            value={formData.max_capacity}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006868]/50 focus:border-[#006868] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Fare (PHP)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="fare"
                                            required
                                            value={formData.fare}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006868]/50 focus:border-[#006868] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-[#006868] text-white font-semibold rounded-lg hover:bg-[#005858] transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#006868] disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Jeep'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
