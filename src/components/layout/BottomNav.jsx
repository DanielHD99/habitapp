import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Search, Plus, Heart, User } from 'lucide-react'
import styles from '../../styles/modules/BottomNav.module.css'

export default function BottomNav() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  function handlePublish() {
    if (user) {
      navigate('/publicar')
    } else {
      navigate('/login?redirect=/publicar')
    }
  }

  return (
    <nav className={styles.bottomNav} aria-label="Navegación principal">
      <div className={styles.bottomNav__inner}>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles['bottomNav__item']} ${isActive ? styles.active : ''}`
          }
          aria-label="Inicio"
        >
          <Home className={styles['bottomNav__icon']} />
          <span className={styles['bottomNav__label']}>Inicio</span>
        </NavLink>

        <NavLink
          to="/buscar"
          className={({ isActive }) =>
            `${styles['bottomNav__item']} ${isActive ? styles.active : ''}`
          }
          aria-label="Buscar"
        >
          <Search className={styles['bottomNav__icon']} />
          <span className={styles['bottomNav__label']}>Buscar</span>
        </NavLink>

        {/* ─── Botón Publicar (elevado, central) ─── */}
        <button
          className={styles['bottomNav__publish']}
          onClick={handlePublish}
          aria-label="Publicar vivienda"
        >
          <div className={styles['bottomNav__publish-icon']}>
            <Plus size={24} />
          </div>
          <span className={styles['bottomNav__publish-label']}>Publicar</span>
        </button>

        <NavLink
          to="/favoritos"
          className={({ isActive }) =>
            `${styles['bottomNav__item']} ${isActive ? styles.active : ''}`
          }
          aria-label="Favoritos"
        >
          <Heart className={styles['bottomNav__icon']} />
          <span className={styles['bottomNav__label']}>Favoritos</span>
        </NavLink>

        <NavLink
          to={user ? '/perfil' : '/login'}
          className={({ isActive }) =>
            `${styles['bottomNav__item']} ${isActive ? styles.active : ''}`
          }
          aria-label="Perfil"
        >
          <User className={styles['bottomNav__icon']} />
          <span className={styles['bottomNav__label']}>Perfil</span>
        </NavLink>

      </div>
    </nav>
  )
}
