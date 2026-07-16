export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  return response;
}

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Clean up API_BASE to get the root URL (e.g., remove /api)
  let baseUrl = API_BASE ? API_BASE.replace(/\/api\/?$/, '') : '';
  
  // If baseUrl is somehow a domain without protocol (like .stellahitech.com), add https://
  if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    // strip leading dot if it exists
    if (baseUrl.startsWith('.')) baseUrl = baseUrl.slice(1);
    baseUrl = `https://${baseUrl}`;
  }

  // Force /uploads/ paths to go through /api/uploads/ so reverse proxies catch them
  if (path.startsWith('/uploads/')) {
    path = '/api' + path;
  }

  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/${path}`;
}
