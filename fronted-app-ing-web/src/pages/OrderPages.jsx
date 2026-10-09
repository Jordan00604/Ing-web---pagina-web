import { useState } from 'react'
import { useAuth } from '../context/contexts'
import { useApi } from '../hooks/useApi'
import { navigate } from '../services/router'
import { date, money } from '../services/format'
import { Link, Feedback, Badge, Icon } from '../components/UI'
import { OrderDetails } from '../components/OrderDetails'

export function OrdersPage() {
  const auth = useAuth()
  const [revision, setRevision] = useState(0), [filter, setFilter] = useState('')
  const result = useApi('/api/pedidos/mis-pedidos', auth.token, revision)
  const states = [...new Set((result.data || []).map(o => o.estado))]
  const orders = (result.data || []).filter(o => !filter || o.estado === filter)
  return <div className="container page"><div className="page-heading"><span className="eyebrow">Tu espacio Fashion World</span><h1>Bienvenido, {auth.user.nombre}</h1><p>Consulta tus pedidos y el estado actual de cada selección.</p></div><div className="two-column account-layout"><section><div className="account-toolbar"><h2>Mis pedidos</h2><label>Estado <select value={filter} onChange={e => setFilter(e.target.value)}><option value="">Todos</option>{states.map(s => <option key={s}>{s}</option>)}</select></label><button className="text-link" onClick={() => setRevision(revision + 1)}>Actualizar</button></div><Feedback {...result} retry={() => setRevision(revision + 1)} empty={!result.loading && !result.error && !orders.length && 'Todavía no hay pedidos para mostrar'} />{orders.map(order => <article className="panel order-card" key={order.id}><div className="section-heading"><div><h3>Pedido #{order.id}</h3><p className="small muted">{date(order.fechaCreacion)}</p></div><Badge>{order.estado}</Badge></div><p>{order.detalles.reduce((sum, d) => sum + d.cantidad, 0)} unidades · <strong>{money(order.total)}</strong></p><div className="order-preview">{order.detalles.map(d => <span key={d.id}>{d.producto.nombre} × {d.cantidad}</span>)}</div><Link href={`/mis-pedidos/${order.id}`} className="text-link">Ver detalle del pedido →</Link></article>)}</section><aside className="panel profile"><span className="eyebrow">Mi cuenta</span><div className="avatar"><Icon name="user" size={28} /></div><h2>{auth.user.nombre}</h2><p>{auth.user.email}</p><Badge>{auth.user.rol}</Badge><p className="muted small">Tu sesión se conserva en memoria. Al recargar tendrás que iniciar sesión de nuevo.</p>{auth.user.rol === 'ADMIN' && <Link href="/admin/productos" className="button secondary full">Administrar tienda</Link>}<button className="button secondary full" onClick={() => { auth.logout(); navigate('/login') }}>Cerrar sesión</button></aside></div></div>
}

export function OrderPage({ id, confirmation = false }) {
  const auth = useAuth(), [revision, setRevision] = useState(0)
  const result = useApi(`/api/pedidos/${id}`, auth.token, revision)
  return <div className="container page narrow">{result.data && confirmation && <section className="confirmation"><div className="success-circle"><Icon name="check" size={36} /></div><span className="eyebrow">Pedido registrado</span><h1>Gracias por tu selección,<br />{auth.user.nombre}</h1><p>Tu pedido está registrado en la tienda. Puedes consultar su estado en tu historial.</p></section>}<Feedback {...result} retry={() => setRevision(revision + 1)} />{result.data && <div className="panel receipt"><OrderDetails order={result.data} /><div className="actions"><Link href="/catalogo" className="button">Seguir explorando <Icon name="arrow" /></Link><Link href="/mis-pedidos" className="button secondary">Ver mis pedidos</Link></div></div>}</div>
}
