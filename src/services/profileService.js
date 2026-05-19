import { supabase } from '../lib/supabase.js'

export const profileService = {
  async createProfile(userId, username) {
    return supabase.from('profiles').insert({ id: userId, username })
  },

  async getProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role,username')
      .eq('id', userId)
      .single()

    return data || null
  },

  async listProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    return data || []
  },

  async deleteProfile(userId) {
    return supabase.from('profiles').delete().eq('id', userId)
  },

  async listRankedProfiles() {
    const { data: counts } = await supabase
      .from('checkins')
      .select('user_id')
      .order('user_id')

    const countMap = {}
    ;(counts || []).forEach((row) => {
      countMap[row.user_id] = (countMap[row.user_id] || 0) + 1
    })

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id,username,role')

    return (profiles || [])
      .map((profile) => ({ ...profile, count: countMap[profile.id] || 0 }))
      .sort((a, b) => b.count - a.count)
  },
}
