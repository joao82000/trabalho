import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const solarAnalysisProjects = pgTable("solar_analysis_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  elevation: real("elevation"),
  timezone: text("timezone"),
  panelArea: real("panel_area").notNull().default(10),
  systemEfficiency: real("system_efficiency").notNull().default(0.22),
  missionDuration: real("mission_duration").notNull().default(14),
  solarData: json("solar_data"),
  calculations: json("calculations"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const solarDataRecords = pgTable("solar_data_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => solarAnalysisProjects.id),
  date: text("date").notNull(),
  irradiance: real("irradiance").notNull(),
  temperature: real("temperature").notNull(),
  cloudCover: real("cloud_cover"),
  humidity: real("humidity"),
  windSpeed: real("wind_speed"),
  efficiency: real("efficiency"),
  energyOutput: real("energy_output"),
  dataSource: text("data_source").notNull().default("NASA_POWER"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const comparisonAnalyses = pgTable("comparison_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  projectIds: json("project_ids").$type<string[]>().notNull(),
  analysisType: text("analysis_type").notNull(),
  results: json("results"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSolarAnalysisProjectSchema = createInsertSchema(solarAnalysisProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSolarDataRecordSchema = createInsertSchema(solarDataRecords).omit({
  id: true,
  createdAt: true,
});

export const insertComparisonAnalysisSchema = createInsertSchema(comparisonAnalyses).omit({
  id: true,
  createdAt: true,
});

export type SolarAnalysisProject = typeof solarAnalysisProjects.$inferSelect;
export type InsertSolarAnalysisProject = z.infer<typeof insertSolarAnalysisProjectSchema>;
export type SolarDataRecord = typeof solarDataRecords.$inferSelect;
export type InsertSolarDataRecord = z.infer<typeof insertSolarDataRecordSchema>;
export type ComparisonAnalysis = typeof comparisonAnalyses.$inferSelect;
export type InsertComparisonAnalysis = z.infer<typeof insertComparisonAnalysisSchema>;

// Solar Data Types
export const solarDataSchema = z.object({
  dailyIrradiance: z.record(z.string(), z.number()),
  temperature: z.record(z.string(), z.number()),
  cloudCover: z.record(z.string(), z.number()).optional(),
  humidity: z.record(z.string(), z.number()).optional(),
  windSpeed: z.record(z.string(), z.number()).optional(),
});

export const calculationResultsSchema = z.object({
  totalEnergyOutput: z.number(),
  dailyAverage: z.number(),
  peakOutput: z.number(),
  efficiency: z.number(),
  batteryRequired: z.number(),
  missionViability: z.boolean(),
  recommendations: z.array(z.string()),
});

export type SolarData = z.infer<typeof solarDataSchema>;
export type CalculationResults = z.infer<typeof calculationResultsSchema>;
