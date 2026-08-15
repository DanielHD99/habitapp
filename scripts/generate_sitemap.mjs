// Generator Script de Sitemap.xml para HabitApp (SEO Local)
// Ejecutar con: npm run generate-sitemap

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Cargar variables de entorno
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
const BASE_URL = 'https://habitapp.co'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function generateSitemap() {
  console.log('🌐 Generando sitemap.xml para HabitApp...')

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'published')

  if (error) {
    console.error('❌ Error consultando viviendas para sitemap:', error.message)
    return
  }

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/buscar', priority: '0.9', changefreq: 'daily' },
    { url: '/publicar', priority: '0.8', changefreq: 'weekly' },
    { url: '/seguridad', priority: '0.7', changefreq: 'monthly' }
  ]

  const now = new Date().toISOString().split('T')[0]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  // Páginas estáticas
  for (const page of staticPages) {
    xml += `  <url>\n`
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += `  </url>\n`
  }

  // Páginas dinámicas de viviendas
  if (listings && listings.length > 0) {
    for (const listing of listings) {
      const lastmod = listing.updated_at ? listing.updated_at.split('T')[0] : now
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/vivienda/${listing.id}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.8</priority>\n`
      xml += `  </url>\n`
    }
  }

  xml += `</urlset>\n`

  const outputPath = path.join(__dirname, '../public/sitemap.xml')
  fs.writeFileSync(outputPath, xml, 'utf8')

  console.log(`✅ sitemap.xml generado exitosamente en ${outputPath} (${(listings || []).length + staticPages.length} URLs creadas).`)
}

generateSitemap().catch(console.error)
