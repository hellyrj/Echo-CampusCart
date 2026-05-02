import React, { useState } from 'react';
import LocationPicker from './LocationPicker';

const TestLocationPicker = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    console.log('Location selected in test:', location);
    setSelectedLocation(location);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Location Picker</h1>
      
      <div className="mb-6">
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          height="500px"
        />
      </div>
      
      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Selected Location:</h3>
          <p className="text-green-700">
            {selectedLocation.placeName && <><strong>Place:</strong> {selectedLocation.placeName}<br /></>}
            <strong>Latitude:</strong> {selectedLocation.lat}<br />
            <strong>Longitude:</strong> {selectedLocation.lng}
          </p>
        </div>
      )}
    </div>
  );
};

export default TestLocationPicker;
