import { afterEach, describe, expect, test } from 'bun:test'
import { api, ApiError } from '../src/services/api'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
describe('cliente HTTP (unitarias, no sustituyen E2E)', () => {
  test('envía JSON y Bearer solo cuando se solicitan', async () => {
    let request
    globalThis.fetch = async (url, options) => { request = { url, options }; return new Response('{"id":1}', { status: 201 }) }
    expect(await api('/api/pedidos', { method: 'POST', token: 'token-de-unit-test', body: { items: [] } })).toEqual({ id: 1 })
    expect(request.options.headers.Authorization).toBe('Bearer token-de-unit-test')
    expect(request.options.headers['Content-Type']).toBe('application/json')
    await api('/api/productos')
    expect(request.options.headers.Authorization).toBeUndefined()
  })
  test('propaga errores reales en texto sin éxito simulado', async () => {
    globalThis.fetch = async () => new Response('Stock insuficiente', { status: 400 })
    try { await api('/api/pedidos'); throw new Error('No debería completar') }
    catch (e) { expect(e).toBeInstanceOf(ApiError); expect(e.status).toBe(400); expect(e.message).toBe('Stock insuficiente') }
  })
  test('preserva validaciones por campo y conflictos', async () => {
    globalThis.fetch = async () => new Response('{"email":"Correo no válido"}', { status: 400 })
    await expect(api('/api/auth/register')).rejects.toMatchObject({ status: 400, fields: { email: 'Correo no válido' } })
    globalThis.fetch = async () => new Response('{"mensaje":"El correo ya está registrado"}', { status: 409 })
    await expect(api('/api/auth/register')).rejects.toMatchObject({ status: 409, message: 'El correo ya está registrado' })
  })
  test('maneja DELETE sin cuerpo', async () => {
    globalThis.fetch = async () => new Response(null, { status: 204 })
    expect(await api('/api/productos/1', { method: 'DELETE' })).toBeNull()
  })
  test('no convierte una caída de red en éxito', async () => {
    globalThis.fetch = async () => { throw new TypeError('Network failure') }
    await expect(api('/api/productos')).rejects.toMatchObject({ status: 0 })
  })
  test('respeta cancelación de consulta', async () => {
    globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }
    await expect(api('/api/productos')).rejects.toMatchObject({ name: 'AbortError' })
  })
})
