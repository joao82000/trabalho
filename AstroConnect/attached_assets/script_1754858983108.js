class SolarLaunchApp {
    constructor() {
        this.map = null;
        this.marker = null;
        this.solarChart = null;
        this.currentLocation = null;
        this.solarData = null;
        this.lastRequestTime = 0;
        this.requestCache = {};
        
        this.initMap();
        this.initEventListeners();
        this.initDarkMode();
        this.checkUrlParams();
    }
    
    initMap() {
        this.map = L.map('map').setView([0, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        L.tileLayer('https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.{format}', {
            attribution: 'Imagery provided by NASA GIBS',
            bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
            minZoom: 1,
            maxZoom: 9,
            format: 'jpg',
            time: new Date().toISOString().split('T')[0],
            tileMatrixSet: 'GoogleMapsCompatible_Level9',
            subdomains: ['a', 'b', 'c', 'd', 'e']
        }).addTo(this.map);
    }
    
    initEventListeners() {
        this.map.on('click', (e) => this.handleMapClick(e));
        
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('location-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadSampleData(e.target.dataset.location));
        });
        
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculateEnergyOutput());
        document.getElementById('export-csv').addEventListener('click', () => this.exportToCSV());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportToPDF());
        document.getElementById('share-btn').addEventListener('click', () => this.shareLocation());
    }
    
    initDarkMode() {
        const themeToggle = document.getElementById('theme-toggle');
        const darkModeStyle = document.getElementById('dark-mode-style');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (localStorage.getItem('darkMode') {
            if (localStorage.getItem('darkMode') === 'enabled') {
                darkModeStyle.disabled = false;
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        } else if (prefersDark) {
            darkModeStyle.disabled = false;
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'enabled');
        }
        
        themeToggle.addEventListener('click', () => {
            if (darkModeStyle.disabled) {
                darkModeStyle.disabled = false;
                localStorage.setItem('darkMode', 'enabled');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                darkModeStyle.disabled = true;
                localStorage.setItem('darkMode', 'disabled');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }
    
    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('lat') && params.has('lon')) {
            const lat = parseFloat(params.get('lat'));
            const lon = parseFloat(params.get('lon'));
            this.map.setView([lat, lon], 12);
            this.fetchSolarData(lat, lon);
        }
    }
    
    handleMapClick(e) {
        this.currentLocation = e.latlng;
        this.updateLocationInfo();
        this.fetchSolarData(e.latlng.lat, e.latlng.lng);
    }
    
    handleSearch() {
        const query = document.getElementById('location-search').value.trim();
        if (!query) return;
        
        this.showLoading(true);
        
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const firstResult = data[0];
                    const lat = parseFloat(firstResult.lat);
                    const lon = parseFloat(firstResult.lon);
                    
                    this.currentLocation = { lat, lng: lon };
                    this.map.setView([lat, lon], 12);
                    this.updateLocationInfo(firstResult.display_name);
                    this.fetchSolarData(lat, lon);
                } else {
                    this.showNotification('Local não encontrado. Tente outro endereço.');
                }
            })
            .catch(() => {
                this.showNotification('Erro ao buscar localização. Tente novamente.');
            })
            .finally(() => {
                this.showLoading(false);
            });
    }
    
    updateLocationInfo(address) {
        if (!this.currentLocation) return;
        
        const locationElement = document.getElementById('selected-location');
        const coordinatesElement = document.getElementById('coordinates');
        
        if (address) {
            locationElement.textContent = address;
        } else {
            locationElement.textContent = `Lat: ${this.currentLocation.lat.toFixed(4)}, Lon: ${this.currentLocation.lng.toFixed(4)}`;
        }
        
        coordinatesElement.textContent = `Lat: ${this.currentLocation.lat.toFixed(4)}, Lon: ${this.currentLocation.lng.toFixed(4)}`;
        
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        
        this.marker = L.marker([this.currentLocation.lat, this.currentLocation.lng]).addTo(this.map)
            .bindPopup('Local selecionado').openPopup();
    }
    
    fetchSolarData(lat, lon) {
        const now = Date.now();
        const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
        
        if (this.requestCache[cacheKey] && now - this.lastRequestTime < 3600000) {
            this.processSolarData(this.requestCache[cacheKey]);
            return;
        }
        
        this.showLoading(true);
        
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const endDate = new Date();
        
        const params = new URLSearchParams({
            lat: lat,
            lon: lon,
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });
        
        fetch(`/.netlify/functions/proxy-power?${params.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error('Erro na requisição');
                return response.json();
            })
            .then(data => {
                this.requestCache[cacheKey] = data;
                this.lastRequestTime = now;
                this.processSolarData(data);
            })
            .catch(error => {
                console.error('Error fetching solar data:', error);
                this.showNotification('Erro ao buscar dados solares. Tente novamente.');
            })
            .finally(() => {
                this.showLoading(false);
            });
    }
    
    processSolarData(data) {
        if (!data || !data.properties || !data.properties.parameter) {
            this.showNotification('Dados solares não disponíveis para este local.');
            return;
        }
        
        this.solarData = data;
        
        const allDays = data.properties.parameter.ALLSKY_SFC_SW_DWN;
        const tempDays = data.properties.parameter.T2M;
        
        const avgIrradiance = Object.values(allDays).reduce((sum, val) => sum + val, 0) / Object.values(allDays).length;
        const avgTemperature = Object.values(tempDays).reduce((sum, val) => sum + val, 0) / Object.values(tempDays).length;
        
        document.getElementById('avg-irradiance').textContent = `${avgIrradiance.toFixed(2)} kWh/m²/dia`;
        document.getElementById('avg-temperature').textContent = `${avgTemperature.toFixed(1)} °C`;
        
        this.updateChart(allDays, tempDays);
        this.updateRecommendations(avgIrradiance, avgTemperature);
        this.calculateEnergyOutput();
    }
    
    updateChart(irradianceData, temperatureData) {
        const ctx = document.getElementById('solar-chart').getContext('2d');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const monthlyIrradiance = {};
        const monthlyTemperature = {};
        
        Object.keys(irradianceData).forEach(date => {
            const month = new Date(date).getMonth();
            if (!monthlyIrradiance[month]) {
                monthlyIrradiance[month] = { sum: 0, count: 0 };
                monthlyTemperature[month] = { sum: 0, count: 0 };
            }
            monthlyIrradiance[month].sum += irradianceData[date];
            monthlyIrradiance[month].count++;
            monthlyTemperature[month].sum += temperatureData[date];
            monthlyTemperature[month].count++;
        });
        
        const irradianceValues = months.map((_, i) => 
            monthlyIrradiance[i] ? monthlyIrradiance[i].sum / monthlyIrradiance[i].count : 0
        );
        
        const temperatureValues = months.map((_, i) => 
            monthlyTemperature[i] ? monthlyTemperature[i].sum / monthlyTemperature[i].count : 0
        );
        
        if (this.solarChart) {
            this.solarChart.destroy();
        }
        
        this.solarChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Irradiância Solar (kWh/m²/dia)',
                        data: irradianceValues,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Temperatura Média (°C)',
                        data: temperatureValues,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Irradiância (kWh/m²/dia)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    updateRecommendations(avgIrradiance, avgTemperature) {
        const recommendationElement = document.getElementById('recommendation-text');
        
        let recommendation = '';
        let efficiencyNote = '';
        
        if (avgIrradiance > 5.5) {
            recommendation = 'Excelente local para instalação solar. Alta irradiância durante todo o ano.';
        } else if (avgIrradiance > 4.0) {
            recommendation = 'Bom local para instalação solar. Irradiância satisfatória na maior parte do ano.';
        } else if (avgIrradiance > 2.5) {
            recommendation = 'Local moderado para instalação solar. Considere painéis de alta eficiência.';
        } else {
            recommendation = 'Local com baixa irradiância solar. Avalie cuidadosamente a viabilidade econômica.';
        }
        
        if (avgTemperature > 30) {
            efficiencyNote = ' Atenção: temperaturas elevadas podem reduzir a eficiência dos painéis. Considere sistemas de resfriamento ou painéis com melhor coeficiente térmico.';
        } else if (avgTemperature < 0) {
            efficiencyNote = ' Em temperaturas muito baixas, a eficiência pode aumentar, mas a neve pode cobrir os painéis. Considere sistemas de limpeza.';
        }
        
        recommendationElement.textContent = recommendation + efficiencyNote;
    }
    
    calculateEnergyOutput() {
        if (!this.solarData) return;
        
        const panelArea = parseFloat(document.getElementById('panel-area').value) || 10;
        const panelEfficiency = (parseFloat(document.getElementById('panel-efficiency').value) || 20) / 100;
        const systemLosses = (parseFloat(document.getElementById('system-losses').value) || 14) / 100;
        
        const allDays = this.solarData.properties.parameter.ALLSKY_SFC_SW_DWN;
        const avgDailyIrradiance = Object.values(allDays).reduce((sum, val) => sum + val, 0) / Object.values(allDays).length;
        
        const avgDailyEnergy = avgDailyIrradiance * panelArea * panelEfficiency * (1 - systemLosses);
        const monthlyEnergy = avgDailyEnergy * 30;
        
        document.getElementById('energy-output').textContent = `${monthlyEnergy.toFixed(1)} kWh/mês`;
    }
    
    exportToCSV() {
        if (!this.solarData || !this.currentLocation) {
            this.showNotification('Nenhum dado disponível para exportar.');
            return;
        }
        
        const allDays = this.solarData.properties.parameter.ALLSKY_SFC_SW_DWN;
        const tempDays = this.solarData.properties.parameter.T2M;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Data,Irradiância Solar (kWh/m²/dia),Temperatura Média (°C)\n";
        
        Object.keys(allDays).forEach(date => {
            csvContent += `${date},${allDays[date]},${tempDays[date]}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `solar_data_${this.currentLocation.lat.toFixed(4)}_${this.currentLocation.lng.toFixed(4)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    exportToPDF() {
        if (!this.solarData || !this.currentLocation) {
            this.showNotification('Nenhum dado disponível para exportar.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const allDays = this.solarData.properties.parameter.ALLSKY_SFC_SW_DWN;
        const tempDays = this.solarData.properties.parameter.T2M;
        const avgIrradiance = Object.values(allDays).reduce((sum, val) => sum + val, 0) / Object.values(allDays).length;
        const avgTemperature = Object.values(tempDays).reduce((sum, val) => sum + val, 0) / Object.values(tempDays).length;
        
        doc.setFontSize(18);
        doc.text('Relatório SolarLaunch', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Local: ${document.getElementById('selected-location').textContent}`, 15, 25);
        doc.text(`Coordenadas: Lat ${this.currentLocation.lat.toFixed(4)}, Lon ${this.currentLocation.lng.toFixed(4)}`, 15, 30);
        
        doc.text(`Irradiância Média: ${avgIrradiance.toFixed(2)} kWh/m²/dia`, 15, 40);
        doc.text(`Temperatura Média: ${avgTemperature.toFixed(1)} °C`, 15, 45);
        
        const panelArea = parseFloat(document.getElementById('panel-area').value) || 10;
        const panelEfficiency = (parseFloat(document.getElementById('panel-efficiency').value) || 20) / 100;
        const systemLosses = (parseFloat(document.getElementById('system-losses').value) || 14) / 100;
        
        doc.text(`Configuração do Sistema:`, 15, 55);
        doc.text(`- Área do Painel: ${panelArea} m²`, 20, 60);
        doc.text(`- Eficiência: ${(panelEfficiency * 100).toFixed(1)}%`, 20, 65);
        doc.text(`- Perdas do Sistema: ${(systemLosses * 100).toFixed(1)}%`, 20, 70);
        
        const avgDailyEnergy = avgIrradiance * panelArea * panelEfficiency * (1 - systemLosses);
        const monthlyEnergy = avgDailyEnergy * 30;
        
        doc.text(`Produção Estimada: ${monthlyEnergy.toFixed(1)} kWh/mês`, 15, 80);
        
        doc.text(`Recomendações:`, 15, 90);
        doc.text(document.getElementById('recommendation-text').textContent, 20, 95, { maxWidth: 170 });
        
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Dados Mensais', 105, 15, { align: 'center' });
        
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthlyIrradiance = {};
        const monthlyTemperature = {};
        
        Object.keys(allDays).forEach(date => {
            const month = new Date(date).getMonth();
            if (!monthlyIrradiance[month]) {
                monthlyIrradiance[month] = { sum: 0, count: 0 };
                monthlyTemperature[month] = { sum: 0, count: 0 };
            }
            monthlyIrradiance[month].sum += allDays[date];
            monthlyIrradiance[month].count++;
            monthlyTemperature[month].sum += tempDays[date];
            monthlyTemperature[month].count++;
        });
        
        const tableData = months.map((month, i) => [
            month,
            monthlyIrradiance[i] ? (monthlyIrradiance[i].sum / monthlyIrradiance[i].count).toFixed(2) : '-',
            monthlyTemperature[i] ? (monthlyTemperature[i].sum / monthlyTemperature[i].count).toFixed(1) : '-'
        ]);
        
        doc.autoTable({
            startY: 25,
            head: [['Mês', 'Irradiância (kWh/m²/dia)', 'Temp. Média (°C)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [52, 152, 219] }
        });
        
        doc.save(`relatorio_solar_${this.currentLocation.lat.toFixed(4)}_${this.currentLocation.lng.toFixed(4)}.pdf`);
    }
    
    shareLocation() {
        if (!this.currentLocation) {
            this.showNotification('Nenhum local selecionado para compartilhar.');
            return;
        }
        
        const url = new URL(window.location.href);
        url.searchParams.set('lat', this.currentLocation.lat.toFixed(4));
        url.searchParams.set('lon', this.currentLocation.lng.toFixed(4));
        
        if (navigator.share) {
            navigator.share({
                title: 'SolarLaunch - Dados Solares',
                text: 'Confira este local para instalação de painéis solares:',
                url: url.toString()
            }).catch(() => {
                this.copyToClipboard(url.toString());
            });
        } else {
            this.copyToClipboard(url.toString());
        }
    }
    
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('Link copiado para a área de transferência!');
    }
    
    loadSampleData(sampleType) {
        let sampleData;
        
        switch (sampleType) {
            case 'tropical':
                sampleData = {
                    lat: -3.107,
                    lng: -60.025,
                    name: 'Manaus, AM - Brasil (Tropical)'
                };
                break;
            case 'temperate':
                sampleData = {
                    lat: 48.8566,
                    lng: 2.3522,
                    name: 'Paris, França (Temperado)'
                };
                break;
            case 'desert':
                sampleData = {
                    lat: 24.7136,
                    lng: 46.6753,
                    name: 'Riade, Arábia Saudita (Desértico)'
                };
                break;
            default:
                return;
        }
        
        this.currentLocation = { lat: sampleData.lat, lng: sampleData.lng };
        this.map.setView([sampleData.lat, sampleData.lng], 12);
        this.updateLocationInfo(sampleData.name);
        
        fetch(`data/sample-${sampleType}.json`)
            .then(response => response.json())
            .then(data => {
                this.processSolarData(data);
            })
            .catch(error => {
                console.error('Error loading sample data:', error);
                this.showNotification('Erro ao carregar dados de exemplo.');
            });
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = show ? 'flex' : 'none';
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SolarLaunchApp();
});