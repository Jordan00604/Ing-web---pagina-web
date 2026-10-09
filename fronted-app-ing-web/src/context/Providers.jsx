import { useEffect, useState } from 'react'
import { AuthContext, CartContext } from './contexts'
import { api } from '../services/api'

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('fashion-world-cart') || '[]')
    if (!Array.isArray(saved)) return []
    const unique = new Map()
    saved.forEach(item => {
      if (Number.isSafeInteger(item.productoId) && item.productoId > 0 && Number.isInteger(item.cantidad) && item.cantidad > 0 && item.cantidad <= 9999) unique.set(item.productoId, item)
    })
    return [...unique.values()].map(({ productoId, cantidad }) => ({ productoId, cantidad }))
  } catch { return [] }
}

export function Providers({ children }) {
  const [session, setSession] = useState(null)
  const [sessionNotice, setSessionNotice] = useState('')
  const [items, setItems] = useState(readCart)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const expire = () => { setSession(null); setSessionNotice('Tu sesión terminó. Inicia sesión para continuar.') }
    window.addEventListener('session-expired', expire)
    const timer = session ? window.setTimeout(expire, Math.max(0, session.expiresAt - Date.now())) : null
    return () => { window.removeEventListener('session-expired', expire); if (timer) window.clearTimeout(timer) }
  }, [session])
  useEffect(() => {
    try { localStorage.setItem('fashion-world-cart', JSON.stringify(items)) } catch { /* El carrito sigue funcionando en memoria. */ }
  }, [items])

  async function login(email, password) {
    const result = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    const profile = await api('/api/usuarios/me', { token: result.accessToken })
    setSession({ token: result.accessToken, user: profile, expiresAt: Date.now() + result.expiresIn * 1000 })
    setSessionNotice('')
    return profile
  }
  function add(product, quantity = 1) {
    const existing = items.find(item => item.productoId === product.id)?.cantidad || 0
    if (!Number.isInteger(quantity) || quantity < 1 || existing + quantity > product.stock) {
      setNotice('La cantidad supera el stock disponible. Revisa tu bolsa.')
      return false
    }
    setItems(current => {
      const found = current.find(item => item.productoId === product.id)
      return found ? current.map(item => item.productoId === product.id ? { ...item, cantidad: item.cantidad + quantity } : item)
        : [...current, { productoId: product.id, cantidad: quantity }]
    })
    setNotice(`${product.nombre} se añadió a tu bolsa.`)
    return true
  }
  const auth = { ...session, sessionNotice, login, logout: () => { setSession(null); setSessionNotice('') } }
  const cart = { items, add, notice, dismiss: () => setNotice(''), clear: () => setItems([]),
    remove: id => setItems(current => current.filter(item => item.productoId !== id)),
    update: (id, quantity) => { if (Number.isInteger(quantity) && quantity > 0 && quantity <= 9999) setItems(current => current.map(item => item.productoId === id ? { ...item, cantidad: quantity } : item)) },
    count: items.reduce((sum, item) => sum + item.cantidad, 0) }
  return <AuthContext.Provider value={auth}><CartContext.Provider value={cart}>{children}</CartContext.Provider></AuthContext.Provider>
}
