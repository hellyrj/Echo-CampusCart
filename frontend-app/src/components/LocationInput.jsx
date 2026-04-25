import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import locationApi from '../api/location.api';

const LocationInput = ({ value, onChange, placeholder = "Search for a location..." }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Initialize with existing value
    useEffect(() => {
        if (value && value.placeName) {
            setQuery(value.placeName);
            setSelectedLocation(value);
        }
    }, [value]);

    // Fetch suggestions when query changes
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (query.length >= 2) {
                fetchSuggestions(query);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current && !inputRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery) => {
        try {
            setLoading(true);
            const result = await locationApi.getPlaceSuggestions(searchQuery, 'ET'); // Ethiopia country code
            
            if (result.success) {
                setSuggestions(result.data || []);
                setShowSuggestions(true);
            } else {
                console.error('Failed to fetch suggestions:', result.message);
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        
        // Clear selected location if user is typing
        if (selectedLocation && value !== selectedLocation.placeName) {
            setSelectedLocation(null);
            onChange(null); // Clear parent value
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.placeName);
        setSelectedLocation(suggestion);
        setShowSuggestions(false);
        
        // Create location details object
        const locationDetails = {
            placeName: suggestion.placeName,
            fullAddress: suggestion.fullAddress,
            landmark: suggestion.landmark || null,
            area: suggestion.area || null,
            city: suggestion.city || 'Unknown',
            state: suggestion.state || 'Unknown',
            postalCode: null,
            country: 'Nigeria',
            coordinates: suggestion.coordinates
        };
        
        onChange(locationDetails);
    };

    const handleClear = () => {
        setQuery('');
        setSelectedLocation(null);
        setShowSuggestions(false);
        onChange(null);
    };

    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const formatSuggestionText = (suggestion) => {
        const parts = [suggestion.placeName];
        if (suggestion.area && suggestion.area !== suggestion.placeName) {
            parts.push(suggestion.area);
        }
        if (suggestion.city && suggestion.city !== suggestion.placeName && suggestion.city !== suggestion.area) {
            parts.push(suggestion.city);
        }
        return parts.join(', ');
    };

    return (
        <div className="relative">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                        <MapPin className="h-4 w-4 text-gray-400" />
                    )}
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        selectedLocation ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                />
                
                {query && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.placeName}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {formatSuggestionText(suggestion)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected Location Indicator */}
            {selectedLocation && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center text-sm text-green-800">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">Location selected:</span>
                        <span className="ml-1">{selectedLocation.placeName}</span>
                    </div>
                    {selectedLocation.area && (
                        <div className="text-xs text-green-600 mt-1 ml-6">
                            {selectedLocation.area}, {selectedLocation.city}, {selectedLocation.state}
                        </div>
                    )}
                </div>
            )}

            {/* No Results Message */}
            {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No locations found. Try a different search term.
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationInput;
