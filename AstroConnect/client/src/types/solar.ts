export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
}

export interface SolarMetrics {
  dailyIrradiance: number;
  efficiency: number;
  temperature: number;
  peakOutput: number;
  averageOutput: number;
  variance: number;
}

export interface MissionParameters {
  panelArea: number;
  systemEfficiency: number;
  missionDuration: number;
  batteryCapacity?: number;
}

export interface CalculationResults {
  totalEnergyOutput: number;
  dailyAverage: number;
  peakOutput: number;
  efficiency: number;
  batteryRequired: number;
  missionViability: boolean;
  recommendations: string[];
}

export interface ChartDataPoint {
  time: string;
  irradiance: number;
  temperature: number;
  efficiency: number;
}

export interface NASAPowerResponse {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: Record<string, number>;
      T2M: Record<string, number>;
      RH2M?: Record<string, number>;
      WS10M?: Record<string, number>;
      CLOUD_AMT?: Record<string, number>;
    };
  };
}

export interface SystemStatus {
  powerSystems: 'operational' | 'warning' | 'error';
  dataLink: 'active' | 'inactive' | 'degraded';
  weather: 'monitoring' | 'alert' | 'severe';
  storage: 'optimal' | 'low' | 'critical';
  storagePercentage: number;
}
