import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, NavLink } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LayoutDashboard, FileText, Flag, Users, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { isCityAdmin, assignedCities, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState({ users: 0, listings: 0, reports: 0, hidden: 0, sources: {}, neighborhoods: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      let listingsQuery = supabase.from('listings').select('id, source_platform, neighborhood', { count: 'exact' }).neq('status', 'deleted')
      let hiddenQuery   = supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'hidden')

      if (isCityAdmin && assignedCities.length > 0) {
        listingsQuery = listingsQuery.in('city', assignedCities)
        hiddenQuery   = hiddenQuery.in('city', assignedCities)
      }

      const [usersRes, listingsRes, reportsRes, hiddenRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        listingsQuery,
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        hiddenQuery,
      ])

      const sourceCounts = {}
      const neighborhoodCounts = {}

      if (listingsRes.data) {
        listingsRes.data.forEach(l => {
          const src = l.source_platform || 'direct'
          sourceCounts[src] = (sourceCounts[src] || 0) + 1

          const neigh = l.neighborhood || 'Sin barrio'
          neighborhoodCounts[neigh] = (neighborhoodCounts[neigh] || 0) + 1
        })
      }

      const topNeighborhoods = Object.entries(neighborhoodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      setStats({
        users:    usersRes.count || 0,
        listings: listingsRes.count || 0,
        reports:  reportsRes.count || 0,
        hidden:   hiddenRes.count || 0,
        sources:  sourceCounts,
        neighborhoods: topNeighborhoods
      })
      setLoading(false)
    }
    fetchStats()
  }, [isCityAdmin, assignedCities])

  return (
    <>
      <Helmet><title>Panel Admin — HabitApp</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: 'var(--space-8) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
            <span className="badge badge-danger">Panel de administración</span>
            {isCityAdmin && (
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> Admin de Ciudad: {assignedCities.join(', ') || 'Sin ciudad asignada'}
              </span>
            )}
            {isSuperAdmin && (
              <span className="badge badge-success">🌐 Super Admin Global</span>
            )}
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-6)' }}>Panel administrativo</h1>

          {/* Nav Admin */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
            {[
              { to: '/admin', label: 'Resumen', icon: <LayoutDashboard size={16} />, end: true, show: true },
              { to: '/admin/publicaciones', label: 'Publicaciones', icon: <FileText size={16} />, show: true },
              { to: '/admin/reportes', label: 'Reportes', icon: <Flag size={16} />, show: true },
              { to: '/admin/usuarios', label: 'Usuarios', icon: <Users size={16} />, show: isSuperAdmin },
              { to: '/admin/ciudades', label: 'Ciudades', icon: <MapPin size={16} />, show: isSuperAdmin },
            ].filter(item => item.show).map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)',
                  textDecoration: 'none', transition: 'all var(--transition-fast)',
                  backgroundColor: isActive ? 'var(--color-primary-100)' : 'transparent',
                  color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                })}>
                {item.icon} {item.label}
                {item.label === 'Reportes' && stats.reports > 0 && (
                  <span style={{ minWidth: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-danger)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {stats.reports}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Stats */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-xl)' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <StatCard label="Usuarios" value={stats.users} icon="👥" color="var(--color-info)" />
              <StatCard label="Publicaciones" value={stats.listings} icon="🏠" color="var(--color-primary)" />
              <StatCard label="Reportes pendientes" value={stats.reports} icon="⚑" color="var(--color-danger)" alert={stats.reports > 0} />
              <StatCard label="Publicaciones ocultas" value={stats.hidden} icon="👁️" color="var(--color-warning)" alert={stats.hidden > 0} />
            </div>
          )}

          {stats.reports > 0 && !loading && (
            <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-danger-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                ⚑ Hay {stats.reports} reporte{stats.reports !== 1 ? 's' : ''} pendiente{stats.reports !== 1 ? 's' : ''} de revisión.
              </p>
              <Link to="/admin/reportes" className="btn btn-sm" style={{ backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-md)' }}>
                Revisar reportes
              </Link>
            </div>
          )}

          {/* ─── Métricas de Ingesta y Fuentes ─── */}
          {!loading && (
            <div style={{ marginTop: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
              {/* Desglose por Fuente */}
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  📊 Origen de Inmuebles Activos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { key: 'facebook', label: 'Facebook Marketplace', color: '#1877F2', icon: '🟦' },
                    { key: 'instagram', label: 'Instagram', color: '#E4405F', icon: '🟪' },
                    { key: 'web', label: 'Portales / Clasificados Web', color: '#0284C7', icon: '🌐' },
                    { key: 'direct', label: 'Publicaciones Directas / Nativas', color: '#22C55E', icon: '🏠' }
                  ].map(src => {
                    const count = stats.sources[src.key] || 0
                    const pct = stats.listings > 0 ? Math.round((count / stats.listings) * 100) : 0
                    return (
                      <div key={src.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                          <span>{src.icon} {src.label}</span>
                          <strong style={{ color: src.color }}>{count} ({pct}%)</strong>
                        </div>
                        <div style={{ height: 6, backgroundColor: 'var(--color-surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: src.color, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Desglose por Barrio */}
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  📍 Top Barrios en Armenia
                </h3>
                {stats.neighborhoods.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No hay suficientes datos por barrio aún.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {stats.neighborhoods.map(([neigh, count], idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                        <span style={{ fontWeight: 500 }}>{idx + 1}. {neigh}</span>
                        <span className="badge badge-success" style={{ fontSize: 11 }}>{count} vivienda{count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, icon, color, alert }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)', border: alert ? `1px solid ${color}30` : '1px solid transparent', position: 'relative', overflow: 'hidden' }}>
      {alert && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: color }} />}
      <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>{icon}</div>
      <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color }}>{value}</div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{label}</div>
    </div>
  )
}
