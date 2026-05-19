import { DEFAULT_VENUES } from '../domain/catalog.js'
import { supabase } from '../lib/supabase.js'

export const mapVenueRow = (venue) => ({
  id: venue.id,
  n: venue.name,
  c: venue.category,
  s: venue.subcategory || '',
  a: venue.address,
  i: venue.icon || '📍',
  r: Number(venue.rating || 0),
  rc: venue.review_count || 0,
  ig: venue.instagram || undefined,
  lat: venue.lat,
  lng: venue.lng,
  dishes: venue.dishes || undefined,
})

export const venueCatalogService = {
  async listCatalogVenues() {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })

      if (error || !data?.length) return DEFAULT_VENUES

      return data.map(mapVenueRow)
    } catch (error) {
      return DEFAULT_VENUES
    }
  },
}
