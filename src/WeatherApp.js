import React, { useState, useEffect, useRef } from 'react';
import WeatherSearch from './WeatherSearch';
import WeatherDisplay from './WeatherDisplay';

const getWeatherBg = (main, theme) => {
  if (theme === 'dark') {
    switch (main) {
      case 'Clear':
        return 'linear-gradient(135deg, #232526 0%, #414345 100%)';
      case 'Rain':
      case 'Drizzle':
        return 'linear-gradient(135deg, #232526 0%, #4f8ef7 100%)';
      case 'Clouds':
        return 'linear-gradient(135deg, #434343 0%, #262626 100%)';
      case 'Snow':
        return 'linear-gradient(135deg, #232526 0%, #e0eafc 100%)';
      case 'Thunderstorm':
        return 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)';
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return 'linear-gradient(135deg, #757f9a 0%, #232526 100%)';
      default:
        return 'linear-gradient(135deg, #232526 0%, #4f8ef7 100%)';
    }
  } else {
    switch (main) {
      case 'Clear':
        return 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)';
      case 'Rain':
      case 'Drizzle':
        return 'linear-gradient(135deg, #4f8ef7 0%, #1e3c72 100%)';
      case 'Clouds':
        return 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
      case 'Snow':
        return 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
      case 'Thunderstorm':
        return 'linear-gradient(135deg, #232526 0%, #414345 100%)';
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)';
      default:
        return 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
    }
  }
};

const FAVORITES_KEY = 'weather_favorites';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [theme, setTheme] = useState('light');
  const [favorites, setFavorites] = useState([]);
  const [showFavModal, setShowFavModal] = useState(false);
  const favModalRef = useRef(null);
  const [searchKey, setSearchKey] = useState(0); // for resetting search bar

  // Load favorites from localStorage
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    setFavorites(favs);
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Close modal on outside click
  useEffect(() => {
    if (!showFavModal) return;
    function handleClick(e) {
      if (favModalRef.current && !favModalRef.current.contains(e.target)) {
        setShowFavModal(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFavModal]);

  const fetchWeather = async (city) => {
    setLoading(true);
    setShowLoader(true);
    setError('');
    setWeather(null);
    setForecast([]);
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
      ]);
      if (!weatherRes.ok) throw new Error('City not found');
      if (!forecastRes.ok) throw new Error('Forecast not found');
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      setTimeout(() => {
        setWeather(weatherData);
        setForecast(forecastData.list);
        setLoading(false);
        setShowLoader(false);
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setShowLoader(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setShowLoader(true);
    setError('');
    setWeather(null);
    setForecast([]);
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
      ]);
      if (!weatherRes.ok) throw new Error('Location not found');
      if (!forecastRes.ok) throw new Error('Forecast not found');
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      setTimeout(() => {
        setWeather(weatherData);
        setForecast(forecastData.list);
        setLoading(false);
        setShowLoader(false);
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setShowLoader(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setError('');
    setShowLoader(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        setSearchKey((k) => k + 1); // trigger search bar clear
      },
      (err) => {
        setShowLoader(false);
        setError('Unable to retrieve your location.');
      }
    );
  };

  // Favorite logic
  const isFavorite = weather && favorites.some(fav => fav.toLowerCase() === weather.name.toLowerCase());
  const toggleFavorite = () => {
    if (!weather) return;
    setFavorites((prev) => {
      const city = weather.name;
      if (prev.some(fav => fav.toLowerCase() === city.toLowerCase())) {
        return prev.filter(fav => fav.toLowerCase() !== city.toLowerCase());
      } else {
        return [...prev, city];
      }
    });
  };
  const removeFavorite = (city) => {
    setFavorites((prev) => prev.filter(fav => fav.toLowerCase() !== city.toLowerCase()));
  };

  // Helper to select a favorite city and clear search bar
  const handleSelectFavorite = (city) => {
    fetchWeather(city);
    setSearchKey((k) => k + 1);
    setShowFavModal(false);
  };

  // Determine background based on weather and theme
  const main = weather ? weather.weather[0].main : null;
  const background = getWeatherBg(main, theme);

  // Set background on body
  useEffect(() => {
    document.body.style.background = background;
    document.body.style.transition = 'background 0.7s';
  }, [background]);

  // Toggle theme
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <>
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, display: 'flex', gap: 12 }}>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          style={{
            background: theme === 'light' ? '#232526' : '#ffe259',
            color: theme === 'light' ? '#fff' : '#232526',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.3s, color 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <button
          onClick={() => setShowFavModal(true)}
          style={{
            background: '#fff',
            color: '#4f8ef7',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s',
          }}
          aria-label="Show favorite cities"
          type="button"
        >
          <span style={{ fontSize: '1.3rem', color: '#ffd700' }}>★</span> Favorites
        </button>
      </div>
      {showFavModal && (
        <div className="fav-modal-backdrop">
          <div
            ref={favModalRef}
            className="fav-modal-card"
          >
            <div className="fav-modal-header">
              <span className="fav-modal-title">Favorite Cities</span>
              <button
                onClick={() => setShowFavModal(false)}
                className="fav-modal-close"
                aria-label="Close favorites"
              >
                ×
              </button>
            </div>
            {favorites.length === 0 ? (
              <div className="fav-modal-empty">
                No favorite cities yet.
              </div>
            ) : (
              favorites.map((city) => (
                <div key={city} className="fav-modal-city-row">
                  <button
                    onClick={() => handleSelectFavorite(city)}
                    className="fav-modal-city-btn"
                  >
                    {city}
                  </button>
                  <button
                    onClick={() => removeFavorite(city)}
                    className="fav-modal-remove-btn"
                    aria-label={`Remove ${city} from favorites`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <div className={`weather-app ${theme}`}>
        <h1 style={{ margin: 0 }}>Weather App</h1>
        <WeatherSearch onSearch={fetchWeather} key={searchKey} />
        <button
          onClick={handleUseMyLocation}
          style={{
            margin: '0.5rem 0 1.2rem 0',
            background: '#4f8ef7',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'background 0.2s',
          }}
        >
          📍 Use My Location
        </button>
        <WeatherDisplay
          weather={weather}
          forecast={forecast}
          loading={loading}
          error={error}
          showLoader={showLoader}
          theme={theme}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </>
  );
};

export default WeatherApp; 