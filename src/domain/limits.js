export const LIMITS = Object.freeze({
  VENUE_SUBMISSIONS_PER_DAY: 3,
  CUSTOM_VENUES_TOTAL: 10,
})

export const LIMIT_ERROR_CODES = Object.freeze({
  VENUE_SUBMISSIONS_PER_DAY: 'VENUE_SUBMISSIONS_PER_DAY_LIMIT',
  CUSTOM_VENUES_TOTAL: 'CUSTOM_VENUES_TOTAL_LIMIT',
})

export const createLimitError = (code, message, details = {}) => (
  Object.assign(new Error(message), { code, details })
)
