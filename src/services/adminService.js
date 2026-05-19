import { supabase } from '../lib/supabase.js'

export const adminService = {
  async listLegacyCheckins() {
    const { data } = await supabase
      .from('fogeat_data')
      .select('*')
      .like('key', 'fogeat-checkins-%')

    const all = []
    ;(data || []).forEach((row) => {
      try {
        const uid = row.key.replace('fogeat-checkins-', '')
        const items = JSON.parse(row.value)
        items.forEach((checkin) => all.push({ ...checkin, uid }))
      } catch {}
    })

    return all.sort((a, b) => b.id - a.id)
  },

  async deleteLegacyCheckin(checkin) {
    const key = `fogeat-checkins-${checkin.uid}`
    const { data } = await supabase.from('fogeat_data').select('value').eq('key', key).single()
    if (!data) return false

    const items = JSON.parse(data.value).filter((item) => item.id !== checkin.id)
    await supabase.from('fogeat_data').update({ value: JSON.stringify(items) }).eq('key', key)

    if (checkin.photoKey) {
      try {
        await supabase.storage.from('checkin-photos').remove([checkin.photoKey])
      } catch {}
    }

    return true
  },
}
