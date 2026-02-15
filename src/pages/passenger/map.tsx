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
    driver_name?: string;
    fare?: number;
    speed?: number; // km/h
    last_update?: number; // timestamp
}

interface SavedJeep {
    id: string;
    jeep_id: string;
    jeeps: Jeep;
}

function getBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
    const startLatRad = startLat * (Math.PI / 180);
    const startLngRad = startLng * (Math.PI / 180);
    const destLatRad = destLat * (Math.PI / 180);
    const destLngRad = destLng * (Math.PI / 180);

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
        Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

    const brng = Math.atan2(y, x);
    const brngDeg = (brng * 180) / Math.PI;
    return (brngDeg + 360) % 360;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

const ICON_ROTATION_OFFSET = -45;

function getJeepIcon(current: number, max: number) {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return '/red-jeep-marker.png';
    if (percentage > 70) return '/yellow-jeep-marker.png';
    return '/jeep-marker.png';
}

function JeepMarker({ jeep, onClick }: { jeep: Jeep, onClick: () => void }) {
    const [prevPos, setPrevPos] = useState<[number, number] | null>(null);
    const [bearing, setBearing] = useState(0);

    useEffect(() => {
        let newBearing = bearing;
        let bearingUpdated = false;
        if (prevPos) {
            const dist = Math.sqrt(
                Math.pow(jeep.current_latitude - prevPos[0], 2) +
                Math.pow(jeep.current_longitude - prevPos[1], 2)
            );

            if (dist > 0.000005) {
                newBearing = getBearing(prevPos[0], prevPos[1], jeep.current_latitude, jeep.current_longitude);
                bearingUpdated = true;
            }
        }

        if (bearingUpdated) {
            setBearing(newBearing);
        }

        setPrevPos([jeep.current_latitude, jeep.current_longitude]);

    }, [jeep.current_latitude, jeep.current_longitude]);

    const finalRotation = (bearing + ICON_ROTATION_OFFSET) % 360;
    const iconUrl = getJeepIcon(jeep.current_passenger_count, jeep.max_capacity);

    const icon = L.divIcon({
        className: 'jeep-marker-container',
        html: `<div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
                 <img src="${iconUrl}" style="transform: rotate(${finalRotation}deg); width: 45px; height: 45px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: transform 0.3s ease-in-out;" />
               </div>`,
        iconSize: [45, 45],
        iconAnchor: [22.5, 22.5],
        popupAnchor: [0, -22.5]
    });

    return (
        <Marker
            position={[jeep.current_latitude, jeep.current_longitude]}
            icon={icon}
            eventHandlers={{ click: onClick }}
        />
    );
}

function ActiveJeepList({
    jeeps,
    savedJeeps,
    selectedJeep,
    isOpen,
    setIsOpen,
    onClose,
    onSelectJeep,
    onSaveJeep,
    onUnsaveJeep,
    userPosition
}: {
    jeeps: Jeep[],
    savedJeeps: SavedJeep[],
    selectedJeep: Jeep | null,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    onClose: () => void,
    onSelectJeep: (jeep: Jeep) => void,
    onSaveJeep: (jeep: Jeep) => void,
    onUnsaveJeep: (jeepId: string) => void,
    userPosition: [number, number] | null
}) {
    const [activeTab, setActiveTab] = useState<'active' | 'saved'>('active');
    const isSidebarVisible = isOpen || !!selectedJeep;

    const isJeepSaved = (jeepId: string) => savedJeeps.some(sj => sj.jeep_id === jeepId);
    const handleOverlayClick = () => {
        setIsOpen(false);
        onClose();
    };

    return (
        <>
            {!isSidebarVisible && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="absolute top-4 right-4 z-[1000] bg-white text-[#008282] p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-[#008282] transition-all flex items-center gap-2 group"
                    aria-label="Open Menu"
                >
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                        {(jeeps.length > 0 || savedJeeps.length > 0) && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                {jeeps.length + savedJeeps.length}
                            </span>
                        )}
                    </div>
                    <span className="font-semibold text-sm hidden group-hover:block transition-all duration-300">Menu</span>
                </button>
            )}
            {isSidebarVisible && (
                <div
                    className="fixed inset-0 bg-black/20 z-[1000] backdrop-blur-sm sm:hidden transition-opacity"
                    onClick={handleOverlayClick}
                />
            )}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out z-[1001] flex flex-col ${isSidebarVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                    <h2 className="text-xl font-bold text-[#006868] flex items-center gap-2">
                        {selectedJeep ? (
                            <div className="flex items-center gap-2">
                                <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded-full"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
                                <span>Jeep Details</span>
                            </div>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9 7" />
                                </svg>
                                <span>Transport Map</span>
                            </>
                        )}
                    </h2>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onClose();
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {!selectedJeep && (
                    <div className="flex p-2 gap-2 bg-gray-50/50">
                        <button
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'active'
                                ? 'bg-white text-teal-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active Jeeps
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'active' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>
                                {jeeps.length}
                            </span>
                        </button>
                        <button
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'saved'
                                ? 'bg-white text-teal-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            Saved
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'saved' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>
                                {savedJeeps.length}
                            </span>
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {selectedJeep ? (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Jeep Detail Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                                <button
                                    onClick={() => isJeepSaved(selectedJeep.jeep_id) ? onUnsaveJeep(selectedJeep.jeep_id) : onSaveJeep(selectedJeep)}
                                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isJeepSaved(selectedJeep.jeep_id) ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    title={isJeepSaved(selectedJeep.jeep_id) ? "Unsave Jeep" : "Save Jeep"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isJeepSaved(selectedJeep.jeep_id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </button>

                                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <img src={getJeepIcon(selectedJeep.current_passenger_count, selectedJeep.max_capacity)} alt="Jeep" className="w-16 h-16 object-contain" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{selectedJeep.plate_number}</h3>
                                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500 bg-gray-100/50 py-1 px-3 rounded-full mx-auto w-fit">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {selectedJeep.routes?.route_name || 'Taguig Transport Loop'}
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-left bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Driver</p>
                                        <p className="font-semibold text-gray-700 truncate">{selectedJeep.driver_name || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Fare</p>
                                        <p className="font-semibold text-gray-700">₱{selectedJeep.fare || 12}</p>
                                    </div>
                                    {userPosition && (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Distance</p>
                                                <p className="font-semibold text-gray-700">
                                                    {getDistance(
                                                        userPosition[0],
                                                        userPosition[1],
                                                        selectedJeep.current_latitude,
                                                        selectedJeep.current_longitude
                                                    ).toFixed(1)} km
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Est. Time</p>
                                                <p className="font-semibold text-gray-700">
                                                    {(() => {
                                                        const speed = selectedJeep.speed || 0;
                                                        const distance = getDistance(
                                                            userPosition[0],
                                                            userPosition[1],
                                                            selectedJeep.current_latitude,
                                                            selectedJeep.current_longitude
                                                        );

                                                        if (speed < 1) return "Stopped"; // If speed < 1 km/h, consider it stopped

                                                        const timeHours = distance / speed;
                                                        const timeMins = Math.ceil(timeHours * 60);

                                                        if (timeMins > 60) {
                                                            const h = Math.floor(timeMins / 60);
                                                            const m = timeMins % 60;
                                                            return `${h} hr ${m} min`;
                                                        }
                                                        return `${timeMins} mins`;
                                                    })()}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Passengers</p>
                                    <div className="flex items-end gap-1">
                                        <span className={`text-2xl font-bold ${selectedJeep.current_passenger_count >= selectedJeep.max_capacity ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {selectedJeep.current_passenger_count}
                                        </span>
                                        <span className="text-gray-400 text-sm mb-1">/ {selectedJeep.max_capacity}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${selectedJeep.current_passenger_count >= selectedJeep.max_capacity ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, (selectedJeep.current_passenger_count / selectedJeep.max_capacity) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <p className="text-lg font-bold text-gray-700">Active</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Last update: Just now</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeTab === 'active' ? (
                                jeeps.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        <p className="text-gray-500 font-medium">No active jeeps nearby</p>
                                        <p className="text-xs text-gray-400 mt-1">Please check back later</p>
                                    </div>
                                ) : (
                                    jeeps.map((jeep) => (
                                        <div
                                            key={jeep.jeep_id}
                                            onClick={() => onSelectJeep(jeep)}
                                            className="group bg-white p-4 rounded-xl border border-gray-100 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-2 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                                                        <img src={getJeepIcon(jeep.current_passenger_count, jeep.max_capacity)} alt="Jeep" className="w-8 h-8 object-contain" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">{jeep.plate_number}</h3>
                                                        <p className="text-xs text-gray-500">{jeep.routes?.route_name || 'Taguig Loop'}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${jeep.current_passenger_count >= jeep.max_capacity
                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {jeep.current_passenger_count}/{jeep.max_capacity}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                savedJeeps.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                        </div>
                                        <p className="text-gray-500 font-medium">No saved jeeps yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Star a jeep to see it here</p>
                                    </div>
                                ) : (
                                    savedJeeps.map((saved) => (
                                        <div
                                            key={saved.id}
                                            onClick={() => onSelectJeep(saved.jeeps)}
                                            className="group bg-white p-4 rounded-xl border border-gray-100 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">⭐</div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">{saved.jeeps.plate_number}</h3>
                                                        <p className="text-xs text-gray-500">{saved.jeeps.routes?.route_name || 'Taguig Loop'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUnsaveJeep(saved.jeeps.jeep_id);
                                                    }}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Remove from saved"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function LocationMarker({ onLocationUpdate }: { onLocationUpdate: (pos: [number, number]) => void }) {
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
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
            onLocationUpdate(newPos);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

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
            map.flyTo(e.latlng, 18); // Zoom level 18
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

function JeepLegend() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute bottom-24 right-4 z-[1000] flex flex-col items-end gap-2">
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                    <img src="/jeep-marker.png" className="w-8 h-8 object-contain" />
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">0% - 70% Passenger</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                    <img src="/yellow-jeep-marker.png" className="w-8 h-8 object-contain" />
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">71% - 99% Passenger</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                    <img src="/red-jeep-marker.png" className="w-8 h-8 object-contain" />
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Full (100%)</span>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white text-[#008282] p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008282] transition-all flex flex-col items-center gap-1 h-14 justify-center w-14"
                title="Legend"
            >
                <div className="flex -space-x-2">
                    <img src="/jeep-marker.png" className="w-5 h-5 object-contain" />
                    <img src="/yellow-jeep-marker.png" className="w-5 h-5 object-contain" />
                </div>
                <img src="/red-jeep-marker.png" className="w-5 h-5 object-contain -mt-1" />
            </button>
        </div>
    );
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
    useMapEvents({
        click: () => {
            onMapClick();
        },
    });
    return null;
}

export default function PassengerMap() {
    const [jeeps, setJeeps] = useState<Jeep[]>([]);
    const [selectedJeep, setSelectedJeep] = useState<Jeep | null>(null);
    const [savedJeeps, setSavedJeeps] = useState<SavedJeep[]>([]);
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

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

    const showRoute = async (jeep: Jeep) => {
        console.log("showRoute called with:", jeep);
        if (!jeep.routes) {
            console.warn("No route information in jeep object:", jeep);
            return;
        }
        const { origin_latitude, origin_longitude, destination_latitude, destination_longitude } = jeep.routes;

        // Validate coordinates
        const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
        const isValidLng = (lng: number) => lng >= -180 && lng <= 180;

        if (!isValidLat(origin_latitude) || !isValidLng(origin_longitude) ||
            !isValidLat(destination_latitude) || !isValidLng(destination_longitude)) {
            console.warn("Invalid route coordinates:", { origin_latitude, origin_longitude, destination_latitude, destination_longitude });
            return;
        }

        if (!origin_latitude || !destination_latitude) {
            console.warn("Incomplete route coordinates");
            return;
        }

        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${origin_longitude},${origin_latitude};${destination_longitude},${destination_latitude}?overview=full&geometries=geojson`;
            console.log("Fetching route from:", url);
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                setRouteCoordinates(coords);
            } else {
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
                const data: Jeep[] = await response.json();
                const now = Date.now();

                setJeeps(prevJeeps => {
                    return data.map(newJeep => {
                        const prevJeep = prevJeeps.find(p => p.jeep_id === newJeep.jeep_id);
                        let speed = 0;

                        if (prevJeep && prevJeep.last_update) {
                            const dist = getDistance(
                                prevJeep.current_latitude,
                                prevJeep.current_longitude,
                                newJeep.current_latitude,
                                newJeep.current_longitude
                            ); // distance in km

                            const timeDiff = (now - prevJeep.last_update) / 1000 / 3600; // time in hours

                            if (timeDiff > 0 && dist > 0.00001) { // Ignore tiny movements (gps jitter)
                                speed = dist / timeDiff;
                            } else if (dist <= 0.00001) {
                                speed = 0;
                            } else {
                                speed = prevJeep.speed || 0; // Maintain previous speed if timeDiff is 0 (shouldn't happen often)
                            }
                        }

                        // Smoothing: simple moving average or just take current (User asked for "from one update to another")
                        // Let's stick to raw calculated speed but maybe cap it or damp it if needed.
                        // For better UX, if speed is 0, we might want to default to a 'walking' or 'average' speed for ETA if it was moving recently,
                        // but strictly "calculated speed" means 0 -> Infinity ETA.
                        // Let's assume if moving < 1 km/h, it is stopped.

                        return {
                            ...newJeep,
                            speed: speed,
                            last_update: now
                        };
                    });
                });
            } catch (error) {
                console.error("Error fetching jeeps:", error);
            }
        };

        fetchJeeps();
        const interval = setInterval(fetchJeeps, 1000);
        return () => clearInterval(interval);
    }, []);

    const defaultCenter: [number, number] = [14.528973669749776, 121.06992756017972];
    const handleMapClick = () => {
        setRouteCoordinates([]);
        setSelectedJeep(null);
        setIsSidebarOpen(false);
    };

    const onSelectJeep = (jeep: Jeep) => {
        setSelectedJeep(jeep);
        showRoute(jeep);
    };

    return (
        <div className="h-screen w-full relative flex flex-col">
            <ActiveJeepList
                jeeps={jeeps}
                savedJeeps={savedJeeps}
                selectedJeep={selectedJeep}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onClose={() => setSelectedJeep(null)}
                onSelectJeep={onSelectJeep}
                onSaveJeep={handleSaveJeep}
                onUnsaveJeep={handleUnsaveJeep}
                userPosition={userPosition}
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

                <LocationMarker onLocationUpdate={setUserPosition} />
                <JeepLegend />
                <LocateButton />
                <MapClickHandler onMapClick={handleMapClick} />

                {jeeps.map((jeep) => (
                    <JeepMarker
                        key={jeep.jeep_id}
                        jeep={jeep}
                        onClick={() => onSelectJeep(jeep)}
                    />
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
                .jeep-marker-container {
                    background: none;
                    border: none;
                }
            `}</style>
        </div>
    );
}
