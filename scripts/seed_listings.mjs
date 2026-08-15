// Script para insertar 10 viviendas de Armenia en Supabase
// Ejecutar con: node seed_listings.mjs

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://wctcdwfeibzbrhltcgpr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Wo-yvcXUWQ_6CgND3U20qQ_MsaYQZnN'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const PLACEHOLDER_PATH = path.join(__dirname, 'listing_placeholder.png')

const PRICE_NOTE = '\n\n⚠️ El precio publicado es referencial. Para conocer el valor exacto del arriendo, comunícate directamente con el arrendador por WhatsApp.'

const listings = [
  {
    title: 'Apartaestudio en Fundadores',
    description: 'Cómodo apartaestudio con 1 ambiente, cocina, baño y patio de ropas. Excelente ubicación en el Barrio Fundadores.' + PRICE_NOTE,
    price: 450000,
    city: 'Armenia',
    address: 'Calle 10 Norte # 14-27',
    neighborhood: 'Fundadores',
    property_type: 'apartamento',
    bedrooms: 1,
    bathrooms: 1,
    features: [],
    whatsapp: '3104787313',
  },
  {
    title: 'Apartamento 3 hab en La Castellana',
    description: 'Amplio apartamento con 3 habitaciones con clóset, 2 baños, sala comedor, cocina y patio de ropas. Barrio La Castellana.' + PRICE_NOTE,
    price: 750000,
    city: 'Armenia',
    address: 'Carrera 19 B Norte # 7-51',
    neighborhood: 'La Castellana',
    property_type: 'apartamento',
    bedrooms: 3,
    bathrooms: 2,
    features: [],
    whatsapp: '3146728590',
  },
  {
    title: 'Apartamento en Condominio Sevilla',
    description: '3 habitaciones con clóset, 2 baños, sala comedor, cocina y patio de ropas. Condominio Sevilla, Torre 3 Apto 303.' + PRICE_NOTE,
    price: 800000,
    city: 'Armenia',
    address: 'Calle 50 # 15-65, Torre 3 Apto 303',
    neighborhood: 'Condominio Sevilla',
    property_type: 'apartamento',
    bedrooms: 3,
    bathrooms: 2,
    features: ['Conjunto cerrado'],
    whatsapp: '3175056719',
  },
  {
    title: 'Apartamento en Conjunto Residencial Ocaso',
    description: '2 habitaciones con clóset, 1 baño, sala comedor, cocina y patio de ropas. Conjunto Residencial Ocaso, Apto 302 Torre 1.' + PRICE_NOTE,
    price: 600000,
    city: 'Armenia',
    address: 'Conjunto Residencial Ocaso, Apto 302 Torre 1',
    neighborhood: 'Ocaso',
    property_type: 'apartamento',
    bedrooms: 2,
    bathrooms: 1,
    features: ['Conjunto cerrado'],
    whatsapp: '3104003272',
  },
  {
    title: 'Apartamento en Conjunto Lobelo Torre A',
    description: '2 habitaciones con clóset, 2 baños, sala comedor, cocina y patio de ropas. Conjunto Residencial Lobelo, Torre A Apto 202.' + PRICE_NOTE,
    price: 650000,
    city: 'Armenia',
    address: 'Conjunto Residencial Lobelo, Apto 202 Torre A',
    neighborhood: 'Lobelo',
    property_type: 'apartamento',
    bedrooms: 2,
    bathrooms: 2,
    features: ['Conjunto cerrado'],
    whatsapp: '3002678103',
  },
  {
    title: 'Apartamento en Conjunto Lobelo Torre B',
    description: '2 habitaciones con clóset, 2 baños, sala comedor, cocina y patio de ropas. Conjunto Residencial Lobelo, Torre B Apto 203.' + PRICE_NOTE,
    price: 650000,
    city: 'Armenia',
    address: 'Conjunto Residencial Lobelo, Apto 203 Torre B',
    neighborhood: 'Lobelo',
    property_type: 'apartamento',
    bedrooms: 2,
    bathrooms: 2,
    features: ['Conjunto cerrado'],
    whatsapp: '3225994458',
  },
  {
    title: 'Casa en Barrio La Isabela',
    description: '3 habitaciones con clóset, 1 baño, sala comedor, cocina y patio de ropas. Casa independiente en Barrio La Isabela.' + PRICE_NOTE,
    price: 700000,
    city: 'Armenia',
    address: 'Carrera 23 # 12-48',
    neighborhood: 'La Isabela',
    property_type: 'casa',
    bedrooms: 3,
    bathrooms: 1,
    features: [],
    whatsapp: '3173683668',
  },
  {
    title: 'Apartamento 2 hab en La Castellana',
    description: '2 habitaciones con clóset, 2 baños, sala comedor, cocina y patio de ropas. Barrio La Castellana.' + PRICE_NOTE,
    price: 680000,
    city: 'Armenia',
    address: 'Calle 7 Norte # 18A-51',
    neighborhood: 'La Castellana',
    property_type: 'apartamento',
    bedrooms: 2,
    bathrooms: 2,
    features: [],
    whatsapp: '3145554373',
  },
  {
    title: 'Apartamento en Conjunto Puerto Espejo',
    description: '2 habitaciones, 1 baño, sala comedor y cocina. Conjunto Residencial Puerto Espejo, Torre 1 Apto 301.' + PRICE_NOTE,
    price: 580000,
    city: 'Armenia',
    address: 'Conjunto Residencial Puerto Espejo, Torre 1 Apto 301',
    neighborhood: 'Puerto Espejo',
    property_type: 'apartamento',
    bedrooms: 2,
    bathrooms: 1,
    features: ['Conjunto cerrado'],
    whatsapp: '3136241817',
  },
  {
    title: 'Casa en Barrio San Martín',
    description: '3 habitaciones, 1 baño, sala comedor y cocina. Casa independiente en el Barrio San Martín.' + PRICE_NOTE,
    price: 650000,
    city: 'Armenia',
    address: 'Carrera 14 # 21-54',
    neighborhood: 'San Martín',
    property_type: 'casa',
    bedrooms: 3,
    bathrooms: 1,
    features: [],
    whatsapp: '3106481743',
  },
]

function normalizeAddress(addr) {
  return addr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function uploadPlaceholder(listingId) {
  const fileBuffer = fs.readFileSync(PLACEHOLDER_PATH)
  const path = `seed/${listingId}/placeholder.png`

  const { error } = await supabase.storage
    .from('listing-images')
    .upload(path, fileBuffer, { contentType: 'image/png', upsert: true })

  if (error) {
    console.warn(`  ⚠️  No se pudo subir la imagen: ${error.message}`)
    return null
  }

  const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
  return data.publicUrl
}

async function run() {
  console.log('🚀 Iniciando inserción de viviendas...\n')

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i]
    console.log(`📦 [${i + 1}/${listings.length}] Insertando: ${l.title}`)

    // 1. Insertar el listing
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .insert({
        title: l.title,
        description: l.description,
        price: l.price,
        city: l.city,
        address: l.address,
        address_normalized: normalizeAddress(l.address),
        neighborhood: l.neighborhood,
        property_type: l.property_type,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        features: l.features,
        whatsapp: l.whatsapp,
        is_anonymous: true,
        status: 'published',
      })
      .select()
      .single()

    if (listingErr) {
      console.error(`  ❌ Error: ${listingErr.message}`)
      continue
    }

    console.log(`  ✅ Listing creado con ID: ${listing.id}`)

    // 2. Subir imagen placeholder
    const imageUrl = await uploadPlaceholder(listing.id)
    if (imageUrl) {
      await supabase.from('listing_images').insert({
        listing_id: listing.id,
        url: imageUrl,
        position: 1,
      })
      console.log(`  🖼️  Imagen subida correctamente`)
    }
  }

  console.log('\n🎉 ¡Listo! Todas las viviendas han sido insertadas.')
}

run().catch(console.error)
