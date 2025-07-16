import React from 'react';

const getWeatherStyle = (main) => {
  switch (main) {
    case 'Clear':
      return {
        background: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)',
        emoji: '☀️',
        effect: 'sun',
      };
    case 'Rain':
    case 'Drizzle':
      return {
        background: 'linear-gradient(135deg, #4f8ef7 0%, #1e3c72 100%)',
        emoji: '🌧️',
        effect: 'rain',
      };
    case 'Clouds':
      return {
        background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
        emoji: '☁️',
        effect: null,
      };
    case 'Snow':
      return {
        background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        emoji: '❄️',
        effect: 'snow',
      };
    case 'Thunderstorm':
      return {
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        emoji: '⛈️',
        effect: 'rain',
      };
    case 'Mist':
    case 'Fog':
    case 'Haze':
      return {
        background: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
        emoji: '🌫️',
        effect: null,
      };
    default:
      return {
        background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        emoji: '🌈',
        effect: null,
      };
  }
};

const SunEffect = () => <div className="weather-effect-sun" />;

const RainEffect = () => (
  <div className="weather-effect-rain">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        className="drop"
        key={i}
        style={{ left: `${Math.random() * 95}%`, animationDelay: `${Math.random()}s` }}
      />
    ))}
  </div>
);

const SnowEffect = () => (
  <div className="weather-effect-snow">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        className="flake"
        key={i}
        style={{ left: `${Math.random() * 95}%`, animationDelay: `${Math.random() * 2}s` }}
      />
    ))}
  </div>
);

const Loader = () => (
  <div className="weather-loader-container">
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
    <div className="weather-loader-dot"></div>
  </div>
);

function getDayName(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function getNoonForecasts(forecast) {
  // Get one forecast per day at 12:00:00
  const map = {};
  forecast.forEach((item) => {
    if (item.dt_txt.includes('12:00:00')) {
      const day = item.dt_txt.split(' ')[0];
      map[day] = item;
    }
  });
  return Object.values(map).slice(0, 5);
}

const WeatherDisplay = ({ weather, forecast = [], loading, error, showLoader, theme, isFavorite, onToggleFavorite }) => {
  if (showLoader) return <Loader />;
  if (loading) return null;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!weather) return null;

  const main = weather.weather[0].main;
  const description = weather.weather[0].description;
  const { background, emoji, effect } = getWeatherStyle(main);
  const cardStyle = {
    background,
    borderRadius: '16px',
    padding: '1.5rem 1rem',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.15)',
    color: theme === 'dark' ? '#ffe259' : '#222',
    animation: 'fadeIn 1s',
    transition: 'background 0.7s, color 0.5s',
    position: 'relative',
    overflow: 'hidden',
  };

  const noonForecasts = getNoonForecasts(forecast);
  // Removed: const uv = getUvLevel(uvIndex);

  return (
    <div className="weather-display" style={cardStyle}>
      {effect === 'sun' && <SunEffect />}
      {effect === 'rain' && <RainEffect />}
      {effect === 'snow' && <SnowEffect />}
      <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {weather.name}, {weather.sys.country}
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: isFavorite ? '#ffd700' : '#bbb',
            marginLeft: 6,
            marginTop: -2,
            transition: 'color 0.2s',
            zIndex: 4,
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </h2>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.2rem', position: 'relative', zIndex: 3 }}>{emoji}</div>
      <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem', textTransform: 'capitalize', position: 'relative', zIndex: 3 }}>
        {description}
      </p>
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={description}
        style={{ width: 80, height: 80, margin: '0.5rem 0', position: 'relative', zIndex: 3 }}
      />
      <p style={{ fontSize: '1.1rem', margin: '0.3rem 0', position: 'relative', zIndex: 3 }}>
        Temperature: {weather.main.temp}°C
      </p>
      <p style={{ fontSize: '1.1rem', margin: '0.3rem 0', position: 'relative', zIndex: 3 }}>
        Humidity: {weather.main.humidity}%
      </p>
      <p style={{ fontSize: '1.1rem', margin: '0.3rem 0', position: 'relative', zIndex: 3 }}>
        Wind: {weather.wind.speed} m/s
      </p>
      {/* Removed: UV Index badge and tip */}
      {/* 5-day forecast section */}
      {noonForecasts.length > 0 && (
        <div style={{ marginTop: '2rem', position: 'relative', zIndex: 3 }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 600, fontSize: '1.1rem' }}>5-Day Forecast</h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {noonForecasts.map((item) => (
              <div key={item.dt} className="forecast-card" style={{ color: theme === 'dark' ? '#ffe259' : '#222' }}>
                <div style={{ fontWeight: 600 }}>{getDayName(item.dt_txt)}</div>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].description}
                  style={{ width: 40, height: 40 }}
                />
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{Math.round(item.main.temp)}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay; 