import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Upload, X, Plus, ShieldAlert, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_CITY, PROPERTY_TYPE_LABELS, normalizeAddress } from '../lib/utils'
import { useCities } from '../hooks/useCities'

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const FEATURES_OPTIONS = [
  'Parqueadero', 'Mascotas permitidas', 'Balcón/terraza', 'Conjunto cerrado',
  'Vigilancia 24h', 'Gimnasio', 'Piscina', 'Lavandería', 'Amoblado',
  'Agua incluida', 'Gas incluido', 'Internet incluido', 'Ascensor',
  'Cuarto de servicio', 'Depósito/bodega',
]

const emptyForm = {
  title: '', description: '', price: '',
  city: DEFAULT_CITY, address: '', neighborhood: '',
  property_type: 'apartamento', bedrooms: 1, bathrooms: 1,
  features: [], additional_info: '', whatsapp: '',
}

export default function Publish() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { cities: COLOMBIAN_CITIES } = useCities()

  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addressChecking, setAddressChecking] = useState(false)
  const [addressWarning, setAddressWarning] = useState('')
  const [createdGuestListing, setCreatedGuestListing] = useState(null)

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
    setError('')
    if (name === 'address') setAddressWarning('')
  }

  function toggleFeature(f) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }))
  }

  async function checkAddressDuplicate() {
    if (!form.address.trim()) return
    const normalized = normalizeAddress(form.address)
    if (!normalized) return

    setAddressChecking(true)
    setAddressWarning('')

    try {
      const { data, error: err } = await supabase
        .from('listings')
        .select('id')
        .eq('city', form.city)
        .eq('address_normalized', normalized)
        .eq('status', 'published')
        .maybeSingle()

      if (!err && data) {
        setAddressWarning('⚠️ Esta dirección ya se encuentra registrada. Cada vivienda solo se puede publicar una vez.')
      }
    } catch {
    } finally {
      setAddressChecking(false)
    }
  }

  function handleImageFiles(files) {
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) { setError(`Solo puedes agregar hasta ${MAX_IMAGES} fotografías.`); return }

    const toAdd = Array.from(files).slice(0, remaining)
    const errors = []

    toAdd.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" no es un formato válido (JPG, PNG, WEBP).`)
        return
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" supera el límite de ${MAX_IMAGE_SIZE_MB}MB.`)
        return
      }
      const preview = URL.createObjectURL(file)
      setImages(prev => [...prev, { file, preview }])
    })

    if (errors.length) setError(errors.join(' '))
  }

  function removeImage(index) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setError('')
  }

  function handleDrop(e) {
    e.preventDefault()
    handleImageFiles(e.dataTransfer.files)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) return setError('El título es obligatorio.')
    if (!form.price || form.price <= 0) return setError('El precio debe ser mayor a 0.')
    if (!form.city) return setError('Selecciona una ciudad.')
    if (!form.address.trim()) return setError('La dirección es obligatoria.')
    if (!form.whatsapp.trim()) return setError('El número de WhatsApp es obligatorio.')
    if (images.length === 0) return setError('Agrega al menos 1 fotografía.')
    
    const phoneDigits = form.whatsapp.replace(/\D/g, '')
    if (phoneDigits.length < 10) return setError('El número de WhatsApp debe tener al menos 10 dígitos.')

    const normalizedAddr = normalizeAddress(form.address)
    setLoading(true)

    try {
      const { data: existing } = await supabase
        .from('listings')
        .select('id')
        .eq('city', form.city)
        .eq('address_normalized', normalizedAddr)
        .eq('status', 'published')
        .maybeSingle()

      if (existing) {
        setLoading(false)
        return setError('Esta vivienda ya se encuentra publicada.')
      }

      const isAnon = !user
      const { data: listing, error: listingErr } = await supabase
        .from('listings')
        .insert({
          user_id: user ? user.id : null,
          title: form.title.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          city: form.city,
          address: form.address.trim(),
          address_normalized: normalizedAddr,
          neighborhood: form.neighborhood.trim() || null,
          property_type: form.property_type,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          features: form.features,
          additional_info: form.additional_info.trim() || null,
          whatsapp: phoneDigits,
          is_anonymous: isAnon,
          status: 'published',
        })
        .select()
        .single()

      if (listingErr) throw listingErr

      const folder = user ? user.id : `guest/${listing.id}`
      for (let i = 0; i < images.length; i++) {
        const { file } = images[i]
        const ext = file.name.split('.').pop().toLowerCase()
        const path = `${folder}/${Date.now()}_${i}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('listing-images').upload(path, file)
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path)
          await supabase.from('listing_images').insert({ listing_id: listing.id, url: urlData.publicUrl, position: i + 1 })
        }
      }

      if (isAnon) {
        setCreatedGuestListing(listing)
      } else {
        navigate(`/vivienda/${listing.id}`)
      }
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (createdGuestListing) {
    return (
      <div className="container" style={{ padding: 'var(--space-12) 0', maxWidth: 600, textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-card)' }}>
          <CheckCircle size={56} style={{ color: 'var(--color-primary)', margin: '0 auto var(--space-4)' }} />
          <h1>¡Publicada con éxito!</h1>
          <p>Tu vivienda "{createdGuestListing.title}" ya está disponible.</p>
          <div style={{ margin: 'var(--space-6) 0' }}>
            <Link to={`/vivienda/${createdGuestListing.id}`} className="btn btn-primary">Ver publicación</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Publicar vivienda — HabitApp</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-8) 0' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          {!user && (
            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)' }}>
              Estás publicando como invitado. <Link to="/login">Inicia sesión</Link> para gestionar tus anuncios.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            <FormSection title="Fotografías">
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} style={dropZoneStyle} onClick={() => document.getElementById('file-input').click()}>
                <Upload size={32} />
                <span>Haz clic o arrastra fotos ({images.length}/{MAX_IMAGES})</span>
                <input id="file-input" type="file" multiple style={{ display: 'none' }} onChange={e => handleImageFiles(e.target.files)} />
              </div>
            </FormSection>

            <FormSection title="Información principal">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Título del anuncio *</label>
                <input id="title" name="title" placeholder="Ej: Apartamento iluminado cerca a la Universidad del Quindío" className="form-input" value={form.title} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="property_type">Tipo de vivienda *</label>
                  <select id="property_type" name="property_type" className="form-select" value={form.property_type} onChange={handleChange} required>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Precio mensual (COP) *</label>
                  <input id="price" name="price" type="number" placeholder="Ej: 850000" className="form-input" value={form.price} onChange={handleChange} min={1} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bedrooms">Habitaciones *</label>
                  <select id="bedrooms" name="bedrooms" className="form-select" value={form.bedrooms} onChange={handleChange}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bathrooms">Baños *</label>
                  <select id="bathrooms" name="bathrooms" className="form-select" value={form.bathrooms} onChange={handleChange}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
                <label className="form-label" htmlFor="description">Descripción breve (Opcional)</label>
                <textarea id="description" name="description" placeholder="Ej: Recién remodelado, excelente iluminación natural..." className="form-input" style={{ minHeight: 60, resize: 'vertical' }} value={form.description} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Características adicionales</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  {FEATURES_OPTIONS.map(f => (
                    <button key={f} type="button"
                      className={`badge ${form.features.includes(f) ? 'badge-success' : 'badge-neutral'}`}
                      style={{ cursor: 'pointer', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', border: 'none' }}
                      onClick={() => toggleFeature(f)}>
                      {form.features.includes(f) ? '✓ ' : ''}{f}
                    </button>
                  ))}
                </div>
              </div>
            </FormSection>

            <FormSection title="Ubicación y Dirección Exacta">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">Ciudad *</label>
                  <select id="city" name="city" className="form-select" value={form.city} onChange={handleChange} required>
                    {COLOMBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="neighborhood">Barrio / Zona</label>
                  <input id="neighborhood" name="neighborhood" placeholder="Ej: Norte, Centro, Laureles..." className="form-input" value={form.neighborhood} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="address">Dirección exacta de la vivienda *</label>
                <input id="address" name="address" placeholder="Ej: Cra 14 # 10 Norte - 25, Apto 302" className="form-input" value={form.address} onChange={handleChange} onBlur={checkAddressDuplicate} required />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                  🔒 Requerido para verificar que no existan viviendas duplicadas.
                </p>
                {addressWarning && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' }}>{addressWarning}</p>}
              </div>
            </FormSection>

            <FormSection title="Contacto">
              <div className="form-group">
                <label className="form-label" htmlFor="whatsapp">Número de WhatsApp (Obligatorio) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 500, pointerEvents: 'none' }}>+57</span>
                  <input id="whatsapp" name="whatsapp" type="tel" placeholder="3001234567" className="form-input" value={form.whatsapp} onChange={handleChange} style={{ paddingLeft: 'var(--space-10)' }} required />
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                  ⚠️ <strong>Campo obligatorio</strong>. Los interesados te contactarán directamente a este número por WhatsApp.
                </p>
              </div>
            </FormSection>

            <button type="submit" className="btn btn-primary" disabled={loading || addressChecking}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function FormSection({ title, children }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>{children}</div>
    </div>
  )
}

const dropZoneStyle = {
  border: '2px dashed var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-10) var(--space-6)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'
}
