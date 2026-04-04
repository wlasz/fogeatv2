import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tijsmxzbigfaybjdwzat.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpanNteHpiaWdmYXliamR3emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTIxMzgsImV4cCI6MjA5MDg2ODEzOH0.1GkyokqFsu0GvRPg-k_6MIG8IF0vs76O83jNDifsvNo'
)

// Адаптер с тем же API что был window.storage в артефакте
export const storage = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('fogeat_data')
        .select('value')
        .eq('key', key)
        .single()
      if (error || !data) return null
      return { value: data.value }
    } catch {
      return null
    }
  },

  async set(key, value) {
    try {
      const { error } = await supabase
        .from('fogeat_data')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) throw error
      return { key, value }
    } catch {
      return null
    }
  },

  async delete(key) {
    try {
      await supabase.from('fogeat_data').delete().eq('key', key)
      return { key, deleted: true }
    } catch {
      return null
    }
  },

  async list(prefix) {
    try {
      let query = supabase.from('fogeat_data').select('key')
      if (prefix) query = query.like('key', `${prefix}%`)
      const { data } = await query
      return { keys: (data || []).map(r => r.key) }
    } catch {
      return { keys: [] }
    }
  }
}
