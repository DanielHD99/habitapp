import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Bed, Bath, ChevronLeft, ChevronRight, Flag, Share2, X, ShieldAlert } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatPrice, formatRelativeDate, PROPERTY_TYPE_LABELS, REPORT_REASONS } from '../lib/utils'
import { buildWhatsAppUrl } from '../lib/whatsapp'

export default function ListingDetail() {
  const { id }       = useParams()
  const { user }     = useAuth()
  const navigate     = useNavigate()

  const [listing, setListing]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [imgIndex, setImgIndex]   = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, listing_images(url, position), profiles(full_name, phone)')
        .eq('id', id)
        .eq('status', 'published')
        .single()

      if (error || !data) {
        setLoading(false)
        return
      }

      setListing({
        ...data,
        listing_images: (data.listing_images || []).sort((a, b) => a.position - b.position)
      })
      setLoading(false)
    }
    fetchListing()
  }, [id])

  async function submitReport() {
    if (!user) { navigate('/login'); return }
    if (!reportReason) { setReportError('Selecciona un motivo.'); return }
    setReportLoading(true)
    setReportError('')

    const { error } = await supabase.from('reports').insert({
      listing_id: id,
      user_id: user.id,
      reason: reportReason,
      details: reportDetails.trim() || null,
    })

    setReportLoading(false)
    if (error) {
      if (error.code === '23505') {
        setReportError('Ya reportaste esta publicación anteriormente.')
      } else {
        setReportError('No pudimos enviar el reporte. Intenta de nuevo.')
      }
    } else {
      setReportDone(true)
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles.')
    }
  }

  if (loading) return (
    <div style={{ padding: 'var(--space-8)' }} className="container">
      <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 24, width: ['80%','60%','40%','90%'][i] }} />)}
        </div>
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <p>Esta vivienda no está disponible.</p>
      <Link to="/buscar" className="btn btn-primary">Ver viviendas disponibles</Link>
    </div>
  )

  const images    = listing.listing_images
  const typeLabel = PROPERTY_TYPE_LABELS[listing.property_type] || listing.property_type
  const waUrl     = buildWhatsAppUrl(listing.whatsapp, listing.title)
  const features  = listing.features || []

  return (
    <>
      <Helmet>
        <title>{listing.title} — HabitApp</title>
        <meta name="description" content={`${typeLabel} en ${listing.city} por ${formatPrice(listing.price)}/mes. ${listing.description?.slice(0, 120)}`} />
        {images[0] && <meta property="og:image" content={images[0].url} />}
      </Helmet>

      <div style={{ backgroundColor: 'var(--color-bg)', paddingBottom: 'var(--space-16)' }}>
        {/* ─── Botón volver ─── */}
        <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <ChevronLeft size={18} /> Volver
          </button>
        </div>

        {/* ─── Galería ─── */}
        {images.length > 0 && (
          <div className="container" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', aspectRatio: '16/9', maxHeight: 500, backgroundColor: 'var(--color-surface-hover)' }}>
              <img
                src={images[imgIndex]?.url}
                alt={`${listing.title} — foto ${imgIndex + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                    style={navBtnStyle('left')} aria-label="Foto anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                    style={navBtnStyle('right')} aria-label="Siguiente foto">
                    <ChevronRight size={20} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 'var(--space-3)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 'var(--space-1)' }}>
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        style={{ width: i === imgIndex ? 24 : 8, height: 8, borderRadius: 'var(--radius-full)', backgroundColor: i === imgIndex ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all var(--transition-base)', padding: 0 }}
                        aria-label={`Ir a foto ${i + 1}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', overflow: 'auto', paddingBottom: 'var(--space-1)' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    style={{ flexShrink: 0, width: 72, height: 54, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `2px solid ${i === imgIndex ? 'var(--color-primary)' : 'transparent'}`, cursor: 'pointer', padding: 0 }}>
                    <img src={img.url} alt={`Miniatura ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Contenido principal ─── */}
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
            {/* Columna info */}
            <div>
              {/* Encabezado */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                    <span className="badge badge-success">{typeLabel}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                      Publicado {formatRelativeDate(listing.created_at)}
                    </span>
                  </div>
                  <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>{listing.title}</h1>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                    {listing.neighborhood ? `${listing.neighborhood}, ${listing.city}` : listing.city}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-icon btn-ghost" onClick={handleShare} aria-label="Compartir">
                    <Share2 size={18} />
                  </button>
                  <button className="btn btn-icon btn-ghost" onClick={() => setShowReport(true)}
                    style={{ color: 'var(--color-danger)' }} aria-label="Reportar publicación">
                    <Flag size={18} />
                  </button>
                </div>
              </div>

              {/* Precio */}
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-card)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Precio mensual</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                  <span className="price" style={{ fontSize: 'var(--font-size-3xl)' }}>{formatPrice(listing.price)}</span>
                  <span className="price-unit">/ mes</span>
                </div>
              </div>

              {/* Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <SpecCard icon={<Bed size={20} />} label="Habitaciones" value={listing.bedrooms} />
                <SpecCard icon={<Bath size={20} />} label="Baños" value={listing.bathrooms} />
              </div>

              {/* Descripción */}
              {listing.description && (
                <Section title="Descripción">
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)', whiteSpace: 'pre-wrap' }}>
                    {listing.description}
                  </p>
                </Section>
              )}

              {/* Características */}
              {features.length > 0 && (
                <Section title="Características">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {features.map(f => (
                      <span key={f} className="badge badge-neutral" style={{ fontSize: 'var(--font-size-sm)' }}>✓ {f}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Info adicional */}
              {listing.additional_info && (
                <Section title="Información adicional">
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)', whiteSpace: 'pre-wrap' }}>
                    {listing.additional_info}
                  </p>
                </Section>
              )}
            </div>

            {/* ─── Sticky CTA WhatsApp ─── */}
            <div style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-4))', alignSelf: 'start' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>
                  ¿Te interesa esta vivienda?
                </h3>

                {listing.is_anonymous && (
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--font-weight-semibold)', color: '#92400E', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>
                      <ShieldAlert size={18} />
                      Aviso de seguridad
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#78350F', margin: 0, lineHeight: 'var(--line-height-normal)' }}>
                      Anuncio publicado por un usuario no verificado. Por tu seguridad, te recomendamos <strong>visitar la propiedad personalmente</strong> y verificar la documentación antes de realizar entregas de dinero o adelantos.
                    </p>
                  </div>
                )}

                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-full">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
                  Te conectarás directamente con el anunciante
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MODAL REPORTE ─── */}
        {showReport && (
          <div style={overlayStyle} onClick={() => { setShowReport(false); setReportDone(false); setReportReason(''); setReportDetails(''); setReportError('') }}>
            <div style={modalStyle} onClick={e => e.stopPropagation()} className="animate-slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--font-size-xl)' }}>
                  {reportDone ? '✅ Reporte enviado' : 'Reportar publicación'}
                </h3>
                <button className="btn btn-icon btn-ghost" onClick={() => { setShowReport(false); setReportDone(false) }}>
                  <X size={20} />
                </button>
              </div>

              {reportDone ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-4)' }}>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)' }}>
                    Gracias por ayudar a mantener HabitApp confiable. Revisaremos el reporte.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}
                    onClick={() => { setShowReport(false); setReportDone(false) }}>
                    Cerrar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {reportError && (
                    <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                      {reportError}
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Motivo del reporte *</label>
                    <select className="form-select" value={reportReason}
                      onChange={e => { setReportReason(e.target.value); setReportError('') }}>
                      <option value="">Selecciona un motivo</option>
                      {REPORT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Detalles adicionales <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>(opcional)</span></label>
                    <textarea className="form-textarea" placeholder="Describe brevemente el problema..."
                      value={reportDetails} onChange={e => setReportDetails(e.target.value)} style={{ minHeight: 100 }} />
                  </div>
                  {!user && (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      Debes <Link to="/login" style={{ color: 'var(--color-primary)' }}>iniciar sesión</Link> para reportar.
                    </p>
                  )}
                  <button className="btn btn-danger btn-full" onClick={submitReport} disabled={reportLoading || !user}>
                    {reportLoading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Enviando…</> : 'Enviar reporte'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── WhatsApp flotante móvil ─── */}
      <div style={{ position: 'fixed', bottom: 'calc(var(--bottom-nav-height) + var(--space-4))', left: 0, right: 0, padding: '0 var(--space-4)', zIndex: 50, display: 'none' }}
        className="mobile-whatsapp-bar">
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar por WhatsApp
        </a>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-card)' }}>
      <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>{title}</h2>
      {children}
    </div>
  )
}

function SpecCard({ icon, label, value }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
      <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
      <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{value}</span>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  )
}

function navBtnStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 'var(--space-3)',
    width: 40, height: 40, borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'var(--shadow-md)', transition: 'all var(--transition-fast)',
  }
}

const overlayStyle = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 'var(--space-4)',
}

const modalStyle = {
  backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-2xl)',
  padding: 'var(--space-6)', width: '100%', maxWidth: 460,
  boxShadow: 'var(--shadow-xl)',
}
