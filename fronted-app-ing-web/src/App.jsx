import { useEffect } from 'react'
import { Providers } from './context/Providers'
import { useAuth } from './context/contexts'
import { useRoute } from './services/router'
import { Layout } from './components/Layout'
import { Link, Icon } from './components/UI'
import { HomePage, CatalogPage, ProductPage } from './pages/StorePages'
import { AuthPage } from './pages/AuthPage'
import { CartPage } from './pages/CartPage'
import { OrdersPage, OrderPage } from './pages/OrderPages'
import { AdminProductsPage, AdminProductPage, AdminOrdersPage } from './pages/AdminPages'
import './App.css'

function Guard({ admin, route, children }) {
  const auth = useAuth()
  if (!auth.token) return <div className="container page narrow"><div className="feedback"><Icon name="user" size={32} /><h1>Accede a tu cuenta</h1><p>Inicia sesión para continuar. Tu bolsa permanece en este navegador.</p><Link className="button" href={`/login?next=${encodeURIComponent(route)}`}>Iniciar sesión</Link><Link className="text-link" href={`/registro?next=${encodeURIComponent(route)}`}>Crear cuenta</Link></div></div>
  if (admin && auth.user.rol !== 'ADMIN') return <div className="container page"><div className="feedback error"><h1>Acceso restringido</h1><p>Esta sección requiere permisos de administrador.</p><Link className="button secondary" href="/catalogo">Volver a la tienda</Link></div></div>
  return children
}
function Store() {
  const route = useRoute(), url = new URL(route, window.location.origin), path = url.pathname
  const product = path.match(/^\/productos\/(\d+)$/), order = path.match(/^\/(mis-pedidos|confirmacion)\/(\d+)$/)
  const adminProduct = path.match(/^\/admin\/productos\/(\d+)\/editar$/), adminOrder = path.match(/^\/admin\/pedidos(?:\/(\d+))?$/)
  useEffect(() => {
    document.title = `${path.startsWith('/admin') ? 'Administración' : path === '/' ? 'Tu estilo, tu mundo' : path.split('/')[1].replaceAll('-', ' ')} | Fashion World`
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [path])
  let page
  if (path === '/') page = <HomePage />
  else if (path === '/catalogo') page = <CatalogPage search={url.search} />
  else if (product) page = <ProductPage key={product[1]} id={product[1]} />
  else if (path === '/login' || path === '/registro') page = <AuthPage key={path} register={path === '/registro'} search={url.search} />
  else if (path === '/carrito') page = <CartPage />
  else if (path === '/mis-pedidos') page = <Guard route={route}><OrdersPage /></Guard>
  else if (order) page = <Guard route={route}><OrderPage key={path} id={order[2]} confirmation={order[1] === 'confirmacion'} /></Guard>
  else if (path === '/admin' || path === '/admin/productos') page = <Guard admin route={route}><AdminProductsPage /></Guard>
  else if (path === '/admin/productos/nuevo' || adminProduct) page = <Guard admin route={route}><AdminProductPage key={path} id={adminProduct?.[1]} /></Guard>
  else if (adminOrder) page = <Guard admin route={route}><AdminOrdersPage id={adminOrder[1]} /></Guard>
  else page = <div className="container page feedback"><h1>Página no encontrada</h1><p>El enlace solicitado no existe.</p><Link className="button" href="/">Volver al inicio</Link></div>
  return <Layout route={path}>{page}</Layout>
}
export default function App() { return <Providers><Store /></Providers> }
