import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ProductMapProps {
	location: string;
	className?: string;
}

export function ProductMap({ location, className }: ProductMapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<L.Map | null>(null);

	useEffect(() => {
		if (!mapRef.current || !location) return;

		// Clean up existing map
		if (mapInstanceRef.current) {
			mapInstanceRef.current.remove();
			mapInstanceRef.current = null;
		}

		// Clear inner HTML to fully reset container
		if (mapRef.current) {
			mapRef.current.innerHTML = '';
		}

		// Initialize Leaflet map
		const initMap = async () => {
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
				);
				const data = await response.json();

				if (data && data.length > 0 && mapRef.current) {
					const lat = Number.parseFloat(data[0].lat);
					const lon = Number.parseFloat(data[0].lon);

					// Create map
					const map = L.map(mapRef.current).setView([lat, lon], 13);

					// Add dark theme tile layer
					L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
						subdomains: 'abcd',
						maxZoom: 20,
					}).addTo(map);

					// Create custom marker icon
					const customIcon = L.divIcon({
						html: `
              <div style="
                background-color: #3b82f6;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>
            `,
						className: 'custom-marker',
						iconSize: [20, 20],
						iconAnchor: [10, 10],
					});

					// Add marker
					L.marker([lat, lon], { icon: customIcon })
						.addTo(map)
						.bindPopup(`<div style="color: #1f2937; font-weight: 500;">${location}</div>`);

					mapInstanceRef.current = map;
				}
			} catch (error) {
				console.error('Error loading map:', error);
			}
		};

		initMap();

		// Cleanup on unmount
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, [location]);

	return (
		<div className={`relative ${className}`}>
			<div className="absolute top-2 left-2 z-[1000] flex items-center gap-2 rounded-lg bg-gray-800/90 px-3 py-2 backdrop-blur-sm">
				<MapPin className="h-4 w-4 text-blue-400" />
				<span className="text-sm text-gray-100">{location}</span>
			</div>
			<div ref={mapRef} className="h-full w-full rounded-lg" style={{ minHeight: '300px' }} />
		</div>
	);
}
