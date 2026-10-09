import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/contexts'
import { api } from '../services/api'
import { date, money } from '../services/format'
import { navigate } from '../services/router'
import { Link, Feedback, Field, Icon, ProductImage, Badge, ConfirmDialog } from '../components/UI'
import { OrderDetails } from '../components/OrderDetails'

export function AdminProductsPage() {
  const auth = useAuth()
  const [revision, setRevision] = useState(0), [query, setQuery] = useState(''), [category, setCategory] = useState('')
  const [remove, setRemove] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(null), [notice, setNotice] = useState('')
  const result = useApi('/api/productos', null, revision)
  const products = result.data || []
  const list = products.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase()) && (!category || p.categoria === category))
  async function deleteProduct() {
    setBusy(true); setError(null)
    try { await api(`/api/productos/${remove.id}`, { method: 'DELETE', token: auth.token }); setNotice('Prenda eliminada del catálogo.'); setRemove(null); setRevision(value => value + 1) }
    catch (e) { setError(e); setRemove(null) } finally { setBusy(false) }
  }
  return <><div className="breadcrumbs">Fashion World / Panel de inventario</div><div className="page-heading with-action"><div><span className="eyebrow">Gestión Atelier</span><h1>Inventario y catálogo</h1><p>Gestiona prendas y existencias con una talla y un color por referencia.</p></div><Link className="button" href="/admin/productos/nuevo">+ Nuevo producto</Link></div><div className="stats"><div className="panel"><span className="eyebrow">Referencias del catálogo</span><strong>{result.data ? products.length : '—'}</strong></div><div className="panel"><span className="eyebrow">Prendas agotadas</span><strong>{result.data ? products.filter(p => p.stock === 0).length : '—'}</strong></div><div className="panel"><span className="eyebrow">Valor de inventario</span><strong>{result.data ? money(products.reduce((sum, p) => sum + p.precio * p.stock, 0)) : '—'}</strong></div></div><div className="admin-toolbar panel"><Field label="Buscar prenda" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre…" /><label className="field"><span>Categoría</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas las categorías</option>{[...new Set(products.map(p => p.categoria).filter(Boolean))].map(c => <option key={c}>{c}</option>)}</select></label><button className="button secondary" onClick={() => setRevision(revision + 1)}>Actualizar</button></div>{notice && <p className="notice inline" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error.message}</p>}<Feedback {...result} retry={() => setRevision(revision + 1)} empty={!result.loading && !result.error && !list.length && 'No hay productos para mostrar'} />{list.length > 0 && <div className="table-wrapper panel"><table><thead><tr><th>Prenda</th><th>Categoría</th><th>Talla / color</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{list.map(p => <tr key={p.id}><td><div className="table-product"><ProductImage src={p.imagenUrl} alt={p.nombre} /><div><strong>{p.nombre}</strong><small>Referencia #{p.id}</small></div></div></td><td>{p.categoria || '—'}</td><td>{p.talla || '—'} / {p.color || '—'}</td><td>{money(p.precio)}</td><td><Badge>{p.stock} uds</Badge></td><td><div className="table-actions"><Link className="icon-button" href={`/admin/productos/${p.id}/editar`} aria-label={`Editar ${p.nombre}`}><Icon name="edit" size={18} /></Link><Link className="icon-button" href={`/productos/${p.id}`} aria-label={`Ver ${p.nombre}`}><Icon name="eye" size={18} /></Link><button className="icon-button error-text" aria-label={`Eliminar ${p.nombre}`} onClick={() => { setError(null); setRemove(p) }}><Icon name="trash" size={18} /></button></div></td></tr>)}</tbody></table></div>}{remove && <ConfirmDialog title="¿Eliminar prenda del catálogo?" busy={busy} onCancel={() => setRemove(null)} onConfirm={deleteProduct}>Se eliminará {remove.nombre}. Si está asociada a pedidos, el servidor impedirá borrarla para conservar el historial.</ConfirmDialog>}</>
}

export function AdminProductPage({ id }) {
  const auth = useAuth()
  const result = useApi(id ? `/api/productos/${id}` : null)
  if (id && !result.data) return <Feedback {...result} />
  return <><div className="breadcrumbs"><Link href="/admin/productos">Inventario</Link> / {id ? 'Editar prenda' : 'Nueva prenda'}</div><ProductForm product={result.data} token={auth.token} /></>
}
function ProductForm({ product, token }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(null), [preview, setPreview] = useState(product?.imagenUrl || '')
  async function submit(event) {
    event.preventDefault(); if (busy) return
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(['nombre', 'descripcion', 'categoria', 'talla', 'color', 'imagenUrl'].map(key => [key, form.get(key).trim()]))
    body.precio = Number(form.get('precio')); body.stock = Number(form.get('stock'))
    setBusy(true); setError(null)
    try { await api(`/api/productos${product ? `/${product.id}` : ''}`, { method: product ? 'PUT' : 'POST', token, body }); navigate('/admin/productos') }
    catch (e) { setError(e) } finally { setBusy(false) }
  }
  return <div className="product-form-layout"><form className="panel product-form" onSubmit={submit}><span className="eyebrow">Ficha de la prenda</span><h1>{product ? 'Editar producto' : 'Nuevo producto'}</h1><fieldset disabled={busy}><Field label="Nombre de la prenda *" name="nombre" required maxLength="255" defaultValue={product?.nombre || ''} error={error?.fields?.nombre} /><div className="form-grid"><Field label="Precio (USD) *" name="precio" type="number" min="0.01" max="99999999.99" step="0.01" required defaultValue={product?.precio || ''} error={error?.fields?.precio} /><Field label="Stock *" name="stock" type="number" min="0" max="2147483647" step="1" required defaultValue={product?.stock ?? 0} error={error?.fields?.stock} /><Field label="Categoría" name="categoria" maxLength="255" defaultValue={product?.categoria || ''} /><Field label="Talla (una por referencia)" name="talla" maxLength="255" defaultValue={product?.talla || ''} /><Field label="Color" name="color" maxLength="255" defaultValue={product?.color || ''} /></div><label className="field"><span>Descripción editorial</span><textarea name="descripcion" maxLength="255" rows="4" defaultValue={product?.descripcion || ''} /></label><Field label="URL de imagen (opcional, HTTP/HTTPS)" name="imagenUrl" type="url" maxLength="255" defaultValue={product?.imagenUrl || ''} onChange={e => setPreview(e.target.value)} /><p className="small muted">Una imagen por prenda. No hay servicio de subida de archivos.</p>{error && <p className="form-error" role="alert">{error.message}</p>}<div className="actions"><Link href="/admin/productos" className="button secondary">Cancelar</Link><button className="button" disabled={busy}>{busy ? 'Guardando…' : 'Guardar prenda'}</button></div></fieldset></form><aside className="panel product-preview"><span className="eyebrow">Previsualización editorial</span><ProductImage key={preview} src={preview} alt="Previsualización de la prenda" /></aside></div>
}

export function AdminOrdersPage({ id }) {
  const auth = useAuth(), [revision, setRevision] = useState(0), [query, setQuery] = useState(''), [state, setState] = useState('')
  const result = useApi('/api/pedidos', auth.token, revision)
  const list = (result.data || []).filter(o => (!state || o.estado === state) && `${o.id} ${o.usuario.nombre} ${o.usuario.email}`.toLowerCase().includes(query.toLowerCase()))
  return <><div className="breadcrumbs">Fashion World / Administración / Pedidos</div><div className="page-heading"><span className="eyebrow">Gestión Atelier</span><h1>Gestión de pedidos</h1><p>Consulta las órdenes registradas y actualiza su estado real.</p></div><div className="stats"><div className="panel"><span className="eyebrow">Pedidos registrados</span><strong>{result.data?.length ?? '—'}</strong></div><div className="panel"><span className="eyebrow">Total de pedidos (no cobros)</span><strong>{result.data ? money(result.data.reduce((sum, o) => sum + o.total, 0)) : '—'}</strong></div><div className="panel"><span className="eyebrow">Clientes con pedidos</span><strong>{result.data ? new Set(result.data.map(o => o.usuario.id)).size : '—'}</strong></div></div><div className="admin-toolbar panel"><Field label="Buscar pedido o cliente" value={query} onChange={e => setQuery(e.target.value)} /><label className="field"><span>Estado</span><select value={state} onChange={e => setState(e.target.value)}><option value="">Todos</option>{[...new Set((result.data || []).map(o => o.estado))].map(s => <option key={s}>{s}</option>)}</select></label><button className="button secondary" onClick={() => setRevision(revision + 1)}>Actualizar</button></div><Feedback {...result} retry={() => setRevision(revision + 1)} empty={!result.loading && !result.error && !list.length && 'No hay pedidos para mostrar'} /><div className={id ? 'admin-orders-layout' : ''}>{list.length > 0 && <div className="table-wrapper panel"><table><thead><tr><th>Pedido / fecha</th><th>Cliente</th><th>Unidades</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{list.map(o => <tr key={o.id} className={String(o.id) === String(id) ? 'selected-row' : ''}><td><strong>#{o.id}</strong><small>{date(o.fechaCreacion)}</small></td><td>{o.usuario.nombre}<small>{o.usuario.email}</small></td><td>{o.detalles.reduce((sum, d) => sum + d.cantidad, 0)}</td><td>{money(o.total)}</td><td><Badge>{o.estado}</Badge></td><td><Link className="text-link" href={`/admin/pedidos/${o.id}`}>Ver detalle</Link></td></tr>)}</tbody></table></div>}{id && <AdminOrderDetail key={id} id={id} token={auth.token} onUpdated={() => setRevision(value => value + 1)} />}</div></>
}
function AdminOrderDetail({ id, token, onUpdated }) {
  const [revision, setRevision] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState(null), [notice, setNotice] = useState('')
  const result = useApi(`/api/pedidos/${id}`, token, revision)
  async function submit(event) {
    event.preventDefault(); if (busy) return
    const estado = new FormData(event.currentTarget).get('estado').trim()
    setBusy(true); setError(null); setNotice('')
    try { await api(`/api/pedidos/${id}/estado`, { method: 'PUT', token, body: { estado } }); setRevision(value => value + 1); onUpdated(); setNotice('Estado actualizado correctamente.') }
    catch (e) { setError(e) } finally { setBusy(false) }
  }
  return <aside className="panel admin-order-detail"><Link className="text-link small" href="/admin/pedidos">Cerrar detalle ×</Link><Feedback {...result} retry={() => setRevision(revision + 1)} />{result.data && <><h3>{result.data.usuario.nombre}</h3><p className="small muted">{result.data.usuario.email}</p><form onSubmit={submit}><Field label="Estado del pedido" key={result.data.estado} defaultValue={result.data.estado} name="estado" required maxLength="50" /><p className="small muted">Estado textual del sistema. Cambiarlo no cobra, envía ni repone stock automáticamente.</p>{error && <p className="form-error" role="alert">{error.message}</p>}{notice && <p role="status" className="stock-status">{notice}</p>}<button className="button full" disabled={busy}>{busy ? 'Guardando…' : 'Actualizar estado'}</button></form><OrderDetails order={result.data} /></>}</aside>
}
