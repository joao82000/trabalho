import { SolarMetrics, MissionParameters, CalculationResults, NASAPowerResponse } from '../types/solar';

export class SolarCalculator {
  /**
   * Calculate solar metrics from NASA POWER data
   */
  static calculateMetrics(nasaData: NASAPowerResponse): SolarMetrics {
    const irradianceData = nasaData.properties.parameter.ALLSKY_SFC_SW_DWN;
    const temperatureData = nasaData.properties.parameter.T2M;
    
    const irradianceValues = Object.values(irradianceData);
    const temperatureValues = Object.values(temperatureData);
    
    const dailyIrradiance = irradianceValues.reduce((sum, val) => sum + val, 0) / irradianceValues.length;
    const temperature = temperatureValues.reduce((sum, val) => sum + val, 0) / temperatureValues.length;
    
    // Calculate efficiency based on temperature (silicon panels lose ~0.4% per °C above 25°C)
    const tempCoefficient = -0.004;
    const referenceTemp = 25;
    const tempLoss = Math.max(0, (temperature - referenceTemp) * tempCoefficient);
    const efficiency = Math.max(0.1, 1 + tempLoss); // Minimum 10% efficiency
    
    const peakOutput = Math.max(...irradianceValues);
    const averageOutput = dailyIrradiance;
    const variance = this.calculateVariance(irradianceValues);
    
    return {
      dailyIrradiance,
      efficiency: efficiency * 100,
      temperature,
      peakOutput,
      averageOutput,
      variance,
    };
  }

  /**
   * Calculate energy production for space missions
   */
  static calculateMissionEnergy(
    metrics: SolarMetrics,
    parameters: MissionParameters
  ): CalculationResults {
    const { panelArea, systemEfficiency, missionDuration } = parameters;
    const { dailyIrradiance, efficiency } = metrics;
    
    // Daily energy calculation (kWh)
    const dailyEnergyOutput = dailyIrradiance * panelArea * systemEfficiency * (efficiency / 100);
    const totalEnergyOutput = dailyEnergyOutput * missionDuration;
    
    // Battery requirements for lunar night (350 hours worst case)
    const lunarNightHours = 350;
    const dailyPowerConsumption = dailyEnergyOutput / 24; // Assuming constant consumption
    const batteryRequired = dailyPowerConsumption * lunarNightHours;
    
    // Mission viability assessment
    const minRequiredEnergy = 1000; // kWh minimum for space missions
    const missionViability = totalEnergyOutput >= minRequiredEnergy;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      metrics,
      parameters,
      totalEnergyOutput,
      batteryRequired
    );
    
    return {
      totalEnergyOutput,
      dailyAverage: dailyEnergyOutput,
      peakOutput: metrics.peakOutput * panelArea * systemEfficiency,
      efficiency: efficiency,
      batteryRequired,
      missionViability,
      recommendations,
    };
  }

  /**
   * Generate optimal panel orientation
   */
  static calculateOptimalTilt(latitude: number): number {
    // For fixed installations, optimal tilt ≈ latitude
    // For space applications, consider seasonal variations
    return Math.abs(latitude);
  }

  /**
   * Calculate system losses
   */
  static calculateSystemLosses(temperature: number, humidity?: number): number {
    let losses = 0.14; // Base system losses (14%)
    
    // Temperature-dependent losses
    if (temperature > 35) {
      losses += 0.02; // Additional 2% for high temperatures
    } else if (temperature < -10) {
      losses += 0.01; // Additional 1% for very low temperatures
    }
    
    // Humidity-dependent losses (if available)
    if (humidity && humidity > 80) {
      losses += 0.01; // Additional 1% for high humidity
    }
    
    return Math.min(losses, 0.3); // Cap at 30% total losses
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private static generateRecommendations(
    metrics: SolarMetrics,
    parameters: MissionParameters,
    totalEnergy: number,
    batteryRequired: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Irradiance-based recommendations
    if (metrics.dailyIrradiance > 6.5) {
      recommendations.push("Excellent solar resource - ideal for space missions");
    } else if (metrics.dailyIrradiance > 4.5) {
      recommendations.push("Good solar resource - suitable for most applications");
    } else {
      recommendations.push("Consider high-efficiency panels or backup power systems");
    }
    
    // Temperature-based recommendations
    if (metrics.temperature > 35) {
      recommendations.push("High temperatures detected - implement cooling systems");
    } else if (metrics.temperature < -20) {
      recommendations.push("Extreme cold conditions - use cold-weather rated equipment");
    }
    
    // Battery recommendations
    if (batteryRequired > 2000) {
      recommendations.push("Large battery system required - consider modular design");
    }
    
    // Mission viability
    if (totalEnergy < 1000) {
      recommendations.push("Energy output below mission requirements - increase panel area");
    }
    
    // Efficiency recommendations
    if (parameters.systemEfficiency < 0.20) {
      recommendations.push("Consider upgrading to higher efficiency panels (>20%)");
    }
    
    return recommendations;
  }
}
