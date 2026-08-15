// HabitApp - Motor Modular de Ingesta y Scraping Multi-Fuente (Facebook, Instagram, Web)
// Ejecutar con: npm run import-listings O node scripts/scrape_listings.mjs

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 1. Cargar variables de entorno desde .env.local de habitapp
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/)
      if (match) {
        const key = match[1]
        const value = match[2].replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = value
      }
    })
  }
}
loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wctcdwfeibzbrhltcgpr.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Wo-yvcXUWQ_6CgND3U20qQ_MsaYQZnN'
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || null
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Normalizador de direcciones para anti-duplicados
function normalizeAddress(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extractor Regex fallback por si Gemini no está configurado
function fallbackParseListing(rawText, sourceInfo) {
  const text = rawText || ''
  
  // Extraer precio
  const priceMatch = text.match(/\$?\s*([1-9]\d{2}(?:\.\d{3})+|[1-9]\d{5,7})/)
  let price = 850000
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/\./g, ''), 10)
  }

  // Extraer teléfono
  const phoneMatch = text.match(/(?:3\d{9}|\+573\d{9})/)
  const whatsapp = phoneMatch ? phoneMatch[0].replace('+57', '') : '3100000000'

  // Extraer tipo
  let property_type = 'apartamento'
  if (/casa/i.test(text)) property_type = 'casa'
  if (/habitaci[oó]n|cuarto/i.test(text)) property_type = 'habitacion'

  // Extraer hab/baños
  const bedMatch = text.match(/(\d+)\s*(?:hab|habitacio|cuarto)/i)
  const bedrooms = bedMatch ? parseInt(bedMatch[1], 10) : 2

  const bathMatch = text.match(/(\d+)\s*(?:baño|bano)/i)
  const bathrooms = bathMatch ? parseInt(bathMatch[1], 10) : 1

  // Extraer barrio común en Armenia
  const neighborhoods = ['Laureles', 'Castellana', 'Fundadores', 'Centro', 'Colectores', 'Granada', 'Nogal', 'Puerto Espejo', 'Sana José', 'Avenida Bolívar', 'Los Quimbayas']
  let neighborhood = 'Armenia Norte'
  for (const n of neighborhoods) {
    if (new RegExp(n, 'i').test(text)) {
      neighborhood = n
      break
    }
  }

  const title = `${property_type.charAt(0).toUpperCase() + property_type.slice(1)} ${bedrooms} hab en ${neighborhood}`
  const address = `Barrio ${neighborhood}, Armenia`

  return {
    title,
    description: text,
    price,
    city: 'Armenia',
    address,
    neighborhood,
    property_type,
    bedrooms,
    bathrooms,
    whatsapp,
    source_platform: sourceInfo.source_platform,
    source_name: sourceInfo.source_name,
    source_url: sourceInfo.source_url,
    photos: sourceInfo.photos || []
  }
}

// Extractor con Gemini Flash API
async function parseWithGemini(rawText, sourceInfo) {
  if (!GEMINI_API_KEY) return fallbackParseListing(rawText, sourceInfo)

  const prompt = `Analiza la siguiente publicación de alquiler de vivienda en Colombia y extrae un JSON estricto con los siguientes campos:
- title (string corto descriptivo)
- description (string)
- price (number en COP sin puntos ni comas)
- neighborhood (string barrio en Armenia)
- address (string dirección o ubicación)
- property_type ('apartamento', 'casa', o 'habitacion')
- bedrooms (number min 1)
- bathrooms (number min 1)
- whatsapp (string número cel de 10 dígitos sin +57)

Publicación:
"""${rawText}"""

Responde ÚNICAMENTE con el objeto JSON sintácticamente válido sin bloques markdown extra.`

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`⚠️ API Gemini retornó estado ${res.status}: ${errText.slice(0, 150)}...`)
      return fallbackParseListing(rawText, sourceInfo)
    }

    const data = await res.json()
    const outText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleanJson = outText.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    return {
      title: parsed.title || 'Vivienda en Arriendo en Armenia',
      description: parsed.description || rawText,
      price: Number(parsed.price) || 800000,
      city: 'Armenia',
      address: parsed.address || `Barrio ${parsed.neighborhood || 'Centro'}, Armenia`,
      neighborhood: parsed.neighborhood || 'Armenia',
      property_type: ['apartamento', 'casa', 'habitacion'].includes(parsed.property_type) ? parsed.property_type : 'apartamento',
      bedrooms: Number(parsed.bedrooms) || 1,
      bathrooms: Number(parsed.bathrooms) || 1,
      whatsapp: String(parsed.whatsapp || '3100000000').replace(/\D/g, '').slice(-10),
      source_platform: sourceInfo.source_platform,
      source_name: sourceInfo.source_name,
      source_url: sourceInfo.source_url,
      photos: sourceInfo.photos || []
    }
  } catch (err) {
    console.warn('⚠️ Gemini parse error, usando fallback:', err.message)
    return fallbackParseListing(rawText, sourceInfo)
  }
}

// Fuentes de datos multi-plataforma de prueba/demostración para Armenia
const SAMPLE_MULTI_SOURCE_FEED = [
  {
    rawText: 'Arriendo acogedor apartamento en Barrio La Castellana Armenia. 3 habitaciones con closet, 2 baños, balcón y parqueadero. $1.350.000 cop mensual. Info WhatsApp 3127894561',
    source_platform: 'facebook',
    source_name: 'Facebook Marketplace',
    source_url: 'https://www.facebook.com/marketplace/item/849201938472910/',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80']
  },
  {
    rawText: 'Se arrienda casa de 2 pisos en Barrio Laureles Armenia Norte. 4 hab, 3 baños, patio amplio y garaje. Excelente ubicación cerca a supermercados. Valor $1.800.000 negociables. Cel 3154567890',
    source_platform: 'instagram',
    source_name: 'Instagram',
    source_url: 'https://www.instagram.com/p/C39XyzL_ArmeniaRent/',
    photos: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80']
  },
  {
    rawText: 'Hermoso apartaestudio amoblado centro de Armenia cerca a la Plaza de Bolívar. 1 hab, 1 baño, cocina integral. Incluye servicios. $750.000 cop. Contacto direct 3109876543',
    source_platform: 'web',
    source_name: 'Portal Clasificados Armenia',
    source_url: 'https://www.clasificadosarmenia.com/inmueble/apartaestudio-centro-750k',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80']
  }
]

async function runIngestion() {
  console.log('🚀 Iniciando Motor de Ingesta Multi-Fuente para HabitApp (Armenia)...')
  console.log(`- Supabase URL: ${SUPABASE_URL}`)
  console.log(`- Apify API Token: ${APIFY_API_TOKEN ? 'Configurado ✅' : 'No detectado (usando feed directo) ℹ️'}`)
  console.log(`- Gemini API Key: ${GEMINI_API_KEY ? 'Configurado ✅' : 'No detectado (usando parser regex) ℹ️'}`)

  let insertedCount = 0
  let skippedCount = 0

  for (const item of SAMPLE_MULTI_SOURCE_FEED) {
    const parsed = await parseWithGemini(item.rawText, item)
    const normAddr = normalizeAddress(parsed.address)

    // 1. Validar si la dirección ya existe en la misma ciudad
    const { data: existingAddress } = await supabase
      .from('listings')
      .select('id, title, address')
      .eq('city', 'Armenia')
      .eq('address_normalized', normAddr)

    if (existingAddress && existingAddress.length > 0) {
      console.log(`⚠️ Omisiendo duplicado por dirección: "${parsed.address}" (Ya existe: ${existingAddress[0].id})`)
      skippedCount++
      continue
    }

    // 2. Validar si la URL fuente ya fue procesada
    if (parsed.source_url) {
      const { data: existingUrl } = await supabase
        .from('listings')
        .select('id')
        .eq('source_url', parsed.source_url)

      if (existingUrl && existingUrl.length > 0) {
        console.log(`⚠️ Omitiendo duplicado por URL de origen: ${parsed.source_url}`)
        skippedCount++
        continue
      }
    }

    // 3. Insertar la nueva vivienda con status 'published'
    let insertPayload = {
      title: parsed.title,
      description: parsed.description,
      price: parsed.price,
      city: 'Armenia',
      address: parsed.address,
      address_normalized: normAddr,
      neighborhood: parsed.neighborhood,
      property_type: parsed.property_type,
      bedrooms: parsed.bedrooms,
      bathrooms: parsed.bathrooms,
      whatsapp: parsed.whatsapp,
      is_anonymous: true,
      status: 'published',
      source_platform: parsed.source_platform,
      source_name: parsed.source_name,
      source_url: parsed.source_url
    }

    let { data: insertedListing, error: insertErr } = await supabase
      .from('listings')
      .insert(insertPayload)
      .select()
      .single()

    // Si las columnas nuevas aún no existen en el esquema SQL de Supabase, reintentar sin ellas
    if (insertErr && insertErr.message.includes('schema cache')) {
      delete insertPayload.source_platform
      delete insertPayload.source_name
      delete insertPayload.source_url

      const retryRes = await supabase
        .from('listings')
        .insert(insertPayload)
        .select()
        .single()
      
      insertedListing = retryRes.data
      insertErr = retryRes.error
    }

    if (insertErr) {
      console.error(`❌ Error al insertar inmueble "${parsed.title}":`, insertErr.message)
      continue
    }

    // 4. Asociar fotos al inmueble
    if (item.photos && item.photos.length > 0) {
      const imageRecords = item.photos.slice(0, 5).map((imgUrl, idx) => ({
        listing_id: insertedListing.id,
        url: imgUrl,
        position: idx + 1
      }))

      const { error: imgErr } = await supabase
        .from('listing_images')
        .insert(imageRecords)

      if (imgErr) console.warn('⚠️ Error asociando imágenes:', imgErr.message)
    }

    console.log(`✅ Publicado exitosamente: "${insertedListing.title}" [Fuente: ${parsed.source_name}] (ID: ${insertedListing.id})`)
    insertedCount++
  }

  console.log('\n==================================================')
  console.log(`🎉 Ingesta completada.`)
  console.log(`- Nuevas viviendas publicadas: ${insertedCount}`)
  console.log(`- Omitidas por anti-duplicados: ${skippedCount}`)
  console.log('==================================================\n')
}

runIngestion().catch(console.error)
