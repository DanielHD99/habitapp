// Script para reemplazar la imagen placeholder de las 10 viviendas insertadas
// Ejecutar con: node scripts/update_placeholder.mjs

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://wctcdwfeibzbrhltcgpr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Wo-yvcXUWQ_6CgND3U20qQ_MsaYQZnN'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const PLACEHOLDER_PATH = path.join(__dirname, 'listing_placeholder.png')

// Los 10 IDs insertados en el seed anterior
const LISTING_IDS = [
  '44fd3e71-c5cb-49eb-98db-95b0c577a6ab',
  'd2f5f9b1-d79d-462d-971b-b2fa9032acbf',
  '9ccc7f99-cf95-41ca-8246-c0596144f4bc',
  '079a56dc-c048-4b55-a5ab-32a980374067',
  '645205fa-f4d8-4cbc-ba71-270fe4d33489',
  '85927ea6-d727-4545-8975-a3cecbef0741',
  '7bcb782e-adfa-4137-b0c9-c6278908c092',
  '25978e61-39e5-402d-92ea-cf44297eda48',
  '6abf454b-4cab-4630-97a9-a188234fa660',
  '00e037ea-9b83-43cb-95a0-9d4de1939b00',
]

async function run() {
  console.log('🔄 Actualizando imágenes placeholder...\n')
  const fileBuffer = fs.readFileSync(PLACEHOLDER_PATH)

  for (let i = 0; i < LISTING_IDS.length; i++) {
    const listingId = LISTING_IDS[i]
    console.log(`🖼️  [${i + 1}/10] Actualizando listing ${listingId}`)

    // 1. Subir nueva imagen (sobreescribir)
    const storagePath = `seed/${listingId}/placeholder_v2.png`
    const { error: uploadErr } = await supabase.storage
      .from('listing-images')
      .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true })

    if (uploadErr) {
      console.error(`  ❌ Error subiendo imagen: ${uploadErr.message}`)
      continue
    }

    // 2. Obtener URL pública
    const { data } = supabase.storage.from('listing-images').getPublicUrl(storagePath)
    const newUrl = data.publicUrl

    // 3. Actualizar la URL en listing_images
    const { error: updateErr } = await supabase
      .from('listing_images')
      .update({ url: newUrl })
      .eq('listing_id', listingId)

    if (updateErr) {
      console.error(`  ❌ Error actualizando BD: ${updateErr.message}`)
    } else {
      console.log(`  ✅ Imagen actualizada correctamente`)
    }
  }

  console.log('\n🎉 ¡Listo! Las 10 imágenes han sido actualizadas.')
}

run().catch(console.error)
