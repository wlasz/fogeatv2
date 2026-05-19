import { supabase } from '../lib/supabase.js'

const toMenuPhoto = (photo) => ({
  src: photo.photo_url,
  path: photo.photo_path,
  id: photo.id,
  date: new Date(photo.created_at).toLocaleDateString('ru-RU'),
})

export const groupMenuPhotosByVenue = (photos) => {
  const grouped = {}
  ;(photos || []).forEach((photo) => {
    if (!grouped[photo.venue_id]) grouped[photo.venue_id] = []
    grouped[photo.venue_id].push(toMenuPhoto(photo))
  })
  return grouped
}

export const menuPhotoService = {
  async listApprovedMenuPhotos() {
    const { data } = await supabase
      .from('menu_photos')
      .select('*')
      .eq('status', 'approved')

    return groupMenuPhotosByVenue(data || [])
  },

  async listPendingMenuPhotos() {
    const { data } = await supabase
      .from('menu_photos')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    return data || []
  },

  async uploadMenuPhotos({ venueId, userId, files }) {
    const now = new Date()
    const uploaded = []
    const errors = []

    for (const file of files) {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const path = `${venueId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeFileName}`
      const { error } = await supabase.storage.from('menu-photos').upload(path, file, { upsert: true })

      if (error) {
        errors.push(error)
        continue
      }

      const { data } = supabase.storage.from('menu-photos').getPublicUrl(path)
      const { data: row } = await supabase
        .from('menu_photos')
        .insert({
          venue_id: venueId,
          user_id: userId,
          photo_url: data.publicUrl,
          photo_path: path,
          status: 'pending',
        })
        .select()
        .single()

      uploaded.push({
        src: data.publicUrl,
        path,
        id: row?.id,
        date: now.toLocaleDateString('ru-RU'),
        status: 'pending',
      })
    }

    return { uploaded, errors }
  },

  async removeMenuPhotoFile(path) {
    if (!path) return
    await supabase.storage.from('menu-photos').remove([path])
  },

  async approveMenuPhoto(photoId) {
    return supabase.from('menu_photos').update({ status: 'approved' }).eq('id', photoId)
  },

  async rejectMenuPhoto(photo) {
    await supabase.storage.from('menu-photos').remove([photo.photo_path])
    return supabase.from('menu_photos').delete().eq('id', photo.id)
  },
}
