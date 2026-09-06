import axios from 'axios';

export interface LocationResult {
  id: string;
  name: string;        // e.g. "Gollapudi"
  displayName: string; // e.g. "Gollapudi, Vijayawada, NTR District, Andhra Pradesh"
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// In-memory cache for recent search queries to minimize API calls
const searchCache = new Map<string, LocationResult[]>();

/**
 * Searches for real places using dynamic geocoding API.
 * Supports villages, localities, towns, mandals, cities, and Indian PIN codes.
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 1) return [];

  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery)!;
  }

  try {
    // Primary Provider: Photon Komoot OpenStreetMap Geocoder (extremely fast autocomplete typeahead)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`;
    const response = await axios.get(url, { timeout: 4000 });

    if (response.data && Array.isArray(response.data.features) && response.data.features.length > 0) {
      const results: LocationResult[] = response.data.features.map((feature: any, idx: number) => {
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates || [80.6480, 16.5062];

        const lon = coords[0];
        const lat = coords[1];

        const primaryName = props.name || props.street || props.district || props.city || props.state || query;
        const locality = props.district || props.suburb || props.locality;
        const city = props.city || props.town || props.county;
        const state = props.state;
        const country = props.country;
        const postalCode = props.postcode;

        // Build human readable hierarchy label: Name, City/District, State
        const parts: string[] = [primaryName];
        if (city && city !== primaryName) parts.push(city);
        if (state && state !== primaryName && state !== city) parts.push(state);

        const displayName = parts.join(', ');

        return {
          id: `loc-${idx}-${lat}-${lon}`,
          name: primaryName,
          displayName,
          locality,
          city,
          district: props.county || props.district,
          state,
          country,
          postalCode,
          latitude: lat,
          longitude: lon,
        };
      });

      searchCache.set(cleanQuery, results);
      return results;
    }
  } catch (err) {
    console.warn('Photon geocoding fallback to Nominatim:', err);
  }

  // Fallback Provider: OpenStreetMap Nominatim API
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=in`;
    const nomRes = await axios.get(nomUrl, { timeout: 4000 });

    if (nomRes.data && Array.isArray(nomRes.data)) {
      const results: LocationResult[] = nomRes.data.map((item: any, idx: number) => {
        const addr = item.address || {};
        const primaryName = addr.village || addr.suburb || addr.town || addr.neighbourhood || addr.city || item.display_name.split(',')[0];
        const city = addr.city || addr.town || addr.municipality || addr.county;
        const state = addr.state;
        const parts: string[] = [primaryName];
        if (city && city !== primaryName) parts.push(city);
        if (state && state !== primaryName && state !== city) parts.push(state);

        return {
          id: `nom-${idx}-${item.lat}-${item.lon}`,
          name: primaryName,
          displayName: parts.join(', '),
          locality: addr.village || addr.suburb || addr.neighbourhood,
          city,
          district: addr.county || addr.state_district,
          state,
          country: addr.country,
          postalCode: addr.postcode,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        };
      });

      searchCache.set(cleanQuery, results);
      return results;
    }
  } catch (err) {
    console.error('Nominatim search failed:', err);
  }

  return [];
}

/**
 * Reverse geocodes latitude/longitude coordinates into a specific local place hierarchy.
 */
export async function reverseGeocodeLocation(latitude: number, longitude: number, accuracy?: number): Promise<LocationResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await axios.get(url, { timeout: 5000 });

    if (res.data && res.data.address) {
      const addr = res.data.address;
      const primaryName =
        addr.village ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.hamlet ||
        addr.town ||
        addr.city ||
        addr.county ||
        'Current Location';

      const city = addr.city || addr.town || addr.municipality || addr.county || 'AP';
      const state = addr.state || 'Andhra Pradesh';
      const district = addr.county || addr.state_district;

      const parts: string[] = [primaryName];
      if (city && city !== primaryName) parts.push(city);
      if (state && state !== primaryName && state !== city) parts.push(state);

      return {
        id: `rev-${latitude}-${longitude}`,
        name: primaryName,
        displayName: parts.join(', '),
        locality: addr.village || addr.suburb || addr.neighbourhood,
        city,
        district,
        state,
        country: addr.country,
        postalCode: addr.postcode,
        latitude,
        longitude,
        accuracy: accuracy ? Math.round(accuracy) : undefined,
      };
    }
  } catch (err) {
    console.error('Reverse geocoding failed:', err);
  }

  // Graceful fallback if reverse geocoding request fails
  return {
    id: `rev-fallback-${latitude}-${longitude}`,
    name: 'Detected Location',
    displayName: 'Detected Location',
    latitude,
    longitude,
    accuracy: accuracy ? Math.round(accuracy) : undefined,
  };
}
