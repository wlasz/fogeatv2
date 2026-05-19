import { supabase } from '../lib/supabase.js'
import { LIMITS, LIMIT_ERROR_CODES, createLimitError } from '../domain/limits.js'
import { mapVenueRow } from './venueCatalogService.js'

const getMoscowDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

const getMoscowDayRange = () => {
  const start = new Date(`${getMoscowDateKey()}T00:00:00+03:00`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  return { start, end }
}

const venueSubmissionLimitError = (used = LIMITS.VENUE_SUBMISSIONS_PER_DAY) => (
  createLimitError(
    LIMIT_ERROR_CODES.VENUE_SUBMISSIONS_PER_DAY,
    `Лимит заявок на сегодня исчерпан: ${LIMITS.VENUE_SUBMISSIONS_PER_DAY} заведения в день`,
    { limit: LIMITS.VENUE_SUBMISSIONS_PER_DAY, used },
  )
)

const isVenueSubmissionLimitError = (error) => (
  error?.message?.includes('venue_submission_daily_limit_exceeded')
)

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
  async getTodaySubmissionCount(userId) {
    const usageDate = getMoscowDateKey()
    const { data: usage, error: usageError } = await supabase
      .from('venue_submission_daily_usage')
      .select('submitted_count')
      .eq('user_id', userId)
      .eq('usage_date', usageDate)
      .maybeSingle()

    if (!usageError && usage?.submitted_count !== undefined) {
      return Number(usage.submitted_count) || 0
    }

    const { start, end } = getMoscowDayRange()
    const { count, error } = await supabase
      .from('venue_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())

    if (error) throw error
    return count || 0
  },

  async submitVenue(userId, venue) {
    const todayCount = await this.getTodaySubmissionCount(userId)
    if (todayCount >= LIMITS.VENUE_SUBMISSIONS_PER_DAY) {
      throw venueSubmissionLimitError(todayCount)
    }

    const { error } = await supabase
      .from('venue_submissions')
      .insert(toSubmissionRow(userId, venue))

    if (error) {
      if (isVenueSubmissionLimitError(error)) throw venueSubmissionLimitError()
      throw error
    }
  },

  async listPendingSubmissions() {
    const { data } = await supabase
      .from('venue_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    return data || []
  },

  async approveSubmission(submission) {
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

    const { error: cleanupError } = await supabase
      .from('venue_submissions')
      .delete()
      .eq('id', submission.id)

    if (cleanupError) throw cleanupError

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
