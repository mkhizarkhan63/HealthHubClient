export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7163';

export const API_ENDPOINTS = {
  CALLS: `${API_BASE_URL}/api/calls`,
  AGENT_CONFIG: `${API_BASE_URL}/api/agent/config`,
  AGENT_KNOWLEDGEBASE: `${API_BASE_URL}/api/agent/knowledgebase`,
}; 