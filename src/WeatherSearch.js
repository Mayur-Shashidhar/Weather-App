import React, { useState, useEffect } from 'react';

const WeatherSearch = ({ onSearch }) => {
  const [city, setCity] = useState('');

  useEffect(() => {
    setCity('');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="weather-search">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default WeatherSearch; 