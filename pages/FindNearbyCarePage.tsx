import React, { useState } from 'react';
import { MapPinIcon } from '../components/Icons';

const FindNearbyCarePage: React.FC = () => {
    const [searchType, setSearchType] = useState('hospital');
    const [manualAddress, setManualAddress] = useState('');
    const [isLoadingGps, setIsLoadingGps] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLoadingGps(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLoadingGps(false);
                // Using "near me" is simpler and often more effective as Google interprets it based on user's location signals.
                const query = encodeURIComponent(`${searchType} near me`);
                const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            },
            (error) => {
                setIsLoadingGps(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setGpsError('Location access was denied. Please enable it in your browser settings or search for a location manually.');
                } else {
                    setGpsError('Could not get your location. Please try again or search manually.');
                }
            }
        );
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualAddress.trim()) return;

        const query = encodeURIComponent(`${searchType} near ${manualAddress}`);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Nearby Care</h1>
            <p className="text-lg text-gray-600 mb-8">Search for hospitals, clinics, and pharmacies on Google Maps.</p>

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Search Options</h2>

                {/* Search Type Buttons */}
                <div className="flex justify-center gap-2 mb-6">
                    <button onClick={() => setSearchType('hospital')} className={`px-5 py-2 text-sm rounded-full font-semibold ${searchType === 'hospital' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Hospitals</button>
                    <button onClick={() => setSearchType('clinic')} className={`px-5 py-2 text-sm rounded-full font-semibold ${searchType === 'clinic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Clinics</button>
                    <button onClick={() => setSearchType('pharmacy')} className={`px-5 py-2 text-sm rounded-full font-semibold ${searchType === 'pharmacy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Pharmacies</button>
                </div>

                {/* Use My Location */}
                <div className="text-center">
                    <button
                        onClick={handleUseMyLocation}
                        disabled={isLoadingGps}
                        className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-3 rounded-md text-base hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        <MapPinIcon className="w-5 h-5" />
                        {isLoadingGps ? 'Getting Location...' : `Find ${searchType}s Near Me`}
                    </button>
                    {gpsError && <p className="text-red-600 text-sm mt-2">{gpsError}</p>}
                </div>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 font-semibold">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Manual Search */}
                <form onSubmit={handleManualSearch}>
                    <label htmlFor="manual-address" className="font-bold text-gray-700 text-center block mb-2">Search by Address</label>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                        <input
                            id="manual-address"
                            type="text"
                            value={manualAddress}
                            onChange={e => setManualAddress(e.target.value)}
                            placeholder="Enter a City, State, or Address"
                            className="w-full rounded-md border-gray-300 shadow-sm p-3 text-base"
                        />
                        <button
                            type="submit"
                            className="bg-gray-700 text-white font-semibold px-6 py-3 rounded-md text-base hover:bg-gray-800 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FindNearbyCarePage;
