import { supabase } from '../lib/supabase.js'

export const favoriteService = {
  async listFavoriteUserIds(userId) {
    const { data } = await supabase
      .from('favorites')
      .select('favorite_user_id')
      .eq('user_id', userId)

    return (data || []).map((favorite) => favorite.favorite_user_id)
  },

  addFavorite(userId, favoriteUserId) {
    return supabase.from('favorites').insert({ user_id: userId, favorite_user_id: favoriteUserId })
  },

  removeFavorite(userId, favoriteUserId) {
    return supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('favorite_user_id', favoriteUserId)
  },
}
