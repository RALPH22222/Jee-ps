import { useState } from 'react';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for Start (Green) and End (Red)
const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapClickHandlerProps {
    setOrigin: (origin: { lat: number; lng: number } | null) => void;
    setDestination: (destination: { lat: number; lng: number } | null) => void;
    origin: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number } | null;
}

function MapClickHandler({ setOrigin, setDestination, origin, destination }: MapClickHandlerProps) {
    useMapEvents({
        click: (e) => {
            if (!origin) {
                setOrigin(e.latlng);
                toast.success('Start point set');
            } else if (!destination) {
                setDestination(e.latlng);
                toast.success('End point set');
            } else {
                toast('Resetting points... Click again to set Start point.', { icon: '🔄' });
                setOrigin(e.latlng);
                setDestination(null);
            }
        },
    });
    return null;
}

export default function JeepRegistration() {
    const [plateNumber, setPlateNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [routeName, setRouteName] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('20');

    // Map State
    const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
    const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!plateNumber || !macAddress) {
            toast.error('Plate number and MAC Address are required');
            return;
        }

        if (routeName && (!origin || !destination)) {
            toast.error('If specifying a route, please select Start and End points on the map');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/register-jeep`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plate_number: plateNumber,
                    mac_address: macAddress,
                    driver_name: driverName,
                    route_name: routeName,
                    origin_lat: origin?.lat,
                    origin_lng: origin?.lng,
                    destination_lat: destination?.lat,
                    destination_lng: destination?.lng,
                    max_capacity: parseInt(maxCapacity)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register jeep');
            }

            toast.success('Jeep registered successfully');

            // Reset form
            setPlateNumber('');
            setDriverName('');
            setRouteName('');
            setMacAddress('');
            setMaxCapacity('20');
            setOrigin(null);
            setDestination(null);

        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const defaultCenter: [number, number] = [14.5378, 121.0414];

    return (
        <div className="flex-1 p-8 ml-64 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-teal-500 rounded-full inline-block"></span>
                        Register New Jeep
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Plate Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                                <input
                                    type="text"
                                    value={plateNumber}
                                    onChange={(e) => setPlateNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. ABC 1234"
                                    required
                                />
                            </div>

                            {/* Max Capacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                                <input
                                    type="number"
                                    value={maxCapacity}
                                    onChange={(e) => setMaxCapacity(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 20"
                                    required
                                />
                            </div>

                            {/* Device MAC Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Device MAC Address</label>
                                <input
                                    type="text"
                                    value={macAddress}
                                    onChange={(e) => setMacAddress(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="XX:XX:XX:XX:XX:XX"
                                    required
                                />
                            </div>

                            {/* Driver Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                                <input
                                    type="text"
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter Driver Name"
                                />
                            </div>

                            {/* Route Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                                <input
                                    type="text"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Assign Route (Optional)"
                                />
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Route Definition (Start & End Points)</label>
                            <p className="text-sm text-gray-500 mb-3">Click on the map to set the Start Point (Green) and End Point (Red).</p>
                            <div className="h-96 w-full rounded-xl overflow-hidden border border-gray-300 z-0 relative">
                                <MapContainer
                                    center={defaultCenter}
                                    zoom={13}
                                    scrollWheelZoom={true}
                                    className="h-full w-full z-0"
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <MapClickHandler setOrigin={setOrigin} setDestination={setDestination} origin={origin} destination={destination} />

                                    {origin && (
                                        <Marker position={origin} icon={startIcon}>
                                            <Popup>Start Point</Popup>
                                        </Marker>
                                    )}

                                    {destination && (
                                        <Marker position={destination} icon={endIcon}>
                                            <Popup>End Point</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Start Point: {origin ? `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}` : 'Not set'}</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> End Point: {destination ? `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}` : 'Not set'}</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </span>
                                ) : (
                                    'Register Jeep'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .leaflet-popup-tip {
                    background: white;
                }
            `}</style>
        </div>
    );
}
