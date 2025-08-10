import { NASAPowerResponse } from '../types/solar';

export class NASAApiClient {
  private baseUrl = '/api';

  async fetchSolarData(
    latitude: number,
    longitude: number,
    startDate?: string,
    endDate?: string
  ): Promise<NASAPowerResponse> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${this.baseUrl}/nasa-power?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch NASA POWER data: ${response.statusText}`);
    }

    return response.json();
  }

  async geocodeLocation(query: string) {
    const params = new URLSearchParams({ query });
    const response = await fetch(`${this.baseUrl}/geocode?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to geocode location: ${response.statusText}`);
    }

    return response.json();
  }

  async generateReport(projectId: string) {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    return response.json();
  }
}

export const nasaApi = new NASAApiClient();
