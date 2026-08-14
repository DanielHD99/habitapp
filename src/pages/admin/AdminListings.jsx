import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Eye, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, formatRelativeDate, STATUS_LABELS, STATUS_BADGE_CLASS, PROPERTY_TYPE_LABELS } from '../../lib/utils'

export default function AdminListings() {
  const { isCityAdmin, assignedCities } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => { fetchListings() }, [filter, isCityAdmin, assignedCities])

  async function fetchListings() {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, listing_images(url, position), profiles(full_name, phone)')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (isCityAdmin && assignedCities.length > 0) {
      query = query.in('city', assignedCities)
    }

    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query.limit(100)
    if (data) setListings(data.map(l => ({ ...l, listing_images: (l.listing_images || []).sort((a, b) => a.position - b.position) })))
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('listings').update({ status }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  async function hardDelete(id) {
    if (!window.confirm('¿Eliminar permanentemente esta publicación?')) return
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  const FILTERS = [
    { value: 'all',       label: 'Todas' },
    { value: 'published', label: 'Publicadas' },
    { value: 'hidden',    label: 'Ocultas' },
    { value: 'suspended', label: 'Suspendidas' },
    { value: 'draft',     label: 'Borradores' },
  ]

  return (
    <>
      <Helmet><title>Admin — Publicaciones</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: 'var(--space-8) 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-6)' }}>Publicaciones</h1>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-ghost'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-xl)' }} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state"><p>No hay publicaciones con este filtro.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {listings.map(listing => (
                <div key={listing.id} style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-card)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Imagen */}
                  <div style={{ width: 64, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-surface-hover)' }}>
                    {listing.listing_images?.[0]?.url && <img src={listing.listing_images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
                      <span className={`badge ${STATUS_BADGE_CLASS[listing.status]}`}>{STATUS_LABELS[listing.status]}</span>
                      {listing.report_count > 0 && <span className="badge badge-danger">⚑ {listing.report_count} reportes</span>}
                    </div>
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 2px' }}>{listing.title}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {listing.city} · {formatPrice(listing.price)}/mes · {listing.profiles?.full_name || 'N/A'} · {formatRelativeDate(listing.created_at)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                    {listing.status === 'published' && (
                      <Link to={`/vivienda/${listing.id}`} target="_blank" className="btn btn-ghost btn-sm" title="Ver">
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    {listing.status === 'hidden' && (
                      <button className="btn btn-sm" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        onClick={() => updateStatus(listing.id, 'published')} title="Reactivar">
                        <CheckCircle size={14} /> Reactivar
                      </button>
                    )}
                    {listing.status === 'published' && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-warning)' }}
                        onClick={() => updateStatus(listing.id, 'suspended')} title="Suspender">
                        <XCircle size={14} /> Suspender
                      </button>
                    )}
                    {listing.status === 'suspended' && (
                      <button className="btn btn-sm" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        onClick={() => updateStatus(listing.id, 'published')} title="Reactivar">
                        <CheckCircle size={14} /> Reactivar
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}
                      onClick={() => hardDelete(listing.id)} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
