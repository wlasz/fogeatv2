import { supabase } from '../lib/supabase.js'

export const wishlistService = {
  async listWishVenues(userId) {
    const { data } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return (data || []).map((item) => ({
      id: item.venue_id,
      n: item.venue_name,
      c: item.venue_icon,
    }))
  },

  async saveWishVenues(userId, wishVenues) {
    await supabase.from('wishlist').delete().eq('user_id', userId)

    if (wishVenues.length) {
      await supabase.from('wishlist').insert(
        wishVenues.map((venue) => ({
          user_id: userId,
          venue_id: venue.id,
          venue_name: venue.n,
          venue_icon: venue.c,
        })),
      )
    }
  },
}
