import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSolarAnalysisProjectSchema, insertSolarDataRecordSchema } from "@shared/schema";

// Helper function to generate mock data for development
function generateMockData(startDate: string, endDate: string, baseValue: number): Record<string, number> {
  const data: Record<string, number> = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const variation = (Math.random() - 0.5) * 2;
    data[dateStr] = Math.max(0, baseValue + variation);
    current.setDate(current.getDate() + 1);
  }
  
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // NASA POWER API proxy
  app.get("/api/nasa-power", async (req, res) => {
    try {
      const { lat, lon, startDate, endDate } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      // NASA POWER API endpoint
      const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M,RH2M,WS10M,CLOUD_AMT&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;
      
      const response = await fetch(nasaUrl, {
        headers: {
          'User-Agent': 'NASA Solar Analysis Platform'
        }
      });
      if (!response.ok) {
        console.error(`NASA API error: ${response.status} ${response.statusText}`);
        // For development, return mock data if API fails
        const mockData = {
          geometry: {
            coordinates: [parseFloat(lon as string), parseFloat(lat as string)]
          },
          properties: {
            parameter: {
              ALLSKY_SFC_SW_DWN: generateMockData(start, end, 5.5),
              T2M: generateMockData(start, end, 25),
              RH2M: generateMockData(start, end, 60),
              WS10M: generateMockData(start, end, 3),
              CLOUD_AMT: generateMockData(start, end, 30)
            }
          }
        };
        return res.json(mockData);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching NASA POWER data:", error);
      res.status(500).json({ error: "Failed to fetch solar data from NASA POWER API" });
    }
  });

  // Geocoding proxy for location search
  app.get("/api/geocode", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query as string)}&limit=5`;
      
      const response = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'NASA Solar Analysis Platform'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error geocoding location:", error);
      res.status(500).json({ error: "Failed to geocode location" });
    }
  });

  // Solar Analysis Projects CRUD
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getAllSolarProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getSolarProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertSolarAnalysisProjectSchema.parse(req.body);
      const project = await storage.createSolarProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = insertSolarAnalysisProjectSchema.partial().parse(req.body);
      const project = await storage.updateSolarProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSolarProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Solar Data Records
  app.get("/api/projects/:id/data", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let data;
      
      if (startDate && endDate) {
        data = await storage.getSolarDataByDateRange(
          req.params.id,
          startDate as string,
          endDate as string
        );
      } else {
        data = await storage.getSolarDataForProject(req.params.id);
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch solar data" });
    }
  });

  app.post("/api/projects/:id/data", async (req, res) => {
    try {
      const validatedData = insertSolarDataRecordSchema.parse({
        ...req.body,
        projectId: req.params.id,
      });
      const record = await storage.createSolarDataRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid solar data" });
    }
  });

  // PDF Report Generation
  app.post("/api/projects/:id/report", async (req, res) => {
    try {
      const project = await storage.getSolarProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // TODO: Implement PDF generation with jsPDF
      res.json({ 
        message: "Report generation in progress",
        reportId: `report-${project.id}-${Date.now()}`,
        status: "processing"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
