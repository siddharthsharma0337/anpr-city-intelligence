/**
 * Centralized API configuration.
 * In development, Vite proxies /api and /socket.io to localhost:5000.
 * In production (Vercel), all requests go to the deployed Render backend.
 */

// The backend URL. Populated by Vite at build time via VITE_API_URL env var.
// Falls back to empty string (same origin) for development proxy support.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Build a full API URL from a relative path.
 * @param {string} path - e.g. '/api/health'
 * @returns {string}
 */
export const apiUrl = (path) => `${API_BASE_URL}${path}`;
