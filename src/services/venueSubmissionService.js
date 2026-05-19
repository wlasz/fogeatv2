import { supabase } from '../lib/supabase.js'
import { mapVenueRow } from './venueCatalogService.js'

const toSubmissionRow = (userId, venue) => ({
  user_id: userId,
  name: venue.n.trim(),
  category: venue.c,
  subcategory: venue.s || '',
  address: venue.a || '',
  icon: venue.i || '📍',
  rating: Number(venue.r) || 0,
  instagram: venue.ig || null,
  lat: Number(venue.lat),
  lng: Number(venue.lng),
  status: 'pending',
})

const toVenueInsertRow = (submission, nextId, nextSortOrder) => ({
  id: nextId,
  name: submission.name,
  category: submission.category,
  subcategory: submission.subcategory || '',
  address: submission.address || '',
  icon: submission.icon || '📍',
  rating: Number(submission.rating) || 0,
  review_count: 0,
  instagram: submission.instagram || null,
  lat: Number(submission.lat),
  lng: Number(submission.lng),
  dishes: null,
  sort_order: nextSortOrder,
})

export const venueSubmissionService = {
  async submitVenue(userId, venue) {
    const { error } = await supabase
      .from('venue_submissions')
      .insert(toSubmissionRow(userId, venue))

    if (error) throw error
  },

  async listPendingSubmissions() {
    const { data } = await supabase
      .from('venue_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    return data || []
  },

  async approveSubmission(submission, adminUserId) {
    const { data: latestVenue } = await supabase
      .from('venues')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    const { data: latestSort } = await supabase
      .from('venues')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextId = Number(latestVenue?.[0]?.id || 0) + 1
    const nextSortOrder = Number(latestSort?.[0]?.sort_order || 0) + 1

    const { data: venue, error } = await supabase
      .from('venues')
      .insert(toVenueInsertRow(submission, nextId, nextSortOrder))
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('venue_submissions')
      .update({
        status: 'approved',
        approved_venue_id: venue.id,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission.id)

    return mapVenueRow(venue)
  },

  async rejectSubmission(submissionId, adminUserId) {
    await supabase
      .from('venue_submissions')
      .update({
        status: 'rejected',
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
  },
}
