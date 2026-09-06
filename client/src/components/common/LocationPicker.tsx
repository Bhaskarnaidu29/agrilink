import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { searchLocations, reverseGeocodeLocation, LocationResult } from '../../services/locationService';

interface LocationPickerProps {
  value?: {
    locationName?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  onChange: (location: LocationResult) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = 'Search village, town, city or PIN code',
  label = 'Location',
  className = '',
}) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [pendingConfirmationLocation, setPendingConfirmationLocation] = useState<LocationResult | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(!value?.locationName && !value?.city);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Sync initial value if provided
  useEffect(() => {
    if (value?.locationName || value?.city) {
      const display = value.locationName || value.city || 'Set Location';
      setSelectedLocation({
        id: `initial-${value.latitude}-${value.longitude}`,
        name: value.locationName || value.city || 'Set Location',
        displayName: value.state ? `${display}, ${value.state}` : display,
        city: value.city,
        state: value.state,
        latitude: value.latitude || 16.5062,
        longitude: value.longitude || 80.6480,
      });
      setIsEditing(false);
    } else {
      setSelectedLocation(null);
      setIsEditing(true);
    }
  }, [value?.locationName, value?.city, value?.latitude, value?.longitude]);

  // Handle outside click to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search trigger
  const handleQueryChange = (text: string) => {
    setQuery(text);
    setErrorMsg('');
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(text);
        setSuggestions(results);
      } catch (err) {
        console.error('Location search error:', err);
        setErrorMsg('Location search is temporarily unavailable. Try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };

  // GPS Current Location handler
  const handleUseCurrentLocation = () => {
    setErrorMsg('');
    if (!('geolocation' in navigator)) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const loc = await reverseGeocodeLocation(lat, lon, accuracy);
          setPendingConfirmationLocation(loc);
          setIsOpen(false);
        } catch (err) {
          setErrorMsg('Failed to identify your location. Please search manually.');
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location permission denied. Please search your village or town manually.');
        } else {
          setErrorMsg('Couldn\'t detect your location. Please search manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectSuggestion = (loc: LocationResult) => {
    setPendingConfirmationLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-bold uppercase text-gray-700">{label}</label>}

      {/* DISPLAY CONFIRMED LOCATION */}
      {!isEditing && selectedLocation ? (
        <div className="flex items-center justify-between p-3 bg-agri-50/70 border border-agri-200 rounded-xl text-sm shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <MapPin className="w-4 h-4 text-agri-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-gray-900 block truncate">📍 {selectedLocation.name}</span>
              <span className="text-xs text-gray-500 block truncate">{selectedLocation.displayName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setIsOpen(true);
            }}
            className="text-xs font-bold text-agri-700 hover:text-agri-800 underline shrink-0 px-2 py-1 bg-white rounded-lg border border-agri-200"
          >
            Change
          </button>
        </div>
      ) : pendingConfirmationLocation ? (
        /* LOCATION CONFIRMATION STEP CARD */
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 text-xs shadow-sm animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-extrabold text-emerald-950 text-sm block">📍 Location Detected</span>
              <span className="font-bold text-gray-900 text-xs block mt-0.5">{pendingConfirmationLocation.name}</span>
              <span className="text-gray-600 text-[11px] block">{pendingConfirmationLocation.displayName}</span>
              {pendingConfirmationLocation.accuracy && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  GPS Accuracy: ~{pendingConfirmationLocation.accuracy}m
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-1 border-t border-emerald-200">
            <button
              type="button"
              onClick={() => {
                setSelectedLocation(pendingConfirmationLocation);
                onChange(pendingConfirmationLocation);
                setPendingConfirmationLocation(null);
                setIsEditing(false);
              }}
              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Confirm Location
            </button>
            <button
              type="button"
              onClick={() => setPendingConfirmationLocation(null)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-50"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        /* SEARCH & GPS INPUT CONTROLS */
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500 focus:outline-none"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-3.5 text-agri-600 animate-spin" />
            ) : (
              query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                  }}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )
            )}
          </div>

          {/* GPS Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetectingGps}
            className="w-full py-2 px-3 bg-white hover:bg-agri-50 border border-agri-300 text-agri-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            {isDetectingGps ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-agri-600" />
                <span>Finding your location...</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-agri-600" />
                <span>Use My Current Location (GPS)</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-xs text-rose-600 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AUTOCOMPLETE DROPDOWN RESULTS */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl border border-gray-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-agri-600" />
                  <span>Searching locations...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left p-3 hover:bg-agri-50/70 transition flex items-start gap-2.5"
                  >
                    <MapPin className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">{item.name}</span>
                      <span className="text-xs text-gray-500 block">{item.displayName}</span>
                    </div>
                  </button>
                ))
              ) : query.trim() ? (
                <div className="p-4 text-center text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-700">No matching locations found.</p>
                  <p className="text-[11px]">Try searching by village name, town, mandal, or PIN code.</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
