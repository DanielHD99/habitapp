import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatRelativeDate, getInitials, ROLE_LABELS } from '../../lib/utils'
import { useCities } from '../../hooks/useCities'
import { Ban, CheckCircle, Shield, MapPin, X, UserPlus, Key, Copy, Check } from 'lucide-react'

export default function AdminUsers() {
  const { isSuperAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { cities: COLOMBIAN_CITIES } = useCities()

  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  
  // Modal Modificar Rol
  const [editingUser, setEditingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('user')
  const [selectedCities, setSelectedCities] = useState([])

  // Modal Crear Admin
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail]       = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newCities, setNewCities]     = useState(['Pereira'])
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState(null)

  // Modal Cambiar Clave
  const [passwordUser, setPasswordUser] = useState(null)
  const [changePasswordVal, setChangePasswordVal] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { 
    fetchUsers() 
  }, [])

  useEffect(() => {
    const city = searchParams.get('createAdminFor')
    if (city && isSuperAdmin) {
      setNewFullName('')
      setNewEmail('')
      setNewPassword(generateSecurePassword())
      setNewCities([city])
      setCreateError('')
      setCreateSuccess(null)
      setShowCreateModal(true)
      
      // Limpiamos la url sin recargar
      searchParams.delete('createAdminFor')
      setSearchParams(searchParams)
    }
  }, [searchParams, isSuperAdmin, setSearchParams])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
  }

  function openEditModal(user) {
    setEditingUser(user)
    setSelectedRole(user.role || 'user')
    setSelectedCities(user.assigned_cities || (user.assigned_city ? [user.assigned_city] : ['Armenia']))
  }

  async function saveUserRole() {
    if (!editingUser) return

    const updates = {
      role: selectedRole,
      assigned_cities: selectedRole === 'city_admin' ? selectedCities : [],
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', editingUser.id)

    if (!error) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u))
      setEditingUser(null)
    }
  }

  function toggleCity(city) {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  function toggleNewCity(city) {
    setNewCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  function generateSecurePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
    let pass = ''
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    return pass
  }

  async function handleCreateAdmin(e) {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess(null)

    if (!newEmail.trim() || !newPassword.trim() || !newFullName.trim()) {
      return setCreateError('Todos los campos son obligatorios.')
    }
    if (newPassword.length < 6) {
      return setCreateError('La contraseña debe tener al menos 6 caracteres.')
    }
    if (newCities.length === 0) {
      return setCreateError('Selecciona al menos una ciudad asignada.')
    }

    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword.trim(),
        options: {
          data: { full_name: newFullName.trim() }
        }
      })

      if (authErr) throw authErr

      const createdId = authData.user?.id
      if (createdId) {
        // 2. Actualizar su perfil como city_admin
        await supabase.from('profiles').upsert({
          id: createdId,
          full_name: newFullName.trim(),
          role: 'city_admin',
          assigned_cities: newCities,
          status: 'active',
        })

        setCreateSuccess({
          email: newEmail.trim(),
          password: newPassword.trim(),
          cities: newCities.join(', '),
          name: newFullName.trim(),
        })

        fetchUsers()
      }
    } catch (err) {
      setCreateError(err.message || 'Error al crear la cuenta del administrador.')
    }
  }

  return (
    <>
      <Helmet><title>Admin — Gestión de Usuarios y Roles</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: 'var(--space-8) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
                Usuarios y Roles <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', fontWeight: 400 }}>({users.length})</span>
              </h1>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                Administra roles globales, asignaciones por ciudad y credenciales iniciales.
              </p>
            </div>

            {isSuperAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setNewFullName('')
                  setNewEmail('')
                  setNewPassword(generateSecurePassword())
                  setNewCities(COLOMBIAN_CITIES.length > 0 ? [COLOMBIAN_CITIES[0]] : [])
                  setCreateError('')
                  setCreateSuccess(null)
                  setShowCreateModal(true)
                }}
              >
                <UserPlus size={18} /> + Crear Admin de Ciudad
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-xl)' }} />)}
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
              {users.map((u, i) => {
                const isSuper = u.role === 'super_admin' || u.role === 'admin'
                const isCity = u.role === 'city_admin'
                const citiesList = u.assigned_cities?.length ? u.assigned_cities.join(', ') : (u.assigned_city || 'Sin ciudad')

                return (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)',
                    borderBottom: i < users.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                    opacity: u.status === 'suspended' ? 0.65 : 1,
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      backgroundColor: isSuper ? 'var(--color-primary)' : isCity ? '#3B82F6' : 'var(--color-text-muted)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0
                    }}>
                      {getInitials(u.full_name || u.id)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>{u.full_name || 'Sin nombre'}</p>
                        {isSuper && <span className="badge badge-success">Super Admin</span>}
                        {isCity && <span className="badge badge-info"><MapPin size={12} /> Admin ({citiesList})</span>}
                        {u.status === 'suspended' && <span className="badge badge-danger">Suspendido</span>}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {u.phone && `${u.phone} · `}Registrado {formatRelativeDate(u.created_at)}
                      </p>
                    </div>

                    {/* Acciones para Super Admin */}
                    {isSuperAdmin && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEditModal(u)}
                        >
                          <Shield size={14} /> Rol
                        </button>

                        {!isSuper && (
                          <button
                            className={`btn btn-sm ${u.status === 'suspended' ? 'btn-outline' : 'btn-ghost'}`}
                            style={{ color: u.status === 'suspended' ? 'var(--color-primary)' : 'var(--color-danger)', flexShrink: 0 }}
                            onClick={() => toggleStatus(u.id, u.status)}
                          >
                            {u.status === 'suspended' ? <><CheckCircle size={14} /> Reactivar</> : <><Ban size={14} /> Suspender</>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── MODAL CREAR NUEVO ADMIN DE CIUDAD ─── */}
          {showCreateModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }} onClick={() => setShowCreateModal(false)}>
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-2xl)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserPlus size={20} style={{ color: 'var(--color-primary)' }} /> Crear Nuevo Admin de Ciudad
                  </h3>
                  <button className="btn btn-icon btn-ghost" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
                </div>

                {createSuccess ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                    <div style={{ backgroundColor: '#DEF7EC', color: '#03543F', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
                      <p style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: 8 }}>¡Administrador Creado Exitosamente!</p>
                      <p style={{ fontSize: 'var(--font-size-sm)', margin: '4px 0' }}><strong>Nombre:</strong> {createSuccess.name}</p>
                      <p style={{ fontSize: 'var(--font-size-sm)', margin: '4px 0' }}><strong>Correo:</strong> {createSuccess.email}</p>
                      <p style={{ fontSize: 'var(--font-size-sm)', margin: '4px 0' }}><strong>Contraseña asignada:</strong> <code style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '2px 6px', borderRadius: 4 }}>{createSuccess.password}</code></p>
                      <p style={{ fontSize: 'var(--font-size-sm)', margin: '4px 0' }}><strong>Ciudad(es):</strong> {createSuccess.cities}</p>
                    </div>

                    <button
                      className="btn btn-outline btn-full"
                      onClick={() => {
                        navigator.clipboard.writeText(`Credenciales HabitApp:\nCorreo: ${createSuccess.email}\nContraseña: ${createSuccess.password}\nCiudad: ${createSuccess.cities}`)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    >
                      {copied ? <><Check size={16} /> ¡Credenciales Copiadas!</> : <><Copy size={16} /> Copiar Datos para Entregar al Admin</>}
                    </button>

                    <button className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-3)' }} onClick={() => setShowCreateModal(false)}>
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {createError && <div className="alert alert-danger">{createError}</div>}

                    <div className="form-group">
                      <label className="form-label">Nombre completo del Administrador *</label>
                      <input className="form-input" type="text" placeholder="Ej: Carlos Rodríguez" value={newFullName} onChange={e => setNewFullName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Correo electrónico *</label>
                      <input className="form-input" type="email" placeholder="admin.pereira@habitapp.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Contraseña inicial *</label>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: 0 }} onClick={() => setNewPassword(generateSecurePassword())}>
                          🔄 Generar contraseña segura
                        </button>
                      </div>
                      <input className="form-input" type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        🔒 Esta es la clave inicial que le entregarás al administrador para ingresar.
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ciudad(es) asignada(s) *</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 4 }}>
                        {COLOMBIAN_CITIES.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`badge ${newCities.includes(c) ? 'badge-success' : 'badge-neutral'}`}
                            style={{ cursor: 'pointer', padding: 'var(--space-2) var(--space-3)', border: 'none' }}
                            onClick={() => toggleNewCity(c)}
                          >
                            {newCities.includes(c) ? '✓ ' : ''}{c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary">Crear Administrador</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ─── MODAL EDITAR ROL ─── */}
          {editingUser && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }} onClick={() => setEditingUser(null)}>
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-2xl)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)' }}>Asignar Rol de Usuario</h3>
                  <button className="btn btn-icon btn-ghost" onClick={() => setEditingUser(null)}><X size={18} /></button>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Usuario: <strong>{editingUser.full_name || editingUser.id}</strong>
                </p>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Selecciona el rol *</label>
                  <select className="form-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                    <option value="user">Usuario estándar (Sin permisos de administración)</option>
                    <option value="city_admin">Admin de Ciudad (Gestiona solo ciudades específicas)</option>
                    <option value="super_admin">Super Admin Global (Control total de la plataforma)</option>
                  </select>
                </div>

                {selectedRole === 'city_admin' && (
                  <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                    <label className="form-label">Ciudades asignadas *</label>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      Selecciona las ciudades que podrá administrar este usuario:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {COLOMBIAN_CITIES.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`badge ${selectedCities.includes(c) ? 'badge-success' : 'badge-neutral'}`}
                          style={{ cursor: 'pointer', padding: 'var(--space-2) var(--space-3)', border: 'none' }}
                          onClick={() => toggleCity(c)}
                        >
                          {selectedCities.includes(c) ? '✓ ' : ''}{c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-ghost" onClick={() => setEditingUser(null)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={saveUserRole}>Guardar Cambios</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
