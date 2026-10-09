export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, '')

export async function api(path, { method = 'GET', body, token, signal } = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method, signal,
      headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }) },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('No se pudo conectar con la tienda. Revisa la conexión e inténtalo de nuevo.')
  }
  const text = await response.text()
  let data = text
  try { data = text ? JSON.parse(text) : null } catch { /* Los errores también pueden ser texto. */ }
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('session-expired'))
    const fields = data && typeof data === 'object' ? data : {}
    const message = fields.mensaje || fields.detail || fields.message ||
      (typeof data === 'string' && data) ||
      ({ 401: 'Tu sesión no es válida. Inicia sesión de nuevo.', 403: 'No tienes permiso para realizar esta acción.',
        404: 'No encontramos el recurso solicitado.', 409: 'El registro está en uso o ya existe.' }[response.status]) ||
      'No se pudo completar la operación.'
    throw new ApiError(message, response.status, fields)
  }
  return data
}
