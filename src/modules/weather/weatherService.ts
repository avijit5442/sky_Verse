export type WeatherSummary = {
  condition: 'Clear' | 'Cloudy' | 'Windy' | 'Rain'
  visibility: string
  temperature: string
  recommendation: string
  source: string
  updatedAt: string
}

type WeatherApiResponse = {
  current_temperature?: number
  windspeed?: number
  weather_code?: number
  precipitation?: number
  cloud_cover?: number
}

export function getWeatherConditionLabel(apiData: Pick<WeatherApiResponse, 'weather_code' | 'windspeed' | 'precipitation' | 'cloud_cover'>): 'Clear' | 'Cloudy' | 'Windy' | 'Rain' {
  const precipitation = apiData.precipitation ?? 0
  const cloudCover = apiData.cloud_cover ?? 0
  const weatherCode = apiData.weather_code ?? 0
  const windspeed = apiData.windspeed ?? 0

  if (precipitation > 0.2) {
    return 'Rain'
  }

  if (weatherCode === 0) {
    return 'Clear'
  }

  if (cloudCover > 70 || weatherCode >= 50) {
    return 'Cloudy'
  }

  if (windspeed > 20) {
    return 'Windy'
  }

  return 'Cloudy'
}

async function fetchWeatherData(location?: { latitude: number; longitude: number }): Promise<WeatherApiResponse | null> {
  try {
    const latitude = location?.latitude ?? 20.5937
    const longitude = location?.longitude ?? 78.9629
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code,precipitation,cloud_cover&timezone=auto`)
    if (!response.ok) return null

    const data = await response.json()
    const currentTemperature = data?.current?.temperature_2m
    const windSpeed = data?.current?.wind_speed_10m
    const weatherCode = data?.current?.weather_code
    const precipitation = data?.current?.precipitation
    const cloudCover = data?.current?.cloud_cover

    if (typeof currentTemperature !== 'number' || typeof windSpeed !== 'number' || typeof weatherCode !== 'number') {
      return null
    }

    return {
      current_temperature: currentTemperature,
      windspeed: windSpeed,
      weather_code: weatherCode,
      precipitation: typeof precipitation === 'number' ? precipitation : 0,
      cloud_cover: typeof cloudCover === 'number' ? cloudCover : 0,
    }
  } catch {
    return null
  }
}

function createFallbackSummary(): WeatherSummary {
  return {
    condition: 'Cloudy',
    visibility: 'Fair',
    temperature: '18°C',
    recommendation: 'Cloud cover may reduce visibility; plan for a shorter session.',
    source: 'offline fallback',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

export async function getWeatherSummary(location?: { latitude: number; longitude: number }): Promise<WeatherSummary> {
  const apiData = await fetchWeatherData(location)

  if (!apiData) {
    return createFallbackSummary()
  }

  const condition = getWeatherConditionLabel(apiData)
  const visibility = condition === 'Clear' ? 'Excellent' : condition === 'Rain' ? 'Fair' : condition === 'Windy' ? 'Good' : 'Good'
  const temperatureValue = typeof apiData.current_temperature === 'number' ? Math.round(apiData.current_temperature) : 18
  const temperature = `${temperatureValue}°C`

  return {
    condition,
    visibility,
    temperature,
    recommendation: condition === 'Clear'
      ? 'Perfect conditions for a long phone AR session and a clear shared sky scene.'
      : condition === 'Windy'
        ? 'High winds may affect stability; use a tripod and keep the experience guided.'
        : condition === 'Rain'
          ? 'Precipitation is present; expect reduced visibility and a shorter observing window.'
          : 'Cloud cover is limiting clarity; shift toward a guided or ceiling projection experience.',
    source: 'Open-Meteo live data',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}
