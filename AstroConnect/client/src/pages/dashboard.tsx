import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DataAnalysis } from '../components/DataAnalysis';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { LocationData, MissionParameters } from '../types/solar';
import { useSolarMetrics, useMissionCalculations } from '../hooks/use-solar-data';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>({
    name: 'Kennedy Space Center, FL',
    latitude: 28.5721,
    longitude: -80.6480,
    elevation: 3,
    timezone: 'UTC-5',
  });

  const [missionParameters, setMissionParameters] = useState<MissionParameters>({
    panelArea: 100,
    systemEfficiency: 0.22,
    missionDuration: 14,
  });

  // Fetch solar metrics for current location
  const { data: solarMetrics, isLoading: metricsLoading, error: metricsError } = useSolarMetrics(currentLocation);

  // Calculate mission energy requirements
  const { data: calculationResults, isLoading: calculationsLoading } = useMissionCalculations(
    solarMetrics || null,
    missionParameters
  );

  const isLoading = metricsLoading || calculationsLoading;

  useEffect(() => {
    if (metricsError) {
      toast({
        title: "Error fetching solar data",
        description: "Failed to retrieve NASA POWER data. Please try again.",
        variant: "destructive",
      });
    }
  }, [metricsError, toast]);

  const handleLocationSelect = (location: LocationData) => {
    setCurrentLocation(location);
    toast({
      title: "Location Updated",
      description: `Now analyzing ${location.name}`,
    });
  };

  const handleParametersChange = (parameters: MissionParameters) => {
    setMissionParameters(parameters);
  };

  const handleExportData = async () => {
    if (!currentLocation || !solarMetrics || !calculationResults) {
      toast({
        title: "No data to export",
        description: "Please select a location and wait for analysis to complete.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Dynamic imports
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title and header
      pdf.setFontSize(20);
      pdf.setTextColor(255, 215, 0); // NASA gold
      pdf.text('NASA Solar Analysis Report', 20, 25);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Location: ${currentLocation.name}`, 20, 35);
      pdf.text(`Coordinates: ${currentLocation.latitude.toFixed(4)}°, ${currentLocation.longitude.toFixed(4)}°`, 20, 42);
      pdf.text(`Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 49);
      
      // Add location analysis section
      pdf.setFontSize(16);
      pdf.setTextColor(255, 215, 0);
      pdf.text('Location Analysis', 20, 65);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      let yPos = 75;
      
      // Location details
      const locationText = [
        `Esta região está localizada nas coordenadas ${currentLocation.latitude.toFixed(4)}°, ${currentLocation.longitude.toFixed(4)}°.`,
        `A análise foi realizada utilizando dados satellitários da NASA POWER API, fornecendo`,
        `informações precisas sobre irradiação solar, condições meteorológicas e viabilidade`,
        `energética para missões espaciais.`
      ];
      
      locationText.forEach(line => {
        pdf.text(line, 20, yPos);
        yPos += 6;
      });
      
      // Solar metrics section
      yPos += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(255, 215, 0);
      pdf.text('Dados Solares em Tempo Real', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Irradiação Solar Diária: ${solarMetrics.dailyIrradiance.toFixed(2)} kWh/m²`, 20, yPos);
      yPos += 6;
      pdf.text(`Temperatura Ambiente: ${solarMetrics.temperature.toFixed(1)}°C`, 20, yPos);
      yPos += 6;
      pdf.text(`Eficiência do Sistema: ${solarMetrics.efficiency.toFixed(1)}%`, 20, yPos);
      yPos += 6;
      pdf.text(`Produção Pico: ${solarMetrics.peakOutput.toFixed(1)} kW`, 20, yPos);
      yPos += 6;
      pdf.text(`Produção Média Diária: ${solarMetrics.averageOutput.toFixed(1)} kWh`, 20, yPos);
      
      // Mission parameters section
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setTextColor(255, 215, 0);
      pdf.text('Parâmetros da Missão', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Área dos Painéis Solares: ${missionParameters.panelArea} m²`, 20, yPos);
      yPos += 6;
      pdf.text(`Eficiência do Sistema: ${(missionParameters.systemEfficiency * 100).toFixed(0)}%`, 20, yPos);
      yPos += 6;
      pdf.text(`Duração da Missão: ${missionParameters.missionDuration} dias`, 20, yPos);
      
      // Calculation results section
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setTextColor(255, 215, 0);
      pdf.text('Resultados dos Cálculos', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Energia Total Requerida: ${calculationResults.totalEnergyOutput.toFixed(0)} kWh`, 20, yPos);
      yPos += 6;
      pdf.text(`Capacidade de Bateria Necessária: ${calculationResults.batteryRequired.toFixed(0)} kWh`, 20, yPos);
      yPos += 6;
      pdf.text(`Viabilidade da Missão: ${calculationResults.missionViability ? 'VIÁVEL' : 'NÃO VIÁVEL'}`, 20, yPos);
      
      // Analysis and recommendations
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setTextColor(255, 215, 0);
      pdf.text('Análise Detalhada', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const analysisText = [
        `A região selecionada apresenta condições ${solarMetrics.efficiency > 85 ? 'excelentes' : solarMetrics.efficiency > 70 ? 'boas' : 'desafiadoras'}`,
        `para implementação de sistemas de energia solar. Com uma irradiação média de`,
        `${solarMetrics.dailyIrradiance.toFixed(2)} kWh/m² por dia, a localização ${calculationResults.missionViability ? 'atende' : 'não atende'} aos`,
        `requisitos energéticos para a missão planejada.`,
        ``,
        `Considerações importantes:`,
        `• Temperatura ambiente: ${solarMetrics.temperature > 30 ? 'Alta, pode afetar eficiência' : solarMetrics.temperature < 0 ? 'Baixa, requer aquecimento' : 'Dentro da faixa ideal'}`,
        `• Produção energética: ${solarMetrics.peakOutput > 50 ? 'Excelente capacidade' : 'Capacidade moderada'} de geração`,
        `• Variabilidade: ±${solarMetrics.variance.toFixed(1)} indica ${solarMetrics.variance < 15 ? 'baixa' : 'alta'} variabilidade`,
      ];
      
      analysisText.forEach(line => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, 20, yPos);
        yPos += 6;
      });
      
      // Try to capture main content as image
      try {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          const canvas = await html2canvas(mainContent, {
            backgroundColor: '#0B1426',
            scale: 1,
            useCORS: true,
            allowTaint: true,
            width: 800,
            height: 600,
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          // Add new page for chart
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.setTextColor(255, 215, 0);
          pdf.text('Dashboard Visual', 20, 25);
          
          // Add image to PDF
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, Math.min(imgHeight, pageHeight - 60));
        }
      } catch (error) {
        console.warn('Could not add dashboard image to PDF:', error);
      }
      
      // Save PDF
      const fileName = `nasa-solar-analysis-${currentLocation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Relatório exportado com sucesso",
        description: "Análise solar completa exportada como PDF.",
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Falha na exportação",
        description: "Não foi possível exportar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddToComparison = () => {
    if (!currentLocation) return;
    
    toast({
      title: "Added to comparison",
      description: `${currentLocation.name} has been added to comparison analysis.`,
    });
    // TODO: Implement comparison functionality
  };

  return (
    <div className="min-h-screen bg-nasa-blue text-white font-nasa overflow-hidden">
      <Header onExportData={handleExportData} />
      
      <div className="flex min-h-screen pt-20">
        <Sidebar
          currentLocation={currentLocation}
          onLocationSelect={handleLocationSelect}
          solarMetrics={solarMetrics || null}
          missionParameters={missionParameters}
          onParametersChange={handleParametersChange}
          calculationResults={calculationResults || null}
          onAddToComparison={handleAddToComparison}
        />
        
        <main className="flex-1 overflow-y-auto ml-80">
          <div className="p-6">
            <DataAnalysis
              solarMetrics={solarMetrics || null}
              currentLocation={currentLocation}
              calculationResults={calculationResults || null}
              missionParameters={missionParameters}
            />
          </div>
        </main>
      </div>

      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
