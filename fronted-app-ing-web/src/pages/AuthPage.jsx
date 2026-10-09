import { useState } from 'react'
import { useAuth } from '../context/contexts'
import { Link, Field, PasswordField, Icon } from '../components/UI'
import { api } from '../services/api'
import { navigate, safeReturn } from '../services/router'

export function AuthPage({ register = false, search }) {
  const auth = useAuth()
  const [busy, setBusy] = useState(false), [error, setError] = useState(null), [success, setSuccess] = useState(false)
  const destination = safeReturn(new URLSearchParams(search).get('next'))
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const email = form.get('email').trim(), password = form.get('password')
    if (register && password !== form.get('confirmation')) { setError({ message: 'Las contraseñas no coinciden.', fields: { confirmation: 'Repite la misma contraseña.' } }); return }
    setBusy(true); setError(null)
    try {
      if (register) {
        await api('/api/auth/register', { method: 'POST', body: { nombre: form.get('nombre').trim(), email, password } })
        event.target.reset(); setSuccess(true)
      } else {
        const user = await auth.login(email, password)
        event.target.reset()
        navigate(destination === '/mis-pedidos' && user.rol === 'ADMIN' ? '/admin/productos' : destination)
      }
    } catch (e) { setError(e) } finally { setBusy(false) }
  }
  return <div className="container auth-page"><div className="auth-editorial"><img src={`/editorial/${register ? '30351c724f4e4e4b8b405de30e1713e9' : '3475e579618449a189b32e5970cd6fea'}-0.jpg`} alt="Editorial de Fashion World en tonos esmeralda y marfil" /><div><span className="eyebrow">Atelier Fashion World</span><blockquote>{register ? '“El estilo es la armonía entre la serenidad interior y la expresión visible.”' : '“La elegancia reside en la precisión de lo esencial.”'}</blockquote><p>Una mirada contemporánea. Un espacio para tu estilo.</p></div></div><div className="auth-form"><span className="eyebrow">{register ? 'Registro de clientes' : 'Acceso a tu cuenta'}</span><h1>{register ? 'Únete a Fashion World' : 'Iniciar sesión'}</h1><p className="muted">{register ? 'Crea tu cuenta para realizar pedidos y consultar tu historial.' : 'Bienvenido de nuevo. Accede para continuar con tu selección.'}</p>{success ? <div className="feedback success" role="status"><Icon name="check" size={32} /><h2>Tu cuenta fue creada</h2><p>Ahora puedes iniciar sesión con tu correo y contraseña.</p><Link className="button" href={`/login?next=${encodeURIComponent(destination)}`}>Iniciar sesión <Icon name="arrow" /></Link></div> : <form onSubmit={submit}>
    {register && <Field label="Nombre completo *" name="nombre" required maxLength="255" autoComplete="name" error={error?.fields?.nombre} />}
    <Field label="Correo electrónico *" name="email" type="email" required maxLength="255" autoComplete="email" placeholder="tu@correo.com" error={error?.fields?.email} />
    <PasswordField label="Contraseña *" name="password" required minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} error={error?.fields?.password} />
    {register && <><p className="small muted">Mínimo 8 caracteres.</p><PasswordField label="Confirmar contraseña *" name="confirmation" required minLength="8" autoComplete="new-password" error={error?.fields?.confirmation} /></>}
    {error && <p className="form-error" role="alert">{error.message}</p>}<button className="button full" disabled={busy}>{busy ? 'Procesando…' : register ? 'Crear cuenta' : 'Iniciar sesión'} <Icon name="arrow" /></button><p className="auth-switch">{register ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'} <Link href={`${register ? '/login' : '/registro'}?next=${encodeURIComponent(destination)}`}>{register ? 'Inicia sesión aquí' : 'Regístrate aquí'}</Link></p><p className="small muted">La sesión se conserva únicamente mientras esta página esté abierta. No se almacena tu token en el navegador.</p>
  </form>}</div></div>
}
