import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Heart } from 'lucide-react'
import { formatPrice, PROPERTY_TYPE_LABELS, truncate } from '../../lib/utils'
import styles from '../../styles/modules/ListingCard.module.css'

export default function ListingCard({ listing, onFavorite, isFavorite }) {
  const {
    id, title, price, city, neighborhood,
    property_type, bedrooms, bathrooms,
    listing_images, status,
  } = listing

  const mainImage = listing_images?.[0]?.url || null
  const typeLabel = PROPERTY_TYPE_LABELS[property_type] || property_type

  return (
    <Link to={`/vivienda/${id}`} className={styles.card}>
      {/* ─── Imagen ─── */}
      <div className={styles.card__image}>
        {mainImage ? (
          <img src={mainImage} alt={title} loading="lazy" />
        ) : (
          <div className={styles.card__image_placeholder}>
            <MapPin size={32} />
          </div>
        )}

        {/* Badge tipo */}
        <span className={`badge badge-success ${styles.card__type_badge}`}>
          {typeLabel}
        </span>

        {/* Badge verificación de seguridad */}
        <span style={{
          position: 'absolute',
          top: 'var(--space-3)',
          left: 'var(--space-3)',
          backgroundColor: listing.is_anonymous ? 'rgba(217, 119, 6, 0.9)' : 'rgba(21, 128, 61, 0.9)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          zIndex: 2,
        }}>
          {listing.is_anonymous ? '⚠️ No verificado' : '✓ Verificado'}
        </span>

        {/* Botón favorito */}
        {onFavorite && (
          <button
            className={`${styles.card__fav_btn} ${isFavorite ? styles.active : ''}`}
            onClick={e => { e.preventDefault(); onFavorite(id) }}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* ─── Contenido ─── */}
      <div className={styles.card__body}>
        {/* Precio */}
        <div className={styles.card__price}>
          <span className="price">{formatPrice(price)}</span>
          <span className="price-unit">/ mes</span>
        </div>

        {/* Título */}
        <h3 className={styles.card__title}>{truncate(title, 60)}</h3>

        {/* Ubicación */}
        <p className={styles.card__location}>
          <MapPin size={13} />
          {neighborhood ? `${neighborhood}, ${city}` : city}
        </p>

        {/* Specs */}
        <div className={styles.card__specs}>
          <span>
            <Bed size={14} />
            {bedrooms} hab.
          </span>
          <span>
            <Bath size={14} />
            {bathrooms} baño{bathrooms !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
