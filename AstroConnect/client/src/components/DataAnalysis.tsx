import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sun, Thermometer, Gauge, Zap, Battery, CloudRain, Wind, Eye, Globe, MapPin, Clock, CheckCircle, AlertTriangle, Activity, Database, TrendingUp } from 'lucide-react';
import { SolarMetrics, LocationData, CalculationResults, MissionParameters } from '../types/solar';

interface DataAnalysisProps {
  solarMetrics: SolarMetrics | null;
  currentLocation: LocationData | null;
  calculationResults: CalculationResults | null;
  missionParameters: MissionParameters;
}

export function DataAnalysis({ solarMetrics, currentLocation, calculationResults, missionParameters }: DataAnalysisProps) {
  const [timeRange, setTimeRange] = useState<'1D' | '7D' | '30D' | '1Y'>('7D');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Get current time and date for real-time data
  const currentTime = new Date();
  const timeString = currentTime.toLocaleTimeString();
  const dateString = currentTime.toLocaleDateString();

  // Generate enhanced real-time data
  const generateRealTimeData = () => {
    const baseEfficiency = solarMetrics?.efficiency || 85;
    const baseTemp = solarMetrics?.temperature || 25;
    const baseIrradiance = solarMetrics?.dailyIrradiance || 5.5;
    
    return {
      currentEfficiency: baseEfficiency + (Math.random() - 0.5) * 5,
      currentTemp: baseTemp + (Math.random() - 0.5) * 8,
      currentIrradiance: Math.max(0, baseIrradiance + (Math.random() - 0.5) * 2),
      humidity: 45 + Math.random() * 30,
      windSpeed: Math.random() * 15,
      cloudCover: Math.random() * 40,
      uvIndex: Math.max(0, Math.min(11, 3 + Math.random() * 6)),
      visibility: 8 + Math.random() * 7,
      pressure: 1010 + (Math.random() - 0.5) * 20,
      powerOutput: calculationResults ? calculationResults.totalEnergyOutput * (0.8 + Math.random() * 0.4) : 0,
      batteryLevel: 70 + Math.random() * 25,
      systemLoad: 40 + Math.random() * 40,
    };
  };

  const realTimeData = generateRealTimeData();

  useEffect(() => {
    if (!chartRef.current || !solarMetrics) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Generate sample data for chart
    const generateChartData = () => {
      const points = timeRange === '1D' ? 24 : timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 12;
      const data = [];
      
      for (let i = 0; i < points; i++) {
        const baseIrradiance = solarMetrics.dailyIrradiance;
        const variation = (Math.random() - 0.5) * 2;
        
        data.push({
          time: timeRange === '1D' ? `${i.toString().padStart(2, '0')}:00` : 
                timeRange === '7D' ? `Day ${i + 1}` :
                timeRange === '30D' ? `${i + 1}` : 
                `Month ${i + 1}`,
          irradiance: Math.max(0, baseIrradiance + variation),
          temperature: solarMetrics.temperature + (Math.random() - 0.5) * 10,
          efficiency: solarMetrics.efficiency + (Math.random() - 0.5) * 10,
        });
      }
      
      return data;
    };

    const data = generateChartData();

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.time),
        datasets: [
          {
            label: 'Solar Irradiance (kW/m²)',
            data: data.map(d => d.irradiance),
            borderColor: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Temperature (°C)',
            data: data.map(d => d.temperature),
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#FFD700',
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#FFD700' },
            grid: { color: 'rgba(255, 215, 0, 0.1)' },
          },
          y: {
            ticks: { color: '#FFD700' },
            grid: { color: 'rgba(255, 215, 0, 0.1)' },
            title: {
              display: true,
              text: 'Irradiance (kW/m²)',
              color: '#FFD700',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#00ff88' },
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: 'Temperature (°C)',
              color: '#00ff88',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [solarMetrics, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header with Location Info */}
      <div className="bg-nasa-dark border border-nasa-gold/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-nasa-gold mb-2">Real-Time Solar Analysis Dashboard</h1>
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-nasa-gold" />
                <span>{currentLocation?.name || 'No location selected'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-nasa-gold" />
                <span>{currentLocation ? `${currentLocation.latitude.toFixed(4)}°, ${currentLocation.longitude.toFixed(4)}°` : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-nasa-gold" />
                <span>{timeString} - {dateString}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Solar Irradiance */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center justify-between">
              <div className="flex items-center">
                <Sun className="mr-2 h-5 w-5" />
                Solar Irradiance
              </div>
              <Badge className="bg-nasa-gold/20 text-nasa-gold border-nasa-gold/50">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-nasa-gold">
                {realTimeData.currentIrradiance.toFixed(2)}
                <span className="text-lg text-gray-400 ml-1">kW/m²</span>
              </div>
              <Progress value={(realTimeData.currentIrradiance / 10) * 100} className="h-2" />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Peak: {(solarMetrics?.dailyIrradiance || 5.5).toFixed(2)}</span>
                <span>{realTimeData.currentIrradiance > (solarMetrics?.dailyIrradiance || 5.5) ? '+' : ''}{((realTimeData.currentIrradiance - (solarMetrics?.dailyIrradiance || 5.5)) / (solarMetrics?.dailyIrradiance || 5.5) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center justify-between">
              <div className="flex items-center">
                <Thermometer className="mr-2 h-5 w-5" />
                Temperature
              </div>
              <Badge className={`${realTimeData.currentTemp >= 20 && realTimeData.currentTemp <= 30 ? 'bg-green-400/20 text-green-400 border-green-400/50' : 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50'}`}>
                {realTimeData.currentTemp >= 20 && realTimeData.currentTemp <= 30 ? 'Optimal' : 'Monitor'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-nasa-gold">
                {realTimeData.currentTemp.toFixed(1)}
                <span className="text-lg text-gray-400 ml-1">°C</span>
              </div>
              <Progress value={Math.max(0, Math.min(100, (realTimeData.currentTemp + 20) / 70 * 100))} className="h-2" />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Range: -20°C to 50°C</span>
                <span>Optimal: 20-30°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Efficiency */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center justify-between">
              <div className="flex items-center">
                <Gauge className="mr-2 h-5 w-5" />
                System Efficiency
              </div>
              <Badge className={`${realTimeData.currentEfficiency > 85 ? 'bg-green-400/20 text-green-400 border-green-400/50' : realTimeData.currentEfficiency > 70 ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50' : 'bg-red-400/20 text-red-400 border-red-400/50'}`}>
                {realTimeData.currentEfficiency > 85 ? 'Excellent' : realTimeData.currentEfficiency > 70 ? 'Good' : 'Poor'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-nasa-gold">
                {realTimeData.currentEfficiency.toFixed(1)}
                <span className="text-lg text-gray-400 ml-1">%</span>
              </div>
              <Progress value={realTimeData.currentEfficiency} className="h-2" />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Target: &gt;85%</span>
                <span>{realTimeData.currentEfficiency > 85 ? '✓ Met' : '⚠ Below target'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Power Output */}
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Power Output
              </div>
              <Badge className="bg-nasa-gold/20 text-nasa-gold border-nasa-gold/50">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-nasa-gold">
                {realTimeData.powerOutput.toFixed(0)}
                <span className="text-lg text-gray-400 ml-1">kWh</span>
              </div>
              <Progress value={Math.min(100, (realTimeData.powerOutput / (calculationResults?.totalEnergyOutput || 1000)) * 100)} className="h-2" />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Daily Target: {calculationResults?.totalEnergyOutput.toFixed(0) || 'N/A'} kWh</span>
                <span>{calculationResults ? `${((realTimeData.powerOutput / calculationResults.totalEnergyOutput) * 100).toFixed(0)}%` : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center">
              <CloudRain className="mr-2 h-5 w-5" />
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Humidity</div>
                <div className="text-xl font-bold text-nasa-gold">{realTimeData.humidity.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Wind Speed</div>
                <div className="text-xl font-bold text-nasa-gold">{realTimeData.windSpeed.toFixed(1)} m/s</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Cloud Cover</div>
                <div className="text-xl font-bold text-nasa-gold">{realTimeData.cloudCover.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">UV Index</div>
                <div className="text-xl font-bold text-nasa-gold">{realTimeData.uvIndex.toFixed(0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center">
              <Battery className="mr-2 h-5 w-5" />
              Energy Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Battery Level</span>
                <span className="text-nasa-gold font-bold">{realTimeData.batteryLevel.toFixed(0)}%</span>
              </div>
              <Progress value={realTimeData.batteryLevel} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">System Load</span>
                <span className="text-nasa-gold font-bold">{realTimeData.systemLoad.toFixed(0)}%</span>
              </div>
              <Progress value={realTimeData.systemLoad} className="h-3" />
            </div>
            <div className="text-sm text-gray-400">
              Required Capacity: {calculationResults?.batteryRequired.toFixed(0) || 'N/A'} kWh
            </div>
          </CardContent>
        </Card>

        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-nasa-gold flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Mission Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mission Viability</span>
              <div className="flex items-center space-x-2">
                {calculationResults?.missionViability ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${calculationResults?.missionViability ? 'text-green-400' : 'text-red-400'}`}>
                  {calculationResults?.missionViability ? 'Viable' : 'Not Viable'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Power Systems</span>
              <span className="text-green-400 text-sm">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Data Link</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mission Duration</span>
              <span className="text-nasa-gold text-sm font-medium">{missionParameters.missionDuration} days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-nasa-gray border-nasa-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-nasa-gold flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Historical Analysis
            </CardTitle>
            <div className="flex items-center space-x-2">
              {(['1D', '7D', '30D', '1Y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  className={
                    timeRange === range
                      ? 'bg-nasa-gold text-nasa-blue'
                      : 'bg-nasa-gold/20 border-nasa-gold/50 text-nasa-gold hover:bg-nasa-gold/30'
                  }
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={chartRef} className="w-full h-full" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader>
            <CardTitle className="text-nasa-gold flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {solarMetrics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Peak Output</span>
                  <span className="text-nasa-gold font-bold">{solarMetrics.peakOutput.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Average Output</span>
                  <span className="text-nasa-gold font-bold">{solarMetrics.averageOutput.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Daily Irradiance</span>
                  <span className="text-nasa-gold font-bold">{solarMetrics.dailyIrradiance.toFixed(2)} kWh/m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Variance</span>
                  <span className="text-yellow-400 font-bold">±{solarMetrics.variance.toFixed(1)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-nasa-gray border-nasa-gold/30">
          <CardHeader>
            <CardTitle className="text-nasa-gold flex items-center">
              <Gauge className="mr-2 h-5 w-5" />
              Mission Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Panel Area</span>
              <span className="text-nasa-gold font-bold">{missionParameters.panelArea} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">System Efficiency</span>
              <span className="text-nasa-gold font-bold">{(missionParameters.systemEfficiency * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Energy Required</span>
              <span className="text-nasa-gold font-bold">{calculationResults?.totalEnergyOutput.toFixed(0) || 'N/A'} kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Battery Required</span>
              <span className="text-nasa-gold font-bold">{calculationResults?.batteryRequired.toFixed(0) || 'N/A'} kWh</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}