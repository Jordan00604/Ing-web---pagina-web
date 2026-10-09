export const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD'
export const money = (value) => new Intl.NumberFormat('es', { style: 'currency', currency: CURRENCY }).format(Number(value || 0))
export const date = (value) => value ? new Date(value).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
export const imageUrl = (url) => {
  if (!url) return '/product-placeholder.svg'
  try { const parsed = new URL(url, window.location.origin); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '/product-placeholder.svg' }
  catch { return '/product-placeholder.svg' }
}
