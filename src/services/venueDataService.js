import { supabase } from '../lib/supabase.js'

export const venueDataService = {
  async listVenueNotes(userId) {
    const { data } = await supabase
      .from('venue_notes')
      .select('*')
      .eq('user_id', userId)

    const notes = {}
    ;(data || []).forEach((note) => {
      notes[note.venue_id] = note.note
    })

    return notes
  },

  async saveVenueNotes(userId, notes) {
    for (const [venueId, note] of Object.entries(notes)) {
      if (note) {
        await supabase.from('venue_notes').upsert(
          { user_id: userId, venue_id: parseInt(venueId), note, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,venue_id' },
        )
      } else {
        await supabase.from('venue_notes').delete().eq('user_id', userId).eq('venue_id', parseInt(venueId))
      }
    }

    const { data: existing } = await supabase
      .from('venue_notes')
      .select('venue_id')
      .eq('user_id', userId)

    for (const row of existing || []) {
      if (notes[row.venue_id] === undefined) {
        await supabase.from('venue_notes').delete().eq('user_id', userId).eq('venue_id', row.venue_id)
      }
    }
  },

  async listCustomLabels(userId) {
    const { data } = await supabase
      .from('venue_labels')
      .select('*')
      .eq('user_id', userId)

    return (data || []).map((label) => ({
      id: label.label_id,
      name: label.label_name,
      emoji: label.label_emoji,
      color: label.label_color,
    }))
  },

  async saveCustomLabels(userId, labels) {
    await supabase.from('venue_labels').delete().eq('user_id', userId)

    if (labels.length) {
      await supabase.from('venue_labels').insert(
        labels.map((label) => ({
          user_id: userId,
          label_id: label.id,
          label_name: label.name,
          label_emoji: label.emoji,
          label_color: label.color,
        })),
      )
    }
  },

  async listVenueLabels(userId) {
    const { data } = await supabase
      .from('venue_label_assignments')
      .select('*')
      .eq('user_id', userId)

    const labels = {}
    ;(data || []).forEach((assignment) => {
      if (!labels[assignment.venue_id]) labels[assignment.venue_id] = []
      labels[assignment.venue_id].push(assignment.label_id)
    })

    return labels
  },

  async saveVenueLabels(userId, venueLabels) {
    await supabase.from('venue_label_assignments').delete().eq('user_id', userId)

    const rows = []
    for (const [venueId, labelIds] of Object.entries(venueLabels)) {
      labelIds.forEach((labelId) => {
        rows.push({ user_id: userId, venue_id: parseInt(venueId), label_id: labelId })
      })
    }

    if (rows.length) await supabase.from('venue_label_assignments').insert(rows)
  },

  async listCustomVenues(userId) {
    const { data } = await supabase
      .from('custom_venues')
      .select('*')
      .eq('user_id', userId)

    return (data || []).map((venue) => (
      venue.deleted ? { id: venue.venue_data?.id, deleted: true } : venue.venue_data
    ))
  },

  async saveCustomVenues(userId, venues) {
    await supabase.from('custom_venues').delete().eq('user_id', userId)

    if (venues.length) {
      await supabase.from('custom_venues').insert(
        venues.map((venue) => ({
          user_id: userId,
          venue_data: venue.deleted ? { id: venue.id } : venue,
          deleted: !!venue.deleted,
        })),
      )
    }
  },
}
