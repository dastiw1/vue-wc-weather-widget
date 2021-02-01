type Nullable<T> = T | undefined | null;

type City = {
  coords: {
    lat: number;
    lon: number;
  };
  name: string;
  country: {
    code: string;
  };
};

type CityWeather = {
  feels_like: number;
  humidity: number;
  pressure: number;
  temp: number;
  temp_max: number;
  temp_min: number;
  text: string;
  icon: string;

  wind: {
    deg: number;
    speed: number;
  };
  visibility: number;
};
