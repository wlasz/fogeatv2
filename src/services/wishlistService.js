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

  async listWishDishes(userId) {
    const { data } = await supabase
      .from('wishlist_dishes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return (data || []).map((item) => ({
      venueId: item.venue_id,
      dishId: item.dish_id,
      v: item.venue_name,
      d: item.dish_name,
      e: item.dish_icon,
      tag: item.dish_tag,
    }))
  },

  async saveWishDishes(userId, wishDishes) {
    await supabase.from('wishlist_dishes').delete().eq('user_id', userId)

    if (wishDishes.length) {
      await supabase.from('wishlist_dishes').insert(
        wishDishes.map((dish) => ({
          user_id: userId,
          venue_id: dish.venueId,
          dish_id: dish.dishId,
          venue_name: dish.v,
          dish_name: dish.d,
          dish_icon: dish.e,
          dish_tag: dish.tag || '',
        })),
      )
    }
  },
}
