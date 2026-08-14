import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Plus, Trash2, Shield } from 'lucide-react'

export default function AdminCities() {
  const { isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCityName, setNewCityName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCities()
  }, [])

  async function fetchCities() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true })
    
    if (!error && data) {
      setCities(data)
    }
    setLoading(false)
  }

  async function handleAddCity(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const name = newCityName.trim()
    if (!name) return

    const { error: insertError } = await supabase
      .from('cities')
      .insert([{ name }])

    if (insertError) {
      if (insertError.code === '23505') { // unique violation
        setError('Esta ciudad ya existe.')
      } else {
        setError('Error al crear la ciudad: ' + insertError.message)
      }
      return
    }

    setSuccess('Ciudad creada exitosamente.')
    setNewCityName('')
    fetchCities()
  }

  async function handleDeleteCity(id, name) {
    if (!window.confirm(`¿Estás seguro de eliminar la ciudad "${name}"? Esto no eliminará las viviendas pero no aparecerá más en los filtros.`)) return

    setError('')
    setSuccess('')

    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError('Error al eliminar: ' + deleteError.message)
    } else {
      setSuccess('Ciudad eliminada.')
      fetchCities()
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>
        <h2><Shield /> Acceso Denegado</h2>
        <p>Solo los Super Administradores pueden gestionar las ciudades disponibles.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Admin — Ciudades</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: 'var(--space-8) 0' }}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
              Gestión de Ciudades <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', fontWeight: 400 }}>({cities.length})</span>
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
              Agrega o elimina ciudades disponibles en la plataforma para filtros y administradores.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', maxWidth: 800 }}>
            {/* Formulario de Agregar */}
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} /> Agregar Nueva Ciudad
              </h3>
              
              {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
              {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)', backgroundColor: '#DEF7EC', color: '#03543F' }}>{success}</div>}
              
              <form onSubmit={handleAddCity} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                  <label className="form-label">Nombre de la ciudad *</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Ej: Bucaramanga" 
                    value={newCityName} 
                    onChange={e => setNewCityName(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!newCityName.trim()}>
                  Guardar
                </button>
              </form>
            </div>

            {/* Lista de Ciudades */}
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 'var(--radius-lg)' }} />)}
                </div>
              ) : cities.length === 0 ? (
                <div className="empty-state"><p>No hay ciudades registradas.</p></div>
              ) : (
                cities.map((city, i) => (
                  <div 
                    key={city.id} 
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)',
                      borderBottom: i < cities.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onClick={() => navigate(`/admin/usuarios?createAdminFor=${encodeURIComponent(city.name)}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={18} />
                      </div>
                      <p style={{ fontWeight: 600 }}>{city.name}</p>
                    </div>

                    <button 
                      className="btn btn-icon btn-ghost" 
                      style={{ color: 'var(--color-danger)' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCity(city.id, city.name)
                      }}
                      title="Eliminar ciudad"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
