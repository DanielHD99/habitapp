import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'
import logo from '../../assets/logo.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      backgroundColor: 'var(--color-text)',
      color: 'var(--color-text-inverse)',
      padding: 'var(--space-12) 0 calc(var(--space-12) + 80px)',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-10)',
        }}>

          {/* ─── Columna marca ─── */}
          <div>
            <img src={logo} alt="HabitApp" style={{ height: 36, marginBottom: 'var(--space-4)', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'rgba(255,255,255,0.7)', lineHeight: 'var(--line-height-relaxed)', maxWidth: 260 }}>
              Encuentra tu próximo hogar. La plataforma exclusiva de arriendos de vivienda en Armenia, Quindío.
            </p>
          </div>

          {/* ─── Columna desarrollo ─── */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)', color: 'rgba(255,255,255,0.9)' }}>
              Desarrollo & Tecnología
            </h4>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'white', fontWeight: 600, margin: 0, marginBottom: 'var(--space-2)' }}>
                🎬 Delta Audiovisual
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.7)', margin: 0, marginBottom: 'var(--space-3)' }}>
                Desarrollo web y producción audiovisual profesional.
              </p>
              <a
                href="https://wa.me/573155399883?text=Hola%20Delta%20Audiovisual,%20vengo%20desde%20HabitApp"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none'
                }}
              >
                <Phone size={14} /> Contactar: 315 539 9883
              </a>
            </div>
          </div>

          {/* ─── Columna navegación ─── */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)', color: 'rgba(255,255,255,0.9)' }}>
              Navegación
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                { to: '/',      label: 'Inicio' },
                { to: '/buscar', label: 'Buscar viviendas' },
                { to: '/publicar', label: 'Publicar vivienda' },
                { to: '/seguridad', label: '🛡️ Guía de seguridad' },
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'rgba(255,255,255,0.7)',
                      transition: 'color var(--transition-fast)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Columna info ─── */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)', color: 'rgba(255,255,255,0.9)' }}>
              Armenia, Quindío 🇨🇴
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'rgba(255,255,255,0.7)' }}>
                <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                Solo arriendos en Armenia
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'rgba(255,255,255,0.7)' }}>
                <Phone size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                Contacto directo por WhatsApp
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Línea inferior ─── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(255,255,255,0.7)',
        }}>
          <span>© {year} HabitApp. Todos los derechos reservados.</span>
          <span>
            Desarrollado por <strong style={{ color: 'white' }}>Delta Audiovisual</strong> (WhatsApp: 315 539 9883)
          </span>
        </div>
      </div>
    </footer>
  )
}
