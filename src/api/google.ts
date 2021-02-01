import { request } from '../tools/api';

export interface PlusCode {
  compound_code: string;
  global_code: string;
}

export interface GetAddressResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  bounds: Bounds;
  location: Location;
  location_type: string;
  viewport: Bounds;
}

export interface Bounds {
  northeast: Location;
  southwest: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

interface IGoogleGeoCoderResponse {
  plus_code: PlusCode;
  results: GetAddressResult[];
  status: string;
}

export const getAddressFromCoords = (lat: number, lon: number) => {
  return request<IGoogleGeoCoderResponse>({
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    method: 'GET',
    params: {
      latlng: `${lat},${lon}`,
      key: process.env.VUE_APP_GOOGLE_GEOCODER_API_KEY,
      result_type: 'locality',
      language: 'en',
    },
  }).then((data) => data.results[0]);
};

export interface FindCityResult {
  name: string;
  formatted_address: string;
  geometry: Geometry;
  types: string[];
}

interface IFindCityByNameResponse {
  candidates: FindCityResult[];
  status: string;
}
