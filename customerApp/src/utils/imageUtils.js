const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

export const buildImageUrl = path => {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${cleanPath}`;
};
