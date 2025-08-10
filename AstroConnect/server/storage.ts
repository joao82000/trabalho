import { 
  type SolarAnalysisProject, 
  type InsertSolarAnalysisProject,
  type SolarDataRecord,
  type InsertSolarDataRecord,
  type ComparisonAnalysis,
  type InsertComparisonAnalysis 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Solar Analysis Projects
  getSolarProject(id: string): Promise<SolarAnalysisProject | undefined>;
  getAllSolarProjects(): Promise<SolarAnalysisProject[]>;
  createSolarProject(project: InsertSolarAnalysisProject): Promise<SolarAnalysisProject>;
  updateSolarProject(id: string, project: Partial<InsertSolarAnalysisProject>): Promise<SolarAnalysisProject | undefined>;
  deleteSolarProject(id: string): Promise<boolean>;

  // Solar Data Records
  getSolarDataForProject(projectId: string): Promise<SolarDataRecord[]>;
  createSolarDataRecord(record: InsertSolarDataRecord): Promise<SolarDataRecord>;
  getSolarDataByDateRange(projectId: string, startDate: string, endDate: string): Promise<SolarDataRecord[]>;

  // Comparison Analyses
  getComparisonAnalysis(id: string): Promise<ComparisonAnalysis | undefined>;
  getAllComparisonAnalyses(): Promise<ComparisonAnalysis[]>;
  createComparisonAnalysis(analysis: InsertComparisonAnalysis): Promise<ComparisonAnalysis>;
}

export class MemStorage implements IStorage {
  private solarProjects: Map<string, SolarAnalysisProject>;
  private solarDataRecords: Map<string, SolarDataRecord>;
  private comparisonAnalyses: Map<string, ComparisonAnalysis>;

  constructor() {
    this.solarProjects = new Map();
    this.solarDataRecords = new Map();
    this.comparisonAnalyses = new Map();
    
    // Initialize with Kennedy Space Center example
    const kscProject: SolarAnalysisProject = {
      id: "ksc-001",
      name: "Kennedy Space Center Analysis",
      description: "NASA launch facility solar energy analysis",
      latitude: 28.5721,
      longitude: -80.6480,
      elevation: 3,
      timezone: "UTC-5",
      panelArea: 100,
      systemEfficiency: 0.22,
      missionDuration: 14,
      solarData: null,
      calculations: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.solarProjects.set(kscProject.id, kscProject);
  }

  async getSolarProject(id: string): Promise<SolarAnalysisProject | undefined> {
    return this.solarProjects.get(id);
  }

  async getAllSolarProjects(): Promise<SolarAnalysisProject[]> {
    return Array.from(this.solarProjects.values());
  }

  async createSolarProject(project: InsertSolarAnalysisProject): Promise<SolarAnalysisProject> {
    const id = randomUUID();
    const now = new Date();
    const newProject: SolarAnalysisProject = { 
      ...project, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.solarProjects.set(id, newProject);
    return newProject;
  }

  async updateSolarProject(id: string, project: Partial<InsertSolarAnalysisProject>): Promise<SolarAnalysisProject | undefined> {
    const existing = this.solarProjects.get(id);
    if (!existing) return undefined;
    
    const updated: SolarAnalysisProject = {
      ...existing,
      ...project,
      updatedAt: new Date(),
    };
    this.solarProjects.set(id, updated);
    return updated;
  }

  async deleteSolarProject(id: string): Promise<boolean> {
    return this.solarProjects.delete(id);
  }

  async getSolarDataForProject(projectId: string): Promise<SolarDataRecord[]> {
    return Array.from(this.solarDataRecords.values()).filter(
      record => record.projectId === projectId
    );
  }

  async createSolarDataRecord(record: InsertSolarDataRecord): Promise<SolarDataRecord> {
    const id = randomUUID();
    const newRecord: SolarDataRecord = { 
      ...record, 
      id, 
      createdAt: new Date() 
    };
    this.solarDataRecords.set(id, newRecord);
    return newRecord;
  }

  async getSolarDataByDateRange(projectId: string, startDate: string, endDate: string): Promise<SolarDataRecord[]> {
    return Array.from(this.solarDataRecords.values()).filter(
      record => 
        record.projectId === projectId && 
        record.date >= startDate && 
        record.date <= endDate
    );
  }

  async getComparisonAnalysis(id: string): Promise<ComparisonAnalysis | undefined> {
    return this.comparisonAnalyses.get(id);
  }

  async getAllComparisonAnalyses(): Promise<ComparisonAnalysis[]> {
    return Array.from(this.comparisonAnalyses.values());
  }

  async createComparisonAnalysis(analysis: InsertComparisonAnalysis): Promise<ComparisonAnalysis> {
    const id = randomUUID();
    const newAnalysis: ComparisonAnalysis = { 
      ...analysis, 
      id, 
      createdAt: new Date() 
    };
    this.comparisonAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
}

export const storage = new MemStorage();
