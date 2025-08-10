import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nasaApi } from '../lib/nasa-api';
import { SolarCalculator } from '../lib/solar-calculations';
import { LocationData, SolarMetrics, MissionParameters, CalculationResults } from '../types/solar';

export function useSolarData(location: LocationData | null) {
  return useQuery({
    queryKey: ['/api/nasa-power', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null;
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      return nasaApi.fetchSolarData(
        location.latitude,
        location.longitude,
        startDate,
        endDate
      );
    },
    enabled: !!location,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSolarMetrics(location: LocationData | null) {
  const { data: nasaData, isLoading, error } = useSolarData(location);
  
  return useQuery({
    queryKey: ['solar-metrics', location?.latitude, location?.longitude],
    queryFn: () => {
      if (!nasaData) return null;
      return SolarCalculator.calculateMetrics(nasaData);
    },
    enabled: !!nasaData,
  });
}

export function useMissionCalculations(
  metrics: SolarMetrics | null,
  parameters: MissionParameters
) {
  return useQuery({
    queryKey: ['mission-calculations', metrics, parameters],
    queryFn: (): CalculationResults | null => {
      if (!metrics) return null;
      return SolarCalculator.calculateMissionEnergy(metrics, parameters);
    },
    enabled: !!metrics,
  });
}

export function useLocationSearch() {
  return useMutation({
    mutationFn: (query: string) => nasaApi.geocodeLocation(query),
  });
}

export function useReportGeneration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => nasaApi.generateReport(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['/api/projects'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['/api/projects', id],
    enabled: !!id,
  });
}
