import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatRelativeDate, REPORT_REASONS } from '../../lib/utils'

const REASON_LABELS = Object.fromEntries(REPORT_REASONS.map(r => [r.value, r.label]))

export default function AdminReports() {
  const { isCityAdmin, assignedCities } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')

  useEffect(() => { fetchReports() }, [filter, isCityAdmin, assignedCities])

  async function fetchReports() {
    setLoading(true)
    let query = supabase
      .from('reports')
      .select('*, listings!inner(id, title, status, city), profiles(full_name, phone)')
      .eq('status', filter)
      .order('created_at', { ascending: false })

    if (isCityAdmin && assignedCities.length > 0) {
      query = query.in('listings.city', assignedCities)
    }

    const { data } = await query.limit(100)

    setReports(data || [])
    setLoading(false)
  }

  async function markReviewed(reportId, listingId, action) {
    // Actualizar estado del reporte
    await supabase.from('reports').update({ status: 'reviewed' }).eq('id', reportId)

    // Acciones opcionales sobre la publicación
    if (action === 'reactivate') {
      await supabase.from('listings')
        .update({ status: 'published', report_count: 0 })
        .eq('id', listingId)
    } else if (action === 'suspend') {
      await supabase.from('listings').update({ status: 'suspended' }).eq('id', listingId)
    }

    setReports(prev => prev.filter(r => r.id !== reportId))
  }

  return (
    <>
      <Helmet><title>Admin — Reportes</title></Helmet>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: 'var(--space-8) 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-6)' }}>Reportes</h1>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            {['pending', 'reviewed', 'dismissed'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
                {{ pending: 'Pendientes', reviewed: 'Revisados', dismissed: 'Descartados' }[s]}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-xl)' }} />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state"><p>No hay reportes en esta categoría.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {reports.map(report => (
                <div key={report.id} style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 4 }}>
                        📋 {report.listings?.title || 'Publicación eliminada'}
                        {report.listings?.status && (
                          <span className={`badge ${report.listings.status === 'hidden' ? 'badge-warning' : 'badge-success'}`} style={{ marginLeft: 'var(--space-2)' }}>
                            {report.listings.status}
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        Motivo: <strong style={{ color: 'var(--color-danger)' }}>{REASON_LABELS[report.reason] || report.reason}</strong>
                        {' · '}Reportado por: {report.profiles?.full_name || 'Usuario'}
                        {' · '}{formatRelativeDate(report.created_at)}
                      </p>
                      {report.details && (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)', fontStyle: 'italic' }}>
                          "{report.details}"
                        </p>
                      )}
                    </div>

                    {filter === 'pending' && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {report.listings && (
                          <Link to={`/vivienda/${report.listings.id}`} target="_blank" className="btn btn-ghost btn-sm">
                            <ExternalLink size={14} /> Ver publicación
                          </Link>
                        )}
                        {report.listings?.status === 'hidden' && (
                          <button className="btn btn-sm" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                            onClick={() => markReviewed(report.id, report.listings.id, 'reactivate')}>
                            <CheckCircle size={14} /> Reactivar
                          </button>
                        )}
                        <button className="btn btn-sm" style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
                          onClick={() => markReviewed(report.id, report.listings?.id, 'suspend')}>
                          Suspender
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-text-muted)' }}
                          onClick={() => markReviewed(report.id, null, 'dismiss')}>
                          Descartar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
