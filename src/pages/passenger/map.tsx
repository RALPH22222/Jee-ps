import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { API_URL } from '../../config';

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





interface Route {
    route_name: string;
    origin_latitude: number;
    origin_longitude: number;
    destination_latitude: number;
    destination_longitude: number;
}

interface Jeep {
    jeep_id: string;
    plate_number: string;
    current_latitude: number;
    current_longitude: number;
    current_passenger_count: number;
    max_capacity: number;
    route_id?: number;
    routes?: Route;
}

interface SavedJeep {
    id: string;
    jeep_id: string;
    jeeps: Jeep;
}

function ActiveJeepList({
    jeeps,
    savedJeeps,
    selectedJeep,
    onClose,
    onSelectJeep,
    onSaveJeep,
    onUnsaveJeep,
    onViewRoute
}: {
    jeeps: Jeep[],
    savedJeeps: SavedJeep[],
    selectedJeep: Jeep | null,
    onClose: () => void,
    onSelectJeep: (jeep: Jeep) => void,
    onSaveJeep: (jeep: Jeep) => void,
    onUnsaveJeep: (jeepId: string) => void,
    onViewRoute: (jeep: Jeep) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'saved'>('active');
    const isSidebarVisible = isOpen || !!selectedJeep;

    const isJeepSaved = (jeepId: string) => savedJeeps.some(sj => sj.jeep_id === jeepId);

    return (
        <>
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => { setIsOpen(true); setActiveTab('active'); }}
                    className="bg-white text-[#008282] p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008282] transition-all"
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
                <button
                    onClick={() => { setIsOpen(true); setActiveTab('saved'); }}
                    className="bg-white text-[#008282] p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008282] transition-all"
                    aria-label="View Saved Jeeps"
                >
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {savedJeeps.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                {savedJeeps.length}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            <div className={`absolute inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[1001] ${isSidebarVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#006868]">
                            {selectedJeep ? 'Jeep Details' : (activeTab === 'active' ? 'Active Jeeps' : 'Saved Jeeps')}
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

                    {!selectedJeep && (
                        <div className="flex mb-4 border-b border-gray-200">
                            <button
                                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'active' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'saved' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('saved')}
                            >
                                Saved
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {selectedJeep ? (
                            <div className="space-y-4">
                                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 text-center relative">
                                    <button
                                        onClick={() => isJeepSaved(selectedJeep.jeep_id) ? onUnsaveJeep(selectedJeep.jeep_id) : onSaveJeep(selectedJeep)}
                                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-teal-100 transition-colors"
                                        title={isJeepSaved(selectedJeep.jeep_id) ? "Unsave Jeep" : "Save Jeep"}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isJeepSaved(selectedJeep.jeep_id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                    </button>
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-3xl">
                                        🚐
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#006868]">{selectedJeep.plate_number}</h3>
                                    <p className="text-sm text-gray-500">{selectedJeep.routes?.route_name || 'Taguig Transport Loop'}</p>
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
                                    onClick={() => onViewRoute(selectedJeep)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl shadow-md hover:bg-teal-700 transition-all font-semibold"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                                        <line x1="8" y1="2" x2="8" y2="18"></line>
                                        <line x1="16" y1="6" x2="16" y2="22"></line>
                                    </svg>
                                    View Route
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(true);
                                        onClose();
                                    }}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-teal-600 underline"
                                >
                                    Back to list
                                </button>
                            </div>
                        ) : (
                            activeTab === 'active' ? (
                                jeeps.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-10">
                                        <p>No active jeeps found.</p>
                                    </div>
                                ) : (
                                    jeeps.map((jeep) => (
                                        <div
                                            key={jeep.jeep_id}
                                            onClick={() => onSelectJeep(jeep)}
                                            className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#008282]/30 transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{jeep.plate_number}</h3>
                                                    <p className="text-xs text-gray-500">{jeep.routes?.route_name || 'Taguig Loop'}</p>
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
                            ) : (
                                savedJeeps.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-10">
                                        <p>No saved jeeps.</p>
                                    </div>
                                ) : (
                                    savedJeeps.map((saved) => (
                                        <div
                                            key={saved.id}
                                            onClick={() => onSelectJeep(saved.jeeps)}
                                            className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 hover:border-teal-300 transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{saved.jeeps.plate_number}</h3>
                                                    <p className="text-xs text-gray-500">{saved.jeeps.routes?.route_name || 'Taguig Loop'}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUnsaveJeep(saved.jeeps.jeep_id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                    title="Remove"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="text-xs text-teal-600 font-medium">
                                                Saved Jeep
                                            </div>
                                        </div>
                                    ))
                                )
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





export default function PassengerMap() {
    const [jeeps, setJeeps] = useState<Jeep[]>([]);
    const [selectedJeep, setSelectedJeep] = useState<Jeep | null>(null);
    const [savedJeeps, setSavedJeeps] = useState<SavedJeep[]>([]);
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

    const fetchSavedJeeps = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        try {
            const response = await fetch(`${API_URL}/saved-jeeps?user_id=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setSavedJeeps(data);
            }
        } catch (error) {
            console.error("Error fetching saved jeeps:", error);
        }
    };

    useEffect(() => {
        fetchSavedJeeps();
    }, []);

    const handleSaveJeep = async (jeep: Jeep) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert("Please login to save jeeps");
            return;
        }
        const user = JSON.parse(userStr);
        try {
            const response = await fetch(`${API_URL}/saved-jeeps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, jeep_id: jeep.jeep_id })
            });
            if (response.ok) {
                fetchSavedJeeps();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to save jeep");
            }
        } catch (error) {
            console.error("Error saving jeep:", error);
        }
    };

    const handleUnsaveJeep = async (jeepId: string) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        try {
            const response = await fetch(`${API_URL}/saved-jeeps`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, jeep_id: jeepId })
            });
            if (response.ok) {
                fetchSavedJeeps();
            }
        } catch (error) {
            console.error("Error unsaving jeep:", error);
        }
    };

    const handleViewRoute = async (jeep: Jeep) => {
        console.log("handleViewRoute called with:", jeep);
        if (!jeep.routes) {
            console.warn("No route information in jeep object:", jeep);
            alert("No route information available for this jeep.");
            return;
        }
        const { origin_latitude, origin_longitude, destination_latitude, destination_longitude } = jeep.routes;
        console.log("Route coordinates:", { origin_latitude, origin_longitude, destination_latitude, destination_longitude });

        // Validate coordinates
        const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
        const isValidLng = (lng: number) => lng >= -180 && lng <= 180;

        if (!isValidLat(origin_latitude) || !isValidLng(origin_longitude) ||
            !isValidLat(destination_latitude) || !isValidLng(destination_longitude)) {
            console.warn("Invalid route coordinates:", { origin_latitude, origin_longitude, destination_latitude, destination_longitude });
            alert("Route coordinates are invalid. Please check the database.");
            return;
        }

        if (!origin_latitude || !destination_latitude) {
            // If coords are missing but we have a name, we can't map it easily without geocoding.
            console.warn("Incomplete route coordinates");
            return;
        }

        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${origin_longitude},${origin_latitude};${destination_longitude},${destination_latitude}?overview=full&geometries=geojson`;
            console.log("Fetching route from:", url);
            const response = await fetch(url);
            const data = await response.json();
            console.log("OSRM response:", data);

            if (data.routes && data.routes.length > 0) {
                // OSRM returns [lon, lat], Leaflet needs [lat, lon]
                const coords = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                console.log("Parsed route coordinates:", coords);
                setRouteCoordinates(coords);
            } else {
                console.warn("No routes found in OSRM response, using straight line.");
                // Fallback to straight line if OSRM fails to find route
                setRouteCoordinates([
                    [origin_latitude, origin_longitude],
                    [destination_latitude, destination_longitude]
                ]);
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            setRouteCoordinates([
                [origin_latitude, origin_longitude],
                [destination_latitude, destination_longitude]
            ]);
        }
    };

    useEffect(() => {
        const fetchJeeps = async () => {
            try {
                const response = await fetch(`${API_URL}/passenger/locations`);
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
                savedJeeps={savedJeeps}
                selectedJeep={selectedJeep}
                onClose={() => setSelectedJeep(null)}
                onSelectJeep={(jeep) => {
                    setSelectedJeep(jeep);
                    // optionally view route logic here immediately if desired
                }}
                onSaveJeep={handleSaveJeep}
                onUnsaveJeep={handleUnsaveJeep}
                onViewRoute={handleViewRoute}
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
                            click: () => {
                                setSelectedJeep(jeep);
                                // If we want to show route on click:
                                // handleViewRoute(jeep); 
                            },
                        }}
                    >
                    </Marker>
                ))}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{ color: '#008080', weight: 5, opacity: 0.7 }}
                    />
                )}
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
