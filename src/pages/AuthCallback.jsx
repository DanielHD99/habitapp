import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Callback de OAuth — Supabase redirige aquí después del login con Google.
 * Detecta la sesión y redirige al destino correcto.
 */
export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const params  = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') || '/'
      window.location.replace(redirect)
    })
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 'var(--space-4)',
    }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
        Iniciando sesión…
      </p>
    </div>
  )
}
