import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { Mail, ArrowLeft } from 'lucide-react'
import logo from '../assets/logo.png'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return setError('Ingresa tu correo electrónico.')
    setLoading(true)
    setError('')
    const { error: err } = await resetPassword(email)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
  }

  return (
    <>
      <Helmet>
        <title>Recuperar contraseña — HabitApp</title>
      </Helmet>
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <img src={logo} alt="HabitApp" style={{ height: 44, margin: '0 auto var(--space-4)' }} />
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
              Recuperar contraseña
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
              Te enviamos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✉️</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                Enviamos un enlace a <strong>{email}</strong>. Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-6)' }}>
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {error && (
                <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Correo electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input id="email" type="email" className="form-input" placeholder="tu@correo.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                    style={{ paddingLeft: 'var(--space-10)' }} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Enviando…</> : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </>
  )
}

const pageStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 'var(--space-6) var(--space-4)',
  background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-bg) 60%)',
}
const cardStyle = {
  width: '100%', maxWidth: 420, backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-xl)',
}
