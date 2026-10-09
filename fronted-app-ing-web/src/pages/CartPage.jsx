import { useRef, useState } from 'react'
import { useAuth, useCart } from '../context/contexts'
import { useApi } from '../hooks/useApi'
import { api, ApiError } from '../services/api'
import { money } from '../services/format'
import { navigate } from '../services/router'
import { Link, Feedback, Quantity, ProductImage, Icon, ConfirmDialog } from '../components/UI'

export function CartPage() {
  const cart = useCart(), auth = useAuth()
  const [revision, setRevision] = useState(0)
  const products = useApi('/api/productos', null, revision)
  const [busy, setBusy] = useState(false), [error, setError] = useState(null), [confirmClear, setConfirmClear] = useState(false)
  const submitting = useRef(false)
  const rows = cart.items.map(item => ({ ...item, product: products.data?.find(p => p.id === item.productoId) }))
  const total = rows.reduce((sum, row) => sum + (row.product?.precio || 0) * row.cantidad, 0)
  const invalid = rows.some(row => !row.product || row.cantidad > row.product.stock)
  async function checkout() {
    if (submitting.current) return
    if (!auth.token) { navigate('/login?next=%2Fcarrito'); return }
    submitting.current = true; setBusy(true); setError(null)
    let sent = false
    try {
      const fresh = await Promise.all(cart.items.map(item => api(`/api/productos/${item.productoId}`)))
      cart.items.forEach((item, index) => { if (fresh[index].stock < item.cantidad) throw new ApiError(`Stock insuficiente para ${fresh[index].nombre}. Actualiza tu bolsa.`) })
      if (fresh.some(p => Number(p.precio) !== Number(rows.find(row => row.productoId === p.id)?.product?.precio))) {
        setRevision(value => value + 1)
        throw new ApiError('Los precios cambiaron. Revisa el total actualizado antes de confirmar.')
      }
      sent = true
      const pedido = await api('/api/pedidos', { method: 'POST', token: auth.token, body: { items: cart.items.map(({ productoId, cantidad }) => ({ productoId, cantidad })) } })
      cart.clear(); navigate(`/confirmacion/${pedido.id}`)
    } catch (e) {
      setError(new ApiError(sent && !e.status ? `${e.message} No se confirmó la respuesta; consulta tu historial antes de volver a enviar para evitar duplicados.` : e.message, e.status))
      setRevision(value => value + 1)
    } finally { submitting.current = false; setBusy(false) }
  }
  return <div className="container page"><div className="breadcrumbs"><Link href="/">Inicio</Link> / Mi carrito</div><div className="page-heading"><span className="eyebrow">Tu selección personal</span><h1>Bolsa de compras</h1><p>Revisa tus prendas antes de registrar el pedido.</p></div>{cart.items.length === 0 ? <Feedback empty="Tu bolsa está vacía" /> : <><Feedback {...products} retry={() => setRevision(revision + 1)} />{products.data && <div className="two-column"><section><div className="section-heading"><h3>{cart.items.length} prendas · {cart.count} unidades</h3><span className="muted small">Cantidad / Subtotal</span></div><fieldset className="cart-items" disabled={busy}>{rows.map(row => <article className="cart-row" key={row.productoId}><ProductImage src={row.product?.imagenUrl} alt={row.product?.nombre || 'Prenda no disponible'} /><div><span className="eyebrow">{row.product?.categoria || 'Colección'}</span><h3>{row.product ? <Link href={`/productos/${row.productoId}`}>{row.product.nombre}</Link> : 'Prenda no disponible'}</h3><p className="small muted">Talla: {row.product?.talla || '—'} · Color: {row.product?.color || '—'}</p><p>{money(row.product?.precio)} / unidad</p>{(!row.product || row.cantidad > row.product.stock) && <p className="error-text small">{row.product ? `Solo ${row.product.stock} unidades disponibles. Ajusta o elimina esta prenda.` : 'Ya no está en el catálogo. Elimínala para continuar.'}</p>}<button className="text-link small" onClick={() => cart.remove(row.productoId)}><Icon name="trash" size={15} /> Quitar</button></div><div className="cart-row-end"><Quantity label={`Cantidad de ${row.product?.nombre || 'prenda'}`} value={row.cantidad} max={Math.max(1, row.product?.stock || 1)} onChange={quantity => cart.update(row.productoId, quantity)} /><strong>{money((row.product?.precio || 0) * row.cantidad)}</strong></div></article>)}</fieldset><div className="actions cart-actions"><Link href="/catalogo" className="text-link">← Continuar comprando</Link><button className="text-link" disabled={busy} onClick={() => setConfirmClear(true)}>Vaciar carrito</button><button className="text-link" disabled={busy} onClick={() => setRevision(revision + 1)}>Actualizar disponibilidad</button></div><div className="panel subtle small">La bolsa se guarda solo en este navegador, sin sincronización entre dispositivos. El precio definitivo lo calcula el servidor al registrar el pedido.</div></section><aside className="order-summary panel"><span className="eyebrow">Fashion World</span><h2>Resumen del pedido</h2><div className="summary-line"><span>Subtotal ({cart.count} unidades)</span><span>{money(total)}</span></div><div className="summary-line muted small"><span>Pagos y envíos</span><span>No incluidos</span></div><div className="summary-total"><span>Total estimado</span><strong>{money(total)}</strong></div><p className="small muted">Este paso registra un pedido. No se solicita tarjeta ni se realiza ningún cobro.</p>{error && <p className="form-error" role="alert">{error.message}</p>}<button className="button full" disabled={busy || invalid} onClick={checkout}>{busy ? 'Registrando pedido…' : auth.token ? 'Confirmar pedido' : 'Iniciar sesión para pedir'}<Icon name="arrow" /></button>{!auth.token && <p className="small">¿Primera visita? <Link className="text-link" href="/registro?next=%2Fcarrito">Crea tu cuenta</Link></p>}</aside></div>}</>}{confirmClear && <ConfirmDialog title="¿Vaciar tu bolsa?" onCancel={() => setConfirmClear(false)} onConfirm={() => { cart.clear(); setConfirmClear(false) }}>Se quitarán todas las prendas de este navegador.</ConfirmDialog>}</div>
}
