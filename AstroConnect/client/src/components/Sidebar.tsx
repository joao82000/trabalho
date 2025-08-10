import { useState } from 'react';
import { MapPin, Search, Calculator, Rocket, Sun, Activity, Thermometer, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationData, SolarMetrics, MissionParameters, CalculationResults } from '../types/solar';
import { useLocationSearch } from '../hooks/use-solar-data';

interface SidebarProps {
  currentLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  solarMetrics: SolarMetrics | null;
  missionParameters: MissionParameters;
  onParametersChange: (parameters: MissionParameters) => void;
  calculationResults: CalculationResults | null;
  onAddToComparison?: () => void;
}

export function Sidebar({
  currentLocation,
  onLocationSelect,
  solarMetrics,
  missionParameters,
  onParametersChange,
  calculationResults,
  onAddToComparison,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const locationSearch = useLocationSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await locationSearch.mutateAsync(searchQuery);
      if (results && results.length > 0) {
        const result = results[0];
        onLocationSelect({
          name: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSampleLocation = (type: 'lunar' | 'mars') => {
    const sampleLocations = {
      lunar: {
        name: 'Lunar South Pole Base',
        latitude: -89.5,
        longitude: 0,
        elevation: 0,
      },
      mars: {
        name: 'Mars Station Alpha',
        latitude: -14.5684,
        longitude: 175.472636,
        elevation: -2540,
      },
    };
    
    onLocationSelect(sampleLocations[type]);
  };

  return (
    <aside className="w-80 bg-nasa-dark border-r border-nasa-gold/30 overflow-y-auto h-screen fixed top-20 left-0">
      <div className="p-6 space-y-4">
        {/* Location Selection */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader>
            <CardTitle className="text-nasa-gold flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Location Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search coordinates or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-nasa-gray border-nasa-gold/30 text-white placeholder-gray-400 focus:border-nasa-gold"
                data-testid="input-location-search"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1 text-nasa-gold hover:text-white"
                onClick={handleSearch}
                disabled={locationSearch.isPending}
                data-testid="button-search-location"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-nasa-gold/20 border-nasa-gold/50 text-nasa-gold hover:bg-nasa-gold/30"
                onClick={() => handleSampleLocation('lunar')}
                data-testid="button-sample-lunar"
              >
                Lunar Base
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-nasa-gold/20 border-nasa-gold/50 text-nasa-gold hover:bg-nasa-gold/30"
                onClick={() => handleSampleLocation('mars')}
                data-testid="button-sample-mars"
              >
                Mars Station
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Location Info */}
        {currentLocation && (
          <Card className="bg-nasa-gray border-nasa-gold/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Current Location</span>
                <span className="text-nasa-gold text-xs animate-pulse-glow px-2 py-1 bg-nasa-gold/20 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-white font-medium" data-testid="text-location-name">
                {currentLocation.name}
              </p>
              <p className="text-gray-400 text-sm" data-testid="text-location-coordinates">
                {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°W
              </p>
              {currentLocation.elevation !== undefined && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Elevation:</span>
                    <span className="text-nasa-gold ml-1" data-testid="text-elevation">
                      {currentLocation.elevation}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Zone:</span>
                    <span className="text-nasa-gold ml-1" data-testid="text-timezone">
                      {currentLocation.timezone || 'UTC'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Solar Metrics */}
        {solarMetrics && (
          <Card className="bg-nasa-gray border-nasa-gold/30">
            <CardHeader>
              <CardTitle className="text-nasa-gold flex items-center">
                <Sun className="mr-2 h-4 w-4" />
                Solar Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-nasa-gray rounded-lg p-4 border border-nasa-gold/30 data-card-glow transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Daily Irradiance</span>
                  <Activity className="text-nasa-gold h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-nasa-gold mt-1" data-testid="text-daily-irradiance">
                  {solarMetrics.dailyIrradiance.toFixed(2)} kWh/m²
                </p>
                <p className="text-xs text-green-400">
                  {solarMetrics.dailyIrradiance > 5.5 ? '+12% optimal range' : 'Good conditions'}
                </p>
              </div>

              <div className="bg-nasa-gray rounded-lg p-4 border border-nasa-gold/30 data-card-glow transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Efficiency Factor</span>
                  <Activity className="text-nasa-gold h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-nasa-gold mt-1" data-testid="text-efficiency">
                  {solarMetrics.efficiency.toFixed(1)}%
                </p>
                <p className="text-xs text-green-400">
                  {solarMetrics.efficiency > 90 ? 'Excellent conditions' : 'Good conditions'}
                </p>
              </div>

              <div className="bg-nasa-gray rounded-lg p-4 border border-nasa-gold/30 data-card-glow transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Temperature</span>
                  <Thermometer className="text-nasa-gold h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-nasa-gold mt-1" data-testid="text-temperature">
                  {solarMetrics.temperature.toFixed(1)}°C
                </p>
                <p className="text-xs text-yellow-400">
                  {solarMetrics.temperature >= 20 && solarMetrics.temperature <= 30
                    ? 'Optimal range'
                    : 'Monitor conditions'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environmental Conditions */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader>
            <CardTitle className="text-nasa-gold flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Environmental Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-nasa-darker rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">Humidity</span>
                  <span className="text-nasa-gold text-sm font-bold">
                    {(45 + Math.random() * 30).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-nasa-darker rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">Wind Speed</span>
                  <span className="text-nasa-gold text-sm font-bold">
                    {(Math.random() * 15).toFixed(1)} m/s
                  </span>
                </div>
              </div>
              
              <div className="bg-nasa-darker rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">Cloud Cover</span>
                  <span className="text-nasa-gold text-sm font-bold">
                    {(Math.random() * 40).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-nasa-darker rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">UV Index</span>
                  <span className="text-nasa-gold text-sm font-bold">
                    {Math.max(0, Math.min(11, 3 + Math.random() * 6)).toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div className="bg-nasa-darker rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">Pressure</span>
                  <span className="text-nasa-gold text-sm font-bold">
                    {(1010 + (Math.random() - 0.5) * 20).toFixed(0)} hPa
                  </span>
                </div>
              </div>
              
              <div className="bg-nasa-darker rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">Visibility</span>
                  <span className="text-nasa-gold text-sm font-bold">
                    {(8 + Math.random() * 7).toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Real-time System Status */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader>
            <CardTitle className="text-nasa-gold flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Power Output</span>
                <span className="text-green-400 text-sm font-bold">
                  {calculationResults ? (calculationResults.totalEnergyOutput * (0.8 + Math.random() * 0.4)).toFixed(0) : '0'} kWh
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Battery Level</span>
                <span className="text-nasa-gold text-sm font-bold">
                  {(70 + Math.random() * 25).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">System Load</span>
                <span className="text-yellow-400 text-sm font-bold">
                  {(40 + Math.random() * 40).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Data Link</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Mission Status</span>
                <span className={`text-sm font-bold ${calculationResults?.missionViability ? 'text-green-400' : 'text-red-400'}`}>
                  {calculationResults?.missionViability ? 'Viable' : 'Not Viable'}
                </span>
              </div>
            </div>
            
            {calculationResults && (
              <div className="bg-nasa-darker rounded p-3 mt-3">
                <div className="text-center">
                  <p className="text-gray-300 text-sm">Total Energy Required</p>
                  <p className="text-nasa-gold text-xl font-bold" data-testid="text-energy-output">
                    {calculationResults.totalEnergyOutput.toFixed(0)} kWh
                  </p>
                  <p className="text-gray-400 text-xs">
                    Battery: {calculationResults.batteryRequired.toFixed(0)} kWh
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mission Recommendations */}
        {calculationResults && (
          <Card className="bg-nasa-gray border-nasa-gold/30">
            <CardHeader>
              <CardTitle className="text-nasa-gold flex items-center">
                <Rocket className="mr-2 h-4 w-4" />
                Mission Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calculationResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-nasa-gold rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
              
              {onAddToComparison && (
                <Button
                  className="w-full mt-4 bg-nasa-gold text-nasa-blue hover:bg-yellow-400"
                  onClick={onAddToComparison}
                  data-testid="button-add-to-comparison"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Analysis
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
}
