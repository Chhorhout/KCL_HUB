// API Configuration
// Automatically detects host IP for network access
// When accessed via localhost:5000 -> uses localhost APIs
// When accessed via 192.168.x.x:5000 -> uses 192.168.x.x APIs

// Get the current hostname/IP from the browser
const getApiBaseUrl = () => {
  // In browser, use window.location.hostname
  // This will be the IP address when accessed from network
  const hostname = window.location.hostname
  
  // If accessed via localhost, use localhost
  // If accessed via IP (192.168.x.x), use that IP
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost'
  }
  
  // Otherwise use the hostname (IP address)
  return `http://${hostname}`
}

// API Base URLs - automatically uses current host IP
export const API_BASE_URLS = {
  // IDP API (Authentication) - Port 5165
  IDP: `${getApiBaseUrl()}:5165/api`,
  
  // AMS API - Port 5092
  AMS: `${getApiBaseUrl()}:5092/api`,
  
  // HRMS API - Port 5045
  HRMS: `${getApiBaseUrl()}:5045/api`,
}

// Helper to get full API URL
export const getApiUrl = (service: 'IDP' | 'AMS' | 'HRMS', endpoint: string) => {
  const baseUrl = API_BASE_URLS[service]
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseUrl}/${cleanEndpoint}`
}

// Helper to get base URL for a service (without /api suffix)
export const getServiceBaseUrl = (service: 'IDP' | 'AMS' | 'HRMS') => {
  return API_BASE_URLS[service]
}

