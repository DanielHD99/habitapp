import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, MapPin, Home as HomeIcon, Building2, BedDouble, Shield, MessageCircle, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PROPERTY_TYPE_LABELS } from '../lib/utils'
import { parseSmartQuery } from '../lib/smartSearch'
import { useCities } from '../hooks/useCities'
import ListingCard from '../components/listings/ListingCard'

export default function Home() {
  const { city: urlCity } = useParams()
  const navigate = useNavigate()
  const { cities: COLOMBIAN_CITIES } = useCities()

  const decodedUrlCity = urlCity ? decodeURIComponent(urlCity) : ''
  const matchedCity = COLOMBIAN_CITIES.find(c => c.toLowerCase() === decodedUrlCity.toLowerCase())
  const displayCity = matchedCity || (decodedUrlCity ? decodedUrlCity.charAt(0).toUpperCase() + decodedUrlCity.slice(1) : 'tu ciudad')

  const [searchQuery, setSearchQuery] = useState('')
  const [search, setSearch] = useState({ city: '', type: '' })
  const [searchError, setSearchError] = useState('')
  
  useEffect(() => {
    if (matchedCity) {
      setSearchQuery(`en ${matchedCity}`)
      setSearch(p => ({ ...p, city: matchedCity }))
    } else if (!urlCity) {
      setSearchQuery('')
      setSearch(p => ({ ...p, city: '' }))
    }
  }, [matchedCity, urlCity])

  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true)
      let query = supabase
        .from('listings')
        .select('*, listing_images(url, position)')
        .eq('status', 'published')

      if (urlCity) {
        query = query.ilike('city', decodeURIComponent(urlCity))
      }

      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(8)

      if (data) {
        setListings(data.map(l => ({
          ...l,
          listing_images: (l.listing_images || []).sort((a, b) => a.position - b.position)
        })))
      }
      setLoading(false)
    }
    fetchFeatured()
  }, [urlCity])

  function handleSearch(e) {
    e.preventDefault()
    setSearchError('')
    
    // Parse the smart query
    const parsed = parseSmartQuery(searchQuery, COLOMBIAN_CITIES)
    
    // Merge filters (dropdowns fallback if text doesn't specify)
    const finalCity = parsed.city || search.city
    const finalType = parsed.type || search.type
    const finalBedrooms = parsed.bedrooms || ''

    if (finalCity && !finalType && !finalBedrooms) {
      // Just city -> go to city landing
      navigate(`/${encodeURIComponent(finalCity.toLowerCase())}`)
    } else if (finalCity || finalType || finalBedrooms) {
      // Multiple parameters -> go to search
      const params = new URLSearchParams()
      if (finalCity) params.set('ciudad', finalCity)
      if (finalType) params.set('tipo', finalType)
      if (finalBedrooms) params.set('habitaciones', finalBedrooms)
      navigate(`/buscar?${params.toString()}`)
    } else if (searchQuery.trim()) {
      navigate(`/buscar`)
    }
  }

  return (
    <>
      <Helmet>
        <title>HabitApp — Encuentra tu próximo hogar en {displayCity}</title>
        <meta name="description" content={`Arriendos de apartamentos, casas y habitaciones en ${displayCity}. Contacta directamente por WhatsApp.`} />
      </Helmet>

      {/* ─── HERO ─── */}
      <section style={heroStyle}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 680, marginInline: 'auto', textAlign: 'center' }}>
            <div style={heroBadgeStyle}>
              <MapPin size={14} /> Solo arriendos · {displayCity} 🇨🇴
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', lineHeight: 1.15, marginBottom: 'var(--space-4)' }}>
              Encuentra tu <span style={{ color: 'var(--color-primary)' }}>próximo hogar</span> en {displayCity}
            </h1>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', lineHeight: 'var(--line-height-relaxed)' }}>
              Apartamentos, casas y habitaciones para arrendar en {displayCity}.<br />Contáctate directamente por WhatsApp.
            </p>

            {/* ─── Buscador Combinado ─── */}
            <form onSubmit={handleSearch} style={{...searchBoxStyle, flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)'}}>
              {/* Búsqueda por Texto */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 'var(--space-3)' }}>
                <Search size={20} color="var(--color-text-muted)" />
                <input
                  type="text"
                  placeholder="Ej: Apartamento en Manizales con 2 habitaciones..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', boxShadow: 'none',
                    width: '100%', fontSize: 'var(--font-size-base)', outline: 'none', color: 'var(--color-text)'
                  }}
                />
              </div>

              {/* Filtros Desplegables Clásicos */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textAlign: 'left', paddingLeft: 'var(--space-2)' }}>
                    O elige la ciudad
                  </label>
                  <select
                    className="form-select"
                    value={search.city}
                    onChange={e => {
                      const val = e.target.value
                      setSearch(p => ({ ...p, city: val }))
                      if (val) setSearchQuery(`en ${val}`)
                      else setSearchQuery('')
                      
                      if (val && !search.type) {
                        navigate(`/${encodeURIComponent(val.toLowerCase())}`)
                      } else if (!val && !search.type) {
                        navigate('/')
                      }
                    }}
                    style={{ border: 'none', background: 'var(--color-bg)', boxShadow: 'none' }}
                  >
                    <option value="">Todas las ciudades</option>
                    {COLOMBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textAlign: 'left', paddingLeft: 'var(--space-2)' }}>
                    Tipo de vivienda
                  </label>
                  <select
                    className="form-select"
                    value={search.type}
                    onChange={e => setSearch(p => ({ ...p, type: e.target.value }))}
                    style={{ border: 'none', background: 'var(--color-bg)', boxShadow: 'none' }}
                  >
                    <option value="">Todos los tipos</option>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-3) var(--space-6)', flexShrink: 0, height: '42px' }}>
                  Buscar
                </button>
              </div>
              
              {/* Mensaje de Error */}
              {searchError && (
                <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', textAlign: 'left', width: '100%', paddingLeft: 'var(--space-2)' }}>
                  {searchError}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Decoración fondo */}
        <div style={heroDecorStyle} />
      </section>

      {/* ─── CÓMO FUNCIONA ─── */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-2xl)' }}>
            ¿Cómo funciona?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--space-10)' }}>
            Simple y directo. Sin intermediarios.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
            {[
              { icon: <Search size={28} />, step: '01', title: 'Encuentra', desc: 'Busca y filtra viviendas en tu ciudad preferida.' },
              { icon: <HomeIcon size={28} />, step: '02', title: 'Revisa', desc: 'Explora fotos, precios y características al detalle.' },
              { icon: <MessageCircle size={28} />, step: '03', title: 'Contacta', desc: 'Escríbele al anunciante directo por WhatsApp.' },
            ].map(item => (
              <div key={item.step} style={howCardStyle}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>PASO {item.step}</span>
                <h3 style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VIVIENDAS RECIENTES ─── */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--color-surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h2 style={{ marginBottom: 'var(--space-1)' }}>Viviendas disponibles</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Las más recientes publicadas en HabitApp</p>
            </div>
            <Link to="/buscar" className="btn btn-outline btn-sm">
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="card" style={{ height: 340 }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div className="skeleton" style={{ height: 20, width: '60%' }} />
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <HomeIcon size={48} />
              <p>Aún no hay viviendas publicadas. ¡Sé el primero!</p>
              <Link to="/publicar" className="btn btn-primary">Publicar vivienda</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── BANNER PUBLICAR ─── */}
      <section style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>
            ¿Tienes una vivienda para arrendar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-8)', maxWidth: 480, marginInline: 'auto' }}>
            Publica gratis en minutos y recibe interesados directamente por WhatsApp.
          </p>
          <Link to="/publicar" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', backgroundColor: 'white', color: 'var(--color-primary-dark)', fontWeight: 'var(--font-weight-bold)', padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-xl)', fontSize: 'var(--font-size-lg)', textDecoration: 'none', transition: 'transform var(--transition-base), box-shadow var(--transition-base)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            Publicar vivienda gratis
          </Link>
        </div>
      </section>

      {/* ─── BENEFICIOS ─── */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', textAlign: 'center' }}>
            {[
              { icon: <Shield size={24} />, title: 'Comunidad segura', desc: 'Sistema de reportes para mantener publicaciones confiables.' },
              { icon: <MessageCircle size={24} />, title: 'Contacto directo', desc: 'Habla directamente con el anunciante por WhatsApp.' },
              { icon: <MapPin size={24} />, title: 'Por ubicación', desc: 'Filtra por ciudad y barrio para encontrar tu zona ideal.' },
              { icon: <Star size={24} />, title: 'Publicación gratis', desc: 'Publica tu vivienda sin costo y llega a más personas.' },
            ].map(b => (
              <div key={b.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-6)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  {b.icon}
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>{b.title}</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const heroStyle = {
  position: 'relative',
  paddingTop: 'var(--space-20)',
  paddingBottom: 'var(--space-16)',
  overflow: 'hidden',
  background: 'linear-gradient(160deg, var(--color-primary-50) 0%, #ffffff 55%, var(--color-bg) 100%)',
}

const heroBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  backgroundColor: 'var(--color-primary-100)',
  color: 'var(--color-primary-dark)',
  padding: 'var(--space-1) var(--space-4)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  marginBottom: 'var(--space-5)',
}

const searchBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-2xl)',
  padding: 'var(--space-3)',
  boxShadow: 'var(--shadow-xl)',
  gap: 'var(--space-2)',
  border: '1px solid var(--color-border)',
  flexWrap: 'wrap',
}

const heroDecorStyle = {
  position: 'absolute',
  top: '-40%',
  right: '-10%',
  width: '50vw',
  height: '130%',
  background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 70%)',
  pointerEvents: 'none',
}

const howCardStyle = {
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-card)',
}
