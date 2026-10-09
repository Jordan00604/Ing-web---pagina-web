import { useEffect, useId, useState } from 'react'
import { navigate } from '../services/router'
import { imageUrl } from '../services/format'

export function Link({ href, children, onClick, ...props }) {
  return <a href={href} {...props} onClick={event => {
    onClick?.(event)
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !props.target) {
      event.preventDefault(); navigate(href)
    }
  }}>{children}</a>
}
export function Icon({ name, size = 20 }) {
  const paths = { bag: 'M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2', user: 'M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8', search: 'm21 21-5-5M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0', arrow: 'M4 12h16m-6-6 6 6-6 6', menu: 'M3 6h18M3 12h18M3 18h18', close: 'm6 6 12 12M18 6 6 18', check: 'm5 12 4 4L19 6', box: 'M3 7 12 3l9 4v10l-9 4-9-4V7Zm0 0 9 5 9-5M12 12v9', trash: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7', edit: 'm4 16 12-12 4 4L8 20H4v-4Z', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm7 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0' }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.arrow} /></svg>
}
export function Field({ label, error, children, ...props }) {
  const id = useId()
  return <label className="field" htmlFor={id}><span>{label}</span>{children || <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />}{error && <small className="error-text" id={`${id}-error`}>{error}</small>}</label>
}
export function PasswordField({ label = 'Contraseña', ...props }) {
  const [visible, setVisible] = useState(false)
  return <div className="password-field"><Field label={label} type={visible ? 'text' : 'password'} {...props} /><button type="button" className="password-toggle" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVisible(!visible)}><Icon name="eye" /></button></div>
}
export function Feedback({ error, loading, empty, retry }) {
  if (loading) return <div className="feedback" role="status"><span className="spinner" /> Cargando…</div>
  if (error) return <div className="feedback error" role="alert"><h3>No se pudo completar la consulta</h3><p>{error.message || error}</p>{retry && <button className="button secondary" onClick={retry}>Reintentar</button>}</div>
  if (empty) return <div className="feedback"><Icon name="bag" size={32} /><h3>{empty}</h3><Link href="/catalogo" className="text-link">Explorar el catálogo →</Link></div>
  return null
}
export function ProductImage({ src, alt, ...props }) {
  return <img src={imageUrl(src)} alt={alt} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/product-placeholder.svg' }} {...props} />
}
export function Quantity({ value, max = 9999, onChange, label = 'Cantidad' }) {
  const id = useId()
  return <div className="quantity"><button type="button" aria-label={`Reducir ${label}`} disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button><input id={id} aria-label={label} type="number" min="1" max={max} value={value} onChange={event => { const next = Number(event.target.value); if (Number.isInteger(next) && next >= 1 && next <= max) onChange(next) }} /><button type="button" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button></div>
}
export function Badge({ children }) { return <span className="badge">{children}</span> }
export function ConfirmDialog({ title, children, onCancel, onConfirm, busy }) {
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <div className="modal-backdrop"><div className="modal" role="alertdialog" aria-modal="true" aria-label={title} onKeyDown={event => { if (event.key === 'Escape' && !busy) onCancel(); if (event.key === 'Tab') { const nodes = event.currentTarget.querySelectorAll('button:not(:disabled)'); if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes[nodes.length - 1]?.focus() } else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0]?.focus() } } }}><Icon name="trash" size={32} /><h2>{title}</h2><p>{children}</p><div className="actions"><button autoFocus className="button secondary" disabled={busy} onClick={onCancel}>Cancelar</button><button className="button danger" disabled={busy} onClick={onConfirm}>{busy ? 'Procesando…' : 'Confirmar'}</button></div></div></div>
}
