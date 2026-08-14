import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { X, Plus, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { PROPERTY_TYPE_LABELS, normalizeAddress } from '../lib/utils'
import { useCities } from '../hooks/useCities'

const MAX_IMAGES = 5
const FEATURES_OPTIONS = [
  'Parqueadero', 'Mascotas permitidas', 'Balcón/terraza', 'Conjunto cerrado',
  'Vigilancia 24h', 'Gimnasio', 'Piscina', 'Lavandería', 'Amoblado',
  'Agua incluida', 'Gas incluido', 'Internet incluido', 'Ascensor',
  'Cuarto de servicio', 'Depósito/bodega',
]

export default function EditListing() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { cities: COLOMBIAN_CITIES } = useCities()

  const [form, setForm]           = useState(null)
  const [existingImages, setExistingImages] = useState([]) // { id, url, position }
  const [newImages, setNewImages] = useState([])            // { file, preview }
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('listings')
        .select('*, listing_images(id, url, position)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (err || !data) { navigate('/mis-publicaciones'); return }

      setForm({
        title: data.title, description: data.description || '',
        price: data.price, city: data.city, neighborhood: data.neighborhood || '',
        property_type: data.property_type, bedrooms: data.bedrooms, bathrooms: data.bathrooms,
        features: data.features || [], additional_info: data.additional_info || '',
        whatsapp: data.whatsapp, status: data.status,
      })
      setExistingImages((data.listing_images || []).sort((a, b) => a.position - b.position))
      setLoading(false)
    }
    if (user) load()
  }, [id, user])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  function toggleFeature(f) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
    }))
  }

  const totalImages = existingImages.length + newImages.length

  function handleNewImages(files) {
    const slots = MAX_IMAGES - totalImages
    if (slots <= 0) { setError(`Máximo ${MAX_IMAGES} fotografías en total.`); return }
    Array.from(files).slice(0, slots).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { setError(`"${file.name}" supera el límite de 5MB.`); return }
      setNewImages(prev => [...prev, { file, preview: URL.createObjectURL(file) }])
    })
  }

  async function removeExistingImage(imgId) {
    await supabase.from('listing_images').delete().eq('id', imgId)
    setExistingImages(prev => prev.filter(i => i.id !== imgId))
  }

  function removeNewImage(index) {
    setNewImages(prev => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('El título es obligatorio.')
    if (!form.price || form.price <= 0) return setError('El precio debe ser mayor a 0.')
    if (!form.city) return setError('Selecciona una ciudad.')
    if (!form.whatsapp.trim()) return setError('El número de WhatsApp es obligatorio.')
    if (totalImages === 0) return setError('Agrega al menos 1 fotografía.')

    setSaving(true)
    try {
      const phoneDigits = form.whatsapp.replace(/\D/g, '')
      await supabase.from('listings').update({
        title: form.title.trim(), description: form.description.trim() || null,
        price: Number(form.price), city: form.city,
        neighborhood: form.neighborhood.trim() || null,
        property_type: form.property_type, bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms), features: form.features,
        additional_info: form.additional_info.trim() || null,
        whatsapp: phoneDigits, updated_at: new Date().toISOString(),
      }).eq('id', id)

      // Recalcular posiciones de imágenes existentes
      for (let i = 0; i < existingImages.length; i++) {
        await supabase.from('listing_images').update({ position: i + 1 }).eq('id', existingImages[i].id)
      }

      // Subir nuevas imágenes
      for (let i = 0; i < newImages.length; i++) {
        const { file } = newImages[i]
        const ext  = file.name.split('.').pop()
        const path = `${user.id}/${id}/${Date.now()}_${i}.${ext}`
        await supabase.storage.from('listing-images').upload(path, file, { contentType: file.type })
        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path)
        await supabase.from('listing_images').insert({ listing_id: id, url: publicUrl, position: existingImages.length + i + 1 })
      }

      navigate('/mis-publicaciones')
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  return (
    <>
      <Helmet><title>Editar publicación — HabitApp</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-8) 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <button onClick={() => navigate('/mis-publicaciones')} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <ChevronLeft size={18} /> Volver
          </button>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-8)' }}>Editar publicación</h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {error && (
              <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', display: 'flex', justifyContent: 'space-between' }}>
                {error} <button type="button" onClick={() => setError('')}><X size={16} /></button>
              </div>
            )}

            {/* Fotos */}
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>Fotografías ({totalImages}/{MAX_IMAGES})</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>La primera foto es la imagen principal.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
                {existingImages.map((img, i) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '4/3', border: i === 0 ? '2px solid var(--color-primary)' : '2px solid var(--color-border)' }}>
                    <img src={img.url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(34,197,94,0.9)', color: 'white', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '3px 0' }}>PRINCIPAL</span>}
                    <button type="button" onClick={() => removeExistingImage(img.id)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {newImages.map((img, i) => (
                  <div key={`new-${i}`} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '4/3', border: '2px solid var(--color-info)', opacity: 0.9 }}>
                    <img src={img.preview} alt="Nueva" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(59,130,246,0.9)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>NUEVA</span>
                    <button type="button" onClick={() => removeNewImage(i)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {totalImages < MAX_IMAGES && (
                  <button type="button" onClick={() => document.getElementById('edit-img-input').click()}
                    style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)', color: 'var(--color-text-muted)', cursor: 'pointer', backgroundColor: 'var(--color-surface-hover)' }}>
                    <Plus size={20} /><span style={{ fontSize: 11 }}>Agregar</span>
                  </button>
                )}
              </div>
              <input id="edit-img-input" type="file" accept="image/jpeg,image/png,image/webp" multiple
                style={{ display: 'none' }} onChange={e => handleNewImages(e.target.files)} />
            </div>

            {/* Campos principales — reutilizamos la misma estructura que Publish */}
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Información básica</h2>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input name="title" type="text" className="form-input" value={form.title} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select name="property_type" className="form-select" value={form.property_type} onChange={handleChange}>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Precio mensual (COP / mes) *</label>
                  <input name="price" type="number" className="form-input" value={form.price} onChange={handleChange} min={1} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad *</label>
                  <select name="city" className="form-select" value={form.city} onChange={handleChange} required>
                    {COLOMBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Barrio / zona</label>
                  <input name="neighborhood" type="text" className="form-input" value={form.neighborhood} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Habitaciones</label>
                  <select name="bedrooms" className="form-select" value={form.bedrooms} onChange={handleChange}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Baños</label>
                  <select name="bathrooms" className="form-select" value={form.bathrooms} onChange={handleChange}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción breve (Opcional)</label>
                <textarea name="description" className="form-textarea" placeholder="Ej: Recién remodelado..." style={{ minHeight: 60, resize: 'vertical' }} value={form.description} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Características</label>
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
              <div className="form-group">
                <label className="form-label">Número de WhatsApp (Obligatorio) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 500, pointerEvents: 'none' }}>+57</span>
                  <input name="whatsapp" type="tel" className="form-input" value={form.whatsapp} onChange={handleChange} style={{ paddingLeft: 'var(--space-10)' }} required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 22, height: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Guardando…</> : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
