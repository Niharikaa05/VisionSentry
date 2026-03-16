import { WeatherInfo } from '../types';

export async function fetchWeather(lat: number, lng: number): Promise<WeatherInfo> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility`
    );
    
    if (!response.ok) throw new Error('Weather data fetch failed');
    
    const data = await response.json();
    const current = data.current;
    
    // Map WMO weather codes to human readable conditions
    const weatherCodes: Record<number, string> = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      95: 'Thunderstorm',
    };

    return {
      temp: Math.round(current.temperature_2m),
      condition: weatherCodes[current.weather_code] || 'Clear',
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      visibility: `${Math.round(current.visibility / 1000)}km`
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return fallback data
    return {
      temp: 14,
      condition: 'Clear',
      humidity: 42,
      windSpeed: 12,
      visibility: '10km'
    };
  }
}
