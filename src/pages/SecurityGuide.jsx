import { Helmet } from 'react-helmet-async'
import { ShieldCheck, Eye, FileText, DollarSign, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SecurityGuide() {
  const tips = [
    {
      icon: Eye,
      title: '1. Visita la vivienda personalmente antes de pagar',
      description: 'Nunca entregues dinero, reservas ni adelantos por consignación sin haber conocido la propiedad presencialmente y haber verificado que las llaves y el inmueble coinciden con la oferta.'
    },
    {
      icon: FileText,
      title: '2. Verifica la identidad y documentación del arrendador',
      description: 'Solicita la cédula de ciudadanía del propietario o del agente inmobiliario. Pide una copia reciente del Certificado de Libertad y Tradición o del recibo del impuesto predial para constatar la propiedad del inmueble.'
    },
    {
      icon: DollarSign,
      title: '3. Evita transferencias a cuentas de terceros desconocidos',
      description: 'Asegúrate de que cualquier consignación o pago de canon/depósito se realice directamente a nombre del propietario verificado o de la inmobiliaria constituida, no a intermediarios no identificados.'
    },
    {
      icon: ShieldCheck,
      title: '4. Exige un Contrato de Arrendamiento por escrito',
      description: 'Exige siempre un contrato formal por escrito que estipule el valor del canon, vigencia, inventario del inmueble y condiciones de depósito. Firma el documento personalmente o con firma autenticada.'
    },
    {
      icon: AlertTriangle,
      title: '5. Reporta ofertas sospechosas en HabitApp',
      description: 'Si encuentras un anuncio con fotos irreales, precios desproporcionadamente bajos o si un anunciante solicita dinero por anticipado para "mostrar la vivienda", usa el botón de "Reportar" en HabitApp. Con 2 reportes la vivienda será ocultada automáticamente para revisión.'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Guía de Seguridad para Arrendatarios — HabitApp</title>
        <meta name="description" content="Aprende cómo arrendar viviendas de forma segura en Armenia, Quindío. Consejos para evitar estafas y verificar inmuebles." />
      </Helmet>

      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', paddingBlock: 'var(--space-10)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-6)' }}>
            <ArrowLeft size={16} /> Volver al inicio
          </Link>

          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-primary)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
              <ShieldCheck size={20} />
              Seguridad y Confianza en HabitApp
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--color-text)' }}>
              Guía de Seguridad para Arrendatarios en Armenia
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)', marginTop: 'var(--space-3)', maxWidth: 650, marginInline: 'auto' }}>
              En HabitApp nos tomamos muy en serio tu tranquilidad. Sigue estas 5 recomendaciones fundamentales antes de tomar cualquier decisión de alquiler.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {tips.map((tip, idx) => {
              const IconComp = tip.icon
              return (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: 'var(--space-6)', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    gap: 'var(--space-5)',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                    <IconComp size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      {tip.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                      {tip.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Banner final */}
          <div style={{ marginTop: 'var(--space-10)', backgroundColor: '#172033', color: 'white', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)', color: 'white' }}>
              ¿Encontraste un inmueble que te interesa en Armenia?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 'var(--space-6)' }}>
              Explora viviendas disponibles y contacta directamente al arrendador sin intermediarios sospechosos.
            </p>
            <Link to="/buscar" className="btn btn-primary btn-lg">
              Buscar viviendas disponibles
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
