import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Eye, Pencil, Trash2, MapPin, Bed, Bath } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatPrice, formatRelativeDate, STATUS_LABELS, STATUS_BADGE_CLASS, PROPERTY_TYPE_LABELS } from '../lib/utils'

export default function MyListings() {
  const { user }    = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchMyListings() }, [user])

  async function fetchMyListings() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*, listing_images(url, position)')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (data) {
      setListings(data.map(l => ({
        ...l,
        listing_images: (l.listing_images || []).sort((a, b) => a.position - b.position)
      })))
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return
    setDeleting(id)
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <Helmet><title>Mis publicaciones — HabitApp</title></Helmet>

      <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-8) 0', minHeight: '80vh' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Mis publicaciones</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                {listings.length} publicación{listings.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <Link to="/publicar" className="btn btn-primary">
              <Plus size={18} /> Nueva publicación
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>🏠</div>
              <h3>Aún no tienes publicaciones</h3>
              <p>Publica tu primera vivienda y empieza a recibir interesados por WhatsApp.</p>
              <Link to="/publicar" className="btn btn-primary"><Plus size={18} /> Publicar vivienda</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {listings.map(listing => (
                <MyListingRow
                  key={listing.id}
                  listing={listing}
                  onDelete={handleDelete}
                  deleting={deleting === listing.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function MyListingRow({ listing, onDelete, deleting }) {
  const mainImage = listing.listing_images?.[0]?.url
  const statusClass = STATUS_BADGE_CLASS[listing.status] || 'badge-neutral'
  const statusLabel = STATUS_LABELS[listing.status] || listing.status
  const typeLabel   = PROPERTY_TYPE_LABELS[listing.property_type] || listing.property_type

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-card)', overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '120px 1fr auto',
      opacity: listing.status === 'hidden' || listing.status === 'suspended' ? 0.8 : 1,
    }}>
      {/* Imagen */}
      <div style={{ backgroundColor: 'var(--color-surface-hover)', aspectRatio: '4/3' }}>
        {mainImage ? (
          <img src={mainImage} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            🏠
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className={`badge ${statusClass}`}>{statusLabel}</span>
          <span className="badge badge-neutral">{typeLabel}</span>
          {listing.report_count > 0 && (
            <span className="badge badge-danger">⚑ {listing.report_count} reporte{listing.report_count !== 1 ? 's' : ''}</span>
          )}
        </div>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {listing.title}
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          <span className="price" style={{ fontSize: 'var(--font-size-base)' }}>{formatPrice(listing.price)}<span className="price-unit" style={{ fontSize: 'var(--font-size-xs)' }}>/mes</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{listing.city}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bed size={12} />{listing.bedrooms}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={12} />{listing.bathrooms}</span>
        </div>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {formatRelativeDate(listing.created_at)}
        </span>
      </div>

      {/* Acciones */}
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end', justifyContent: 'center' }}>
        {listing.status === 'published' && (
          <Link to={`/vivienda/${listing.id}`} className="btn btn-ghost btn-sm" title="Ver publicación">
            <Eye size={16} />
          </Link>
        )}
        <Link to={`/editar/${listing.id}`} className="btn btn-outline btn-sm" title="Editar">
          <Pencil size={16} />
        </Link>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--color-danger)' }}
          onClick={() => onDelete(listing.id)}
          disabled={deleting}
          title="Eliminar"
        >
          {deleting ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  )
}
