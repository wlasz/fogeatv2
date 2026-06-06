import { supabase } from '../lib/supabase.js'
import { storage } from '../lib/storage.js'

export const mapCheckinRow = (row) => ({
  id: row.id,
  venueId: row.venue_id,
  venueName: row.venue_name,
  dish: row.dish,
  rating: row.rating,
  review: row.review,
  price: row.price,
  date: row.date,
  time: row.time,
  photoKey: row.photo_key,
  photoUrl: row.photo_url,
})

const toCheckinRow = (userId, checkin) => ({
  id: checkin.id,
  user_id: userId,
  venue_id: checkin.venueId,
  venue_name: checkin.venueName,
  dish: checkin.dish,
  rating: checkin.rating,
  review: checkin.review,
  price: checkin.price,
  date: checkin.date,
  time: checkin.time,
  photo_key: checkin.photoKey,
  photo_url: checkin.photoUrl,
})

export const checkinService = {
  async listUserCheckins(userId) {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return (data || []).map(mapCheckinRow)
  },

  async listUserCheckinRows(userId) {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return data || []
  },

  async createCheckin(userId, checkin) {
    return supabase.from('checkins').insert(toCheckinRow(userId, checkin))
  },

  async deleteCheckin(checkinId, photoKey) {
    if (photoKey) {
      try {
        await supabase.storage.from('checkin-photos').remove([photoKey])
      } catch {}
    }

    const { error, count } = await supabase
      .from('checkins')
      .delete({ count: 'exact' })
      .eq('id', checkinId)
    if (error) throw error
    if (count === 0) throw new Error('No checkin rows were deleted')
    return { error: null, count }
  },

  async uploadCheckinPhoto({ venueId, checkinId, photoDataUrl }) {
    if (!photoDataUrl) return { photoKey: null, photoUrl: null }

    const response = await fetch(photoDataUrl)
    const blob = await response.blob()
    const path = `${venueId}/${checkinId}.jpg`
    const { error } = await supabase.storage
      .from('checkin-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true })

    if (error) return { photoKey: null, photoUrl: null, error }

    const { data } = supabase.storage.from('checkin-photos').getPublicUrl(path)
    return { photoKey: path, photoUrl: data.publicUrl }
  },

  async getVenueRatings() {
    const { data } = await supabase
      .from('checkins')
      .select('venue_id,rating')
      .gt('rating', 0)

    const sums = {}
    const counts = {}
    ;(data || []).forEach((checkin) => {
      sums[checkin.venue_id] = (sums[checkin.venue_id] || 0) + checkin.rating
      counts[checkin.venue_id] = (counts[checkin.venue_id] || 0) + 1
    })

    const ratings = {}
    Object.keys(sums).forEach((id) => {
      ratings[id] = { avg: +(sums[id] / counts[id]).toFixed(1), count: counts[id] }
    })

    return ratings
  },

  async getPhotoMapForVenue(checkins, venueId) {
    const photos = {}

    for (const checkin of checkins.filter((item) => item.venueId === venueId)) {
      if (checkin.photoUrl) {
        photos[checkin.id] = checkin.photoUrl
      } else if (checkin.photoKey) {
        try {
          const result = await storage.get(checkin.photoKey)
          if (result) photos[checkin.id] = result.value
        } catch {}
      }
    }

    return photos
  },
}
