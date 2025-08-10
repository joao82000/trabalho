import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationData } from '../types/solar';

interface MapViewProps {
  currentLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onAddToComparison?: () => void;
}

export function MapView({ currentLocation, onLocationSelect, onAddToComparison }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [layers, setLayers] = useState({
    solarIrradiance: true,
    cloudCoverage: false,
    temperature: false,
  });

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Clear any existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Wait for the DOM element to be ready
        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
          center: [28.5721, -80.6480], // Kennedy Space Center
          zoom: 8,
          zoomControl: true,
        });

        // Add OpenStreetMap as fallback
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Handle map clicks
        map.on('click', (e: any) => {
          onLocationSelect({
            name: `Location ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          });
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onLocationSelect]);

  useEffect(() => {
    const updateMarker = async () => {
      if (!mapInstanceRef.current || !currentLocation) return;

      try {
        const L = await import('leaflet');

        // Update map view and marker
        mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 12);

        // Remove existing marker
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }

        // Add new marker
        markerRef.current = L.marker([currentLocation.latitude, currentLocation.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<div class="text-nasa-blue"><strong>${currentLocation.name}</strong><br>Solar Analysis Location</div>`)
          .openPopup();
      } catch (error) {
        console.error('Error updating marker:', error);
      }
    };

    updateMarker();
  }, [currentLocation]);

  const handleLayerToggle = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    // TODO: Implement actual layer switching with NASA satellite data
  };

  return (
    <div className="h-96 relative">
      <div ref={mapRef} className="w-full h-full rounded-lg border border-nasa-gold/30" data-testid="map-container" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 space-y-2 z-10">
        <Card className="bg-nasa-dark/90 backdrop-blur border-nasa-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-nasa-gold text-sm">NASA Satellite Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="solar-irradiance"
                checked={layers.solarIrradiance}
                onCheckedChange={() => handleLayerToggle('solarIrradiance')}
                className="border-nasa-gold/30 data-[state=checked]:bg-nasa-gold data-[state=checked]:border-nasa-gold"
                data-testid="checkbox-solar-irradiance"
              />
              <label htmlFor="solar-irradiance" className="text-gray-300 text-sm cursor-pointer">
                Solar Irradiance
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cloud-coverage"
                checked={layers.cloudCoverage}
                onCheckedChange={() => handleLayerToggle('cloudCoverage')}
                className="border-nasa-gold/30 data-[state=checked]:bg-nasa-gold data-[state=checked]:border-nasa-gold"
                data-testid="checkbox-cloud-coverage"
              />
              <label htmlFor="cloud-coverage" className="text-gray-300 text-sm cursor-pointer">
                Cloud Coverage
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="temperature"
                checked={layers.temperature}
                onCheckedChange={() => handleLayerToggle('temperature')}
                className="border-nasa-gold/30 data-[state=checked]:bg-nasa-gold data-[state=checked]:border-nasa-gold"
                data-testid="checkbox-temperature"
              />
              <label htmlFor="temperature" className="text-gray-300 text-sm cursor-pointer">
                Temperature
              </label>
            </div>
          </CardContent>
        </Card>
        
        {currentLocation && onAddToComparison && (
          <Card className="bg-nasa-dark/90 backdrop-blur border-nasa-gold/30">
            <CardContent className="p-3">
              <Button
                className="w-full bg-nasa-gold text-nasa-blue hover:bg-yellow-400"
                onClick={onAddToComparison}
                data-testid="button-add-to-analysis"
              >
                Add to Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-nasa-darker/90 backdrop-blur border-t border-nasa-gold/30 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span className="text-gray-300">
              Data Source: <span className="text-nasa-gold">NASA POWER API</span>
            </span>
            <span className="text-gray-300">
              Last Update: <span className="text-nasa-gold">Real-time</span>
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Live</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentLocation && (
              <span className="text-gray-300">
                Coordinates:{' '}
                <span className="text-nasa-gold" data-testid="text-map-coordinates">
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
