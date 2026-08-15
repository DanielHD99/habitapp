import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SlidersHorizontal, X, Search as SearchIcon, Home } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PROPERTY_TYPE_LABELS } from '../lib/utils'
import { useCities } from '../hooks/useCities'
import ListingCard from '../components/listings/ListingCard'

const PRICE_OPTIONS = [
  { label: 'Cualquier precio', value: '' },
  { label: 'Hasta $500.000',  value: '500000' },
  { label: 'Hasta $800.000',  value: '800000' },
  { label: 'Hasta $1.200.000', value: '1200000' },
  { label: 'Hasta $2.000.000', value: '2000000' },
  { label: 'Hasta $3.000.000', value: '3000000' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { cities: COLOMBIAN_CITIES } = useCities()
  const [listings, setListings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [showFilters, setShowFilters] = useState(true)

  const [filters, setFilters] = useState({
    city:         searchParams.get('ciudad') || '',
    neighborhood: searchParams.get('barrio') || '',
    type:         searchParams.get('tipo') || '',
    source:       searchParams.get('fuente') || '',
    minPrice:     searchParams.get('precioMin') || '',
    maxPrice:     searchParams.get('precioMax') || '',
    bedrooms:     searchParams.get('habitaciones') || '',
    bathrooms:    searchParams.get('banos') || '',
  })

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('*, listing_images(url, position)', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (filters.city)         query = query.eq('city', filters.city)
      if (filters.neighborhood) query = query.ilike('neighborhood', `%${filters.neighborhood}%`)
      if (filters.type)         query = query.eq('property_type', filters.type)
      
      if (filters.source === 'direct') {
        query = query.or('source_platform.eq.direct,source_platform.is.null')
      } else if (filters.source) {
        query = query.eq('source_platform', filters.source)
      }

      if (filters.minPrice)     query = query.gte('price', Number(filters.minPrice))
      if (filters.maxPrice)     query = query.lte('price', Number(filters.maxPrice))
      if (filters.bedrooms)     query = query.gte('bedrooms', Number(filters.bedrooms))
      if (filters.bathrooms)    query = query.gte('bathrooms', Number(filters.bathrooms))

      const { data, count, error } = await query.limit(40)
      if (!error && data) {
        setListings(data.map(l => ({
          ...l,
          listing_images: (l.listing_images || []).sort((a, b) => a.position - b.position)
        })))
        setTotal(count || 0)
      } else {
        console.error('Error cargando listings:', error)
        setListings([])
        setTotal(0)
      }
    } catch (err) {
      console.error('Exception en fetchListings:', err)
      setListings([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchListings() }, [fetchListings])

  function applyFilters(newFilters) {
    setFilters(newFilters)
    const params = {}
    if (newFilters.city)         params.ciudad = newFilters.city
    if (newFilters.neighborhood) params.barrio = newFilters.neighborhood
    if (newFilters.type)         params.tipo = newFilters.type
    if (newFilters.source)       params.fuente = newFilters.source
    if (newFilters.minPrice)     params.precioMin = newFilters.minPrice
    if (newFilters.maxPrice)     params.precioMax = newFilters.maxPrice
    if (newFilters.bedrooms)     params.habitaciones = newFilters.bedrooms
    if (newFilters.bathrooms)    params.banos = newFilters.bathrooms
    setSearchParams(params)
  }

  function clearFilters() {
    const empty = { city: '', neighborhood: '', type: '', source: '', minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '' }
    setFilters(empty)
    setSearchParams({})
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <>
      <Helmet>
        <title>Buscar viviendas para arrendar en Armenia — HabitApp</title>
        <meta name="description" content="Busca apartamentos, casas y habitaciones para arrendar en Armenia, Quindío. Filtra por barrio, precio, habitaciones y más." />
      </Helmet>

      <div style={{ padding: 'var(--space-6) 0', backgroundColor: 'var(--color-bg)', minHeight: '80vh' }}>
        <div className="container">

          {/* ─── Encabezado ─── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Buscar viviendas en Armenia</h1>
              {!loading && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                  {total} vivienda{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowFilters(!showFilters)}
              style={{ position: 'relative' }}
            >
              <SlidersHorizontal size={16} />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              {activeCount > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* ─── Pestañas de Acceso Rápido por Tipo ─── */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px', marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Todos los tipos', value: '' },
              { label: 'Apartamentos', value: 'apartamento' },
              { label: 'Casas', value: 'casa' },
              { label: 'Habitaciones', value: 'habitacion' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => applyFilters({ ...filters, type: t.value })}
                className={`btn btn-sm ${filters.type === t.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ─── Panel de filtros ─── */}
          {showFilters && (
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}
              className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <select className="form-select" value={filters.city}
                    onChange={e => applyFilters({ ...filters, city: e.target.value })}>
                    {COLOMBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Barrio / zona</label>
                  <input className="form-input" type="text" placeholder="Ej: Castellana, Laureles"
                    value={filters.neighborhood}
                    onChange={e => applyFilters({ ...filters, neighborhood: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de vivienda</label>
                  <select className="form-select" value={filters.type}
                    onChange={e => applyFilters({ ...filters, type: e.target.value })}>
                    <option value="">Todos los tipos</option>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio máximo</label>
                  <select className="form-select" value={filters.maxPrice}
                    onChange={e => applyFilters({ ...filters, maxPrice: e.target.value })}>
                    {PRICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Habitaciones (mín)</label>
                  <select className="form-select" value={filters.bedrooms}
                    onChange={e => applyFilters({ ...filters, bedrooms: e.target.value })}>
                    <option value="">Cualquiera</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Baños (mín)</label>
                  <select className="form-select" value={filters.bathrooms}
                    onChange={e => applyFilters({ ...filters, bathrooms: e.target.value })}>
                    <option value="">Cualquiera</option>
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}
                  style={{ marginTop: 'var(--space-4)', color: 'var(--color-danger)' }}>
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* ─── Chips de filtros activos ─── */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              {filters.city && <FilterChip label={`Ciudad: ${filters.city}`} onRemove={() => applyFilters({ ...filters, city: '' })} />}
              {filters.type && <FilterChip label={`Tipo: ${PROPERTY_TYPE_LABELS[filters.type]}`} onRemove={() => applyFilters({ ...filters, type: '' })} />}
              {filters.maxPrice && <FilterChip label={`Máx: $${Number(filters.maxPrice).toLocaleString('es-CO')}`} onRemove={() => applyFilters({ ...filters, maxPrice: '' })} />}
              {filters.bedrooms && <FilterChip label={`${filters.bedrooms}+ hab.`} onRemove={() => applyFilters({ ...filters, bedrooms: '' })} />}
              {filters.bathrooms && <FilterChip label={`${filters.bathrooms}+ baños`} onRemove={() => applyFilters({ ...filters, bathrooms: '' })} />}
            </div>
          )}

          {/* ─── Grid de resultados ─── */}
          {loading ? (
            <div style={gridStyle}>
              {Array(6).fill(0).map((_, i) => (
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
              <Home size={48} />
              <h3>No encontramos viviendas</h3>
              <p>Intenta ajustar los filtros para ver más resultados.</p>
              {hasActiveFilters && (
                <button className="btn btn-outline" onClick={clearFilters}>
                  <X size={16} /> Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div style={gridStyle} className="animate-fade-in">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}>
        <X size={12} />
      </button>
    </span>
  )
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 'var(--space-6)',
}
