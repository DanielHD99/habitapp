import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Phone, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../lib/utils'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm]   = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false); setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name.trim()) return setError('El nombre es obligatorio.')
    setSaving(true)
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name.trim(), phone: form.phone.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    setSaving(false)
    if (err) { setError('No pudimos guardar los cambios.') } else { setSuccess(true); await refreshProfile() }
  }

  const initials = getInitials(profile?.full_name || user?.email || '')

  return (
    <>
      <Helmet><title>Mi perfil — HabitApp</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-8) 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-8)' }}>Mi perfil</h1>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'var(--font-weight-bold)' }}>
              {initials}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>{profile?.full_name || 'Usuario'}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-card)' }}>
            {success && <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>✓ Perfil actualizado correctamente.</div>}
            {error && <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input name="full_name" type="text" className="form-input" value={form.full_name} onChange={handleChange} style={{ paddingLeft: 'var(--space-10)' }} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input type="email" className="form-input" value={user?.email || ''} disabled style={{ paddingLeft: 'var(--space-10)', opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>El correo no se puede cambiar.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>(opcional)</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                  <input name="phone" type="tel" className="form-input" value={form.phone} onChange={handleChange} style={{ paddingLeft: 'var(--space-10)' }} placeholder="3001234567" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Guardando…</> : <><Save size={18} /> Guardar cambios</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
