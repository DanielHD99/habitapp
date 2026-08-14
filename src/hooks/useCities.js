import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

let cachedCities = null // Simple in-memory cache to prevent redundant fetches

export function useCities() {
  const [cities, setCities] = useState(cachedCities || [])
  const [loading, setLoading] = useState(!cachedCities)

  useEffect(() => {
    async function fetchCities() {
      if (cachedCities) {
        setCities(cachedCities)
        setLoading(false)
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('cities')
        .select('name')
        .order('name', { ascending: true })

      if (!error && data) {
        const cityNames = data.map(c => c.name)
        cachedCities = cityNames
        setCities(cityNames)
      } else {
        // Fallback robusto en caso de error o sin conexión
        setCities(['Armenia', 'Pereira', 'Manizales', 'Bogotá', 'Medellín', 'Cali'])
      }
      setLoading(false)
    }

    fetchCities()
  }, [])

  return { cities, loading }
}
