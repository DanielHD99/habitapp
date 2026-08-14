import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Página no encontrada — HabitApp</title>
      </Helmet>
      <div className="empty-state" style={{ minHeight: '70vh' }}>
        <div style={{
          fontSize: '6rem', lineHeight: 1,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          404
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)' }}>
          Página no encontrada
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 360 }}>
          La página que buscas no existe o fue eliminada.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Ir al inicio
          </Link>
          <Link to="/buscar" className="btn btn-outline">
            <Search size={18} /> Buscar viviendas
          </Link>
        </div>
      </div>
    </>
  )
}
