import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../lib/utils'
import {
  Home, Search, PlusCircle, User, LogOut,
  LayoutDashboard, FileText, ChevronDown, Menu, X
} from 'lucide-react'
import styles from '../../styles/modules/Header.module.css'
import logo from '../../assets/logo.png'

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate   = useNavigate()
  const [scrolled, setScrolled]     = useState(false)
  const [dropdown, setDropdown]     = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const dropdownRef = useRef(null)

  /* ─── Sombra al hacer scroll ─── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ─── Cerrar dropdown al click fuera ─── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setDropdown(false)
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.header__inner}>

        {/* ─── Logo ─── */}
        <Link to="/" className={styles.header__logo}>
          <img src={logo} alt="HabitApp" />
        </Link>

        {/* ─── Nav Desktop ─── */}
        <nav className={styles.header__nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles['header__nav-link']} ${isActive ? styles.active : ''}`
            }
          >
            <Home size={16} /> Inicio
          </NavLink>
          <NavLink
            to="/buscar"
            className={({ isActive }) =>
              `${styles['header__nav-link']} ${isActive ? styles.active : ''}`
            }
          >
            <Search size={16} /> Buscar
          </NavLink>
        </nav>

        {/* ─── Acciones ─── */}
        <div className={styles.header__actions}>

          {/* Botón publicar (desktop) */}
          {user && (
            <Link
              to="/publicar"
              className={`btn btn-primary btn-sm ${styles['header__publish-btn']}`}
            >
              <PlusCircle size={16} /> Publicar vivienda
            </Link>
          )}

          {user ? (
            /* ─── Menú usuario ─── */
            <div className={styles.header__user} ref={dropdownRef}>
              <button
                className={styles['header__user-btn']}
                onClick={() => setDropdown(!dropdown)}
                aria-expanded={dropdown}
                aria-label="Menú de usuario"
              >
                <div className={styles['header__user-avatar']}>
                  {getInitials(displayName)}
                </div>
                <span className="sr-only">{displayName}</span>
                <ChevronDown size={14} />
              </button>

              {dropdown && (
                <div className={styles.header__dropdown}>
                  <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                      {displayName}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/mis-publicaciones"
                    className={styles['header__dropdown-item']}
                    onClick={() => setDropdown(false)}
                  >
                    <FileText size={16} /> Mis publicaciones
                  </Link>
                  <Link
                    to="/perfil"
                    className={styles['header__dropdown-item']}
                    onClick={() => setDropdown(false)}
                  >
                    <User size={16} /> Mi perfil
                  </Link>

                  {isAdmin && (
                    <>
                      <div className={styles['header__dropdown-divider']} />
                      <Link
                        to="/admin"
                        className={styles['header__dropdown-item']}
                        onClick={() => setDropdown(false)}
                      >
                        <LayoutDashboard size={16} /> Panel admin
                      </Link>
                    </>
                  )}

                  <div className={styles['header__dropdown-divider']} />
                  <button
                    className={`${styles['header__dropdown-item']} ${styles.danger}`}
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ─── Botones login/registro ─── */
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
