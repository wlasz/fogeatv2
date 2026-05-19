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

const toRating = (value) => {
  const rating = Number(String(value).replace(',', '.')) || 0
  return Math.max(0, Math.min(5, rating))
}

const toVenueUpdateRow = (venue) => ({
  name: venue.n.trim(),
  category: venue.c,
  subcategory: venue.s || '',
  address: venue.a || '',
  icon: venue.i || '📍',
  rating: toRating(venue.r),
  instagram: venue.ig ? venue.ig.trim().replace(/^@/, '') : null,
  lat: Number(venue.lat),
  lng: Number(venue.lng),
  updated_at: new Date().toISOString(),
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

  async updateCatalogVenue(venueId, venue) {
    const { data, error } = await supabase
      .from('venues')
      .update(toVenueUpdateRow(venue))
      .eq('id', venueId)
      .select()
      .single()

    if (error) throw error

    return mapVenueRow(data)
  },
}
