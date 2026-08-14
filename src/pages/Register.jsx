import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/logo.png'

export default function Register() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.fullName.trim()) return setError('El nombre es obligatorio.')
    if (!form.email.trim())    return setError('El correo es obligatorio.')
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden.')

    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, form.fullName, form.phone)
    setLoading(false)

    if (err) {
      if (err.message.includes('already registered')) {
        setError('Este correo ya está registrado. ¿Quieres iniciar sesión?')
      } else {
        setError(err.message)
      }
    } else {
      setSuccess(true)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  if (success) {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✉️</div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
            ¡Revisa tu correo!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
          <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-6)' }}>
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Crear cuenta — HabitApp</title>
      </Helmet>

      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <img src={logo} alt="HabitApp" style={{ height: 44, margin: '0 auto var(--space-4)' }} />
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
              Crea tu cuenta gratis
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
              Publica y encuentra viviendas para arrendar
            </p>
          </div>

          {/* Botón Google */}
          <button
            className="btn btn-outline btn-full"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            {googleLoading ? <div className="spinner" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuar con Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>o con correo</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {error && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Nombre completo</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={iconStyle} />
                <input id="fullName" name="fullName" type="text" className="form-input"
                  placeholder="Juan Pérez" value={form.fullName} onChange={handleChange}
                  style={{ paddingLeft: 'var(--space-10)' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={iconStyle} />
                <input id="email" name="email" type="email" className="form-input"
                  placeholder="tu@correo.com" value={form.email} onChange={handleChange}
                  style={{ paddingLeft: 'var(--space-10)' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Teléfono <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>(opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={iconStyle} />
                <input id="phone" name="phone" type="tel" className="form-input"
                  placeholder="3001234567" value={form.phone} onChange={handleChange}
                  style={{ paddingLeft: 'var(--space-10)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={iconStyle} />
                <input id="password" name="password" type={showPass ? 'text' : 'password'}
                  className="form-input" placeholder="Mínimo 8 caracteres" value={form.password}
                  onChange={handleChange} style={{ paddingLeft: 'var(--space-10)', paddingRight: 'var(--space-10)' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirmar contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={iconStyle} />
                <input id="confirmPassword" name="confirmPassword" type={showPass ? 'text' : 'password'}
                  className="form-input" placeholder="Repite tu contraseña" value={form.confirmPassword}
                  onChange={handleChange} style={{ paddingLeft: 'var(--space-10)' }} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Creando cuenta…</> : 'Crear cuenta'}
            </button>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Al registrarte aceptas los términos de uso de HabitApp.
            </p>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)', textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-6) var(--space-4)',
  background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-bg) 60%)',
}

const cardStyle = {
  width: '100%',
  maxWidth: 440,
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-2xl)',
  padding: 'var(--space-8)',
  boxShadow: 'var(--shadow-xl)',
}

const iconStyle = {
  position: 'absolute',
  left: 'var(--space-3)',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-muted)',
  pointerEvents: 'none',
}
