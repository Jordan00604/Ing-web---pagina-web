import { useSyncExternalStore } from 'react'

function subscribe(listener) {
  window.addEventListener('popstate', listener)
  return () => window.removeEventListener('popstate', listener)
}
const snapshot = () => window.location.pathname + window.location.search + window.location.hash
export function useRoute() { return useSyncExternalStore(subscribe, snapshot) }
export function navigate(to, replace = false) {
  if (!to.startsWith('/') || to.startsWith('//') || new URL(to, window.location.origin).origin !== window.location.origin) to = '/'
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'instant' })
  const hash = new URL(to, window.location.origin).hash.slice(1)
  if (hash) window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView()))
}
export function safeReturn(value) {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/mis-pedidos'
  const target = new URL(value, window.location.origin)
  return target.origin === window.location.origin && !target.pathname.startsWith('/login') && !target.pathname.startsWith('/registro') ? target.pathname + target.search : '/mis-pedidos'
}
