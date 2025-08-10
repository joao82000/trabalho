# NASA Solar Analysis Platform

## Overview

This is a comprehensive solar energy analysis platform designed for NASA's space missions, specifically focused on evaluating solar energy potential for space exploration sites. The application integrates NASA POWER satellite data to provide detailed solar irradiance analysis, energy calculations, and mission planning capabilities. It features an interactive map interface for location selection, real-time data visualization, and comprehensive energy output calculations for space missions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based architecture using React 18 with TypeScript for type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built, customizable UI components with Radix UI primitives
- **TanStack Query**: Data fetching, caching, and synchronization for API calls
- **Wouter**: Lightweight client-side routing
- **Chart.js**: Data visualization for solar metrics and energy analysis
- **Leaflet**: Interactive mapping with NASA GIBS satellite imagery integration

### Backend Architecture
- **Express.js**: RESTful API server with middleware-based request handling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **NASA POWER API Integration**: Proxy endpoint for fetching solar irradiance and weather data
- **OpenStreetMap Geocoding**: Location search and coordinate resolution
- **Memory Storage**: In-memory data storage with interfaces for future database migration

### Data Layer
- **PostgreSQL**: Primary database using Drizzle ORM for schema management
- **Neon Database**: Cloud PostgreSQL provider for serverless database hosting
- **Schema Design**: Three main entities - Solar Analysis Projects, Solar Data Records, and Comparison Analyses
- **Data Caching**: Query result caching and stale-while-revalidate patterns

### Core Features
- **Solar Data Analysis**: Real-time processing of NASA POWER satellite data for irradiance, temperature, humidity, and cloud coverage
- **Energy Calculations**: Mission-specific energy output calculations considering panel efficiency, system losses, and environmental factors
- **Interactive Mapping**: Location selection with NASA GIBS satellite imagery and multiple map layers
- **Mission Planning**: Customizable parameters for panel area, system efficiency, and mission duration
- **Data Visualization**: Real-time charts and graphs for solar metrics analysis

## External Dependencies

### Data Sources
- **NASA POWER API**: Primary source for global solar irradiance and meteorological data
- **NASA GIBS**: Earth observation satellite imagery for map visualization
- **OpenStreetMap Nominatim**: Geocoding service for location search functionality

### Cloud Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit**: Development environment with integrated deployment

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL client optimized for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **@tanstack/react-query**: Advanced data fetching and state management
- **leaflet**: Interactive mapping library with tile layer support
- **chart.js**: Canvas-based charting for data visualization
- **@radix-ui/***: Accessible UI primitives for component library

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Build tool with fast HMR and optimized production builds
- **ESBuild**: Fast JavaScript bundler for server-side code
- **Tailwind CSS**: Utility-first styling with custom design system