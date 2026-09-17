'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icon references image paths that don't resolve under
// Next.js bundling; point them at the CDN copies instead of shipping the assets.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
     iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
     iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
     shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [5.6037, -0.187]; // Accra, Ghana - sensible default for an unpicked location

export type LocationValue = {
     address: string;
     latitude: number;
     longitude: number;
};

type GoogleMapPickerProps = {
     value: LocationValue;
     onChange: (value: LocationValue) => void;
     height?: number;
};

type NominatimResult = { display_name: string; lat: string; lon: string };

// Free, no-API-key address search/reverse-geocoding via OpenStreetMap's Nominatim service.
// Rate-limited for fair use (~1 req/sec) - fine for an internal booking form; if this ever
// needs to handle heavy production traffic, self-host Nominatim or switch to a paid geocoder.
async function searchAddress(query: string): Promise<NominatimResult[]> {
     try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          if (!response.ok) return [];
          return response.json();
     } catch (error) {
          return [];
     }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
     try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          if (!response.ok) return null;
          const data = await response.json();
          return data?.display_name || null;
     } catch (error) {
          return null;
     }
}

function ClickToPlaceMarker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
     useMapEvents({
          click(event) {
               onPick(event.latlng.lat, event.latlng.lng);
          },
     });
     return null;
}

// Address search + draggable/clickable pin. Keeps address/lat/long always in sync with each other.
export default function GoogleMapPicker({ value, onChange, height = 320 }: GoogleMapPickerProps) {
     const [mounted, setMounted] = useState(false);
     const [searchTerm, setSearchTerm] = useState(value.address);
     const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
     const [searching, setSearching] = useState(false);
     const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

     useEffect(() => setMounted(true), []);

     const mapCenter: [number, number] = value.latitude && value.longitude ? [value.latitude, value.longitude] : DEFAULT_CENTER;

     const applyPosition = useCallback(
          async (lat: number, lng: number, address?: string) => {
               const resolvedAddress = address ?? (await reverseGeocode(lat, lng)) ?? value.address;
               onChange({ address: resolvedAddress, latitude: lat, longitude: lng });
               setSearchTerm(resolvedAddress);
          },
          [onChange, value.address]
     );

     const handleSearchChange = (term: string) => {
          setSearchTerm(term);
          onChange({ ...value, address: term });
          if (searchDebounce.current) clearTimeout(searchDebounce.current);
          if (term.trim().length < 3) {
               setSuggestions([]);
               return;
          }
          searchDebounce.current = setTimeout(async () => {
               setSearching(true);
               const results = await searchAddress(term.trim());
               setSuggestions(results);
               setSearching(false);
          }, 500);
     };

     const pickSuggestion = (result: NominatimResult) => {
          setSuggestions([]);
          applyPosition(Number(result.lat), Number(result.lon), result.display_name);
     };

     if (!mounted) {
          return <div className="text-muted">Loading map…</div>;
     }

     return (
          <div>
               <div className="position-relative">
                    <input
                         type="text"
                         className="form-control mb-2"
                         placeholder="Search for the pickup address"
                         value={searchTerm}
                         onChange={(event) => handleSearchChange(event.target.value)}
                    />
                    {searching && <small className="text-muted">Searching…</small>}
                    {suggestions.length > 0 && (
                         <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                              {suggestions.map((result, index) => (
                                   <li
                                        key={index}
                                        className="list-group-item list-group-item-action"
                                        role="button"
                                        onClick={() => pickSuggestion(result)}
                                   >
                                        {result.display_name}
                                   </li>
                              ))}
                         </ul>
                    )}
               </div>
               <MapContainer
                    center={mapCenter}
                    zoom={value.latitude && value.longitude ? 15 : 12}
                    style={{ width: '100%', height: `${height}px`, borderRadius: '6px' }}
               >
                    <TileLayer
                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickToPlaceMarker onPick={(lat, lng) => applyPosition(lat, lng)} />
                    <Marker
                         position={mapCenter}
                         draggable
                         eventHandlers={{
                              dragend: (event) => {
                                   const marker = event.target as L.Marker;
                                   const position = marker.getLatLng();
                                   applyPosition(position.lat, position.lng);
                              },
                         }}
                    />
               </MapContainer>
               <small className="text-muted">Search, drag the pin, or click the map to fine-tune the exact pickup location.</small>
          </div>
     );
}
