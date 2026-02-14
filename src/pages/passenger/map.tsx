import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
const jeepIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.freepik.com/256/15303/15303815.png?semt=ais_white_label',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'jeep-marker'
});





function ActiveJeepList({ jeeps, selectedJeep, onClose }: { jeeps: Jeep[], selectedJeep: Jeep | null, onClose: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const isSidebarVisible = isOpen || !!selectedJeep;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-4 right-4 z-[1000] bg-white text-[#008282] p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008282] transition-all"
                aria-label="View Active Jeeps"
            >
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                        <circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" />
                    </svg>
                    {jeeps.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                            {jeeps.length}
                        </span>
                    )}
                </div>
            </button>
            <div className={`absolute inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[1001] ${isSidebarVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#006868]">
                            {selectedJeep ? 'Jeep Details' : 'Active Jeeps'}
                        </h2>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {selectedJeep ? (
                            <div className="space-y-4">
                                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-3xl">
                                        🚐
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#006868]">{selectedJeep.plate_number}</h3>
                                    <p className="text-sm text-gray-500">Taguig Transport Loop</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase">Passengers</p>
                                        <p className={`text-lg font-bold ${selectedJeep.current_passenger_count >= selectedJeep.max_capacity
                                            ? 'text-red-500'
                                            : 'text-green-600'
                                            }`}>
                                            {selectedJeep.current_passenger_count}/{selectedJeep.max_capacity}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase">Status</p>
                                        <p className="text-lg font-bold text-teal-600">Active</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsOpen(true);
                                        onClose();
                                    }}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-teal-600 underline"
                                >
                                    View all active jeeps
                                </button>
                            </div>
                        ) : (
                            jeeps.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    <p>No active jeeps found.</p>
                                </div>
                            ) : (
                                jeeps.map((jeep) => (
                                    <div key={jeep.jeep_id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#008282]/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{jeep.plate_number}</h3>
                                                <p className="text-xs text-gray-500">Route: Taguig Loop</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${jeep.current_passenger_count >= jeep.max_capacity
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-green-100 text-green-600'
                                                }`}>
                                                {jeep.current_passenger_count}/{jeep.max_capacity}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Updated just now
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function LocationMarker() {
    const map = useMap();
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [zoom, setZoom] = useState(map.getZoom());

    useMapEvents({
        zoomend: () => {
            setZoom(map.getZoom());
        }
    });

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

    // Calculate dynamic icon size (Smaller when zoomed out)
    const size = Math.max(15, Math.min(50, zoom * 2.5));

    const dynamicPassengerIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131546.png',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
        className: 'passenger-marker'
    });

    return position === null ? null : (
        <Marker position={position} icon={dynamicPassengerIcon}>
            <Popup>You are here</Popup>
        </Marker>
    );
}

function LocateButton() {
    const map = useMap();

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, map.getZoom());
        });
    };

    return (
        <button
            onClick={handleLocate}
            className="absolute bottom-6 right-4 z-[1000] bg-white text-[#008282] p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008282] transition-all"
            aria-label="Locate Me"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
        </button>
    );
}


interface Jeep {
    jeep_id: number;
    plate_number: string;
    current_latitude: number;
    current_longitude: number;
    current_passenger_count: number;
    max_capacity: number;
}


export default function PassengerMap() {
    const [jeeps, setJeeps] = useState<Jeep[]>([]);
    const [selectedJeep, setSelectedJeep] = useState<Jeep | null>(null);

    useEffect(() => {
        const fetchJeeps = async () => {
            try {
                const response = await fetch('https://jee-ps-server.onrender.com/passenger/locations');
                if (!response.ok) throw new Error('Failed to fetch jeeps');
                const data = await response.json();
                if (data.length > 0) {
                    setJeeps(data);
                }
            } catch (error) {
                console.error("Error fetching jeeps:", error);
            }
        };

        fetchJeeps();
        const interval = setInterval(fetchJeeps, 1000);
        return () => clearInterval(interval);
    }, []);

    const defaultCenter: [number, number] = [6.912676, 122.064889];

    return (
        <div className="h-screen w-full relative flex flex-col">
            <ActiveJeepList
                jeeps={jeeps}
                selectedJeep={selectedJeep}
                onClose={() => setSelectedJeep(null)}
            />

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

                <LocationMarker />
                <LocateButton />

                {jeeps.map((jeep) => (
                    <Marker
                        key={jeep.jeep_id}
                        position={[jeep.current_latitude, jeep.current_longitude]}
                        icon={jeepIcon}
                        eventHandlers={{
                            click: () => setSelectedJeep(jeep),
                        }}
                    >
                    </Marker>
                ))}
            </MapContainer>
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
