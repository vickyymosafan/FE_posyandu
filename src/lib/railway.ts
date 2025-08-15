/**
 * Railway Environment Configuration Utilities
 * Handles Railway-specific environment detection and configuration
 */

export interface RailwayConfig {
  isRailway: boolean;
  projectId?: string;
  serviceName?: string;
  environment?: string;
  deploymentId?: string;
  region?: string;
  frontendUrl?: string;
  backendUrl?: string;
}

/**
 * Detect if running in Railway environment
 */
export const isRailwayEnvironment = (): boolean => {
  return !!(
    process.env.RAILWAY_ENVIRONMENT || 
    process.env.RAILWAY_PROJECT_ID || 
    process.env.RAILWAY_SERVICE_NAME ||
    process.env.RAILWAY_DEPLOYMENT_ID
  );
};

/**
 * Get Railway configuration from environment variables
 */
export const getRailwayConfig = (): RailwayConfig => {
  const isRailway = isRailwayEnvironment();
  
  return {
    isRailway,
    projectId: process.env.RAILWAY_PROJECT_ID,
    serviceName: process.env.RAILWAY_SERVICE_NAME,
    environment: process.env.RAILWAY_ENVIRONMENT,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
    region: process.env.RAILWAY_REGION,
    frontendUrl: process.env.RAILWAY_FRONTEND_URL,
    backendUrl: process.env.RAILWAY_BACKEND_URL,
  };
};

/**
 * Get API base URL with Railway auto-detection
 */
export const getApiBaseUrl = (): string => {
  // Explicit API URL takes precedence
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  const config = getRailwayConfig();
  
  if (config.isRailway) {
    // Try Railway backend URL
    if (config.backendUrl) {
      return `${config.backendUrl}/api`;
    }
    
    // Try to construct Railway backend URL
    if (config.projectId) {
      const backendServiceName = process.env.RAILWAY_BACKEND_SERVICE_NAME || 'backend';
      return `https://${backendServiceName}-${config.projectId}.up.railway.app/api`;
    }
    
    // Fallback to generic Railway domain
    return 'https://posyandu-backend.up.railway.app/api';
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

/**
 * Get frontend URL with Railway auto-detection
 */
export const getFrontendUrl = (): string => {
  const config = getRailwayConfig();
  
  if (config.isRailway) {
    // Try explicit frontend URL
    if (config.frontendUrl) {
      return config.frontendUrl;
    }
    
    // Try to construct Railway frontend URL
    if (config.projectId) {
      const frontendServiceName = process.env.RAILWAY_FRONTEND_SERVICE_NAME || 'frontend';
      return `https://${frontendServiceName}-${config.projectId}.up.railway.app`;
    }
    
    // Fallback to generic Railway domain
    return 'https://posyandu-frontend.up.railway.app';
  }
  
  // Development fallback
  return 'http://localhost:3000';
};

/**
 * Check if current environment is Railway production
 */
export const isRailwayProduction = (): boolean => {
  const config = getRailwayConfig();
  return config.isRailway && (
    config.environment === 'production' || 
    process.env.NODE_ENV === 'production'
  );
};

/**
 * Get Railway service health check URL
 */
export const getHealthCheckUrl = (serviceName: 'frontend' | 'backend' = 'backend'): string => {
  const config = getRailwayConfig();
  
  if (config.isRailway && config.projectId) {
    return `https://${serviceName}-${config.projectId}.up.railway.app/api/health`;
  }
  
  return serviceName === 'backend' 
    ? 'http://localhost:5000/api/health'
    : 'http://localhost:3000/health';
};

/**
 * Log Railway configuration for debugging
 */
export const logRailwayConfig = (): void => {
  const config = getRailwayConfig();
  
  if (config.isRailway) {
    console.log('🚂 Railway Configuration:');
    console.log(`  Project ID: ${config.projectId || 'Unknown'}`);
    console.log(`  Service: ${config.serviceName || 'Unknown'}`);
    console.log(`  Environment: ${config.environment || 'Unknown'}`);
    console.log(`  Region: ${config.region || 'Unknown'}`);
    console.log(`  API URL: ${getApiBaseUrl()}`);
    console.log(`  Frontend URL: ${getFrontendUrl()}`);
  } else {
    console.log('🏠 Local Development Environment');
    console.log(`  API URL: ${getApiBaseUrl()}`);
    console.log(`  Frontend URL: ${getFrontendUrl()}`);
  }
};

/**
 * Railway-specific error handling
 */
export const handleRailwayError = (error: any, context: string): void => {
  const config = getRailwayConfig();
  
  console.error(`Railway Error in ${context}:`, {
    error: error.message || error,
    railway: config.isRailway,
    projectId: config.projectId,
    serviceName: config.serviceName,
    environment: config.environment,
    timestamp: new Date().toISOString()
  });
  
  // In Railway production, you might want to send errors to a monitoring service
  if (isRailwayProduction()) {
    // TODO: Integrate with Railway monitoring or external error tracking
    console.log('Railway production error logged for monitoring');
  }
};

export default {
  isRailwayEnvironment,
  getRailwayConfig,
  getApiBaseUrl,
  getFrontendUrl,
  isRailwayProduction,
  getHealthCheckUrl,
  logRailwayConfig,
  handleRailwayError,
};