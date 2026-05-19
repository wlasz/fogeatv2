export const VENUE_TAG_GROUPS = [
  {
    title: 'Кухня',
    tags: [
      'осетинская',
      'кавказская',
      'грузинская',
      'итальянская',
      'европейская',
      'восточная',
      'японская',
      'авторская',
      'домашняя',
    ],
  },
  {
    title: 'Формат',
    tags: [
      'завтраки',
      'кофейня',
      'пироги',
      'хинкали',
      'пицца',
      'бургеры',
      'гриль',
      'шашлык',
      'суши',
      'бар',
      'пиво',
      'коктейли',
      'десерты',
    ],
  },
]

export const parseVenueTags = (value = '') => (
  value
    .split(/[,/·;]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
)

export const formatVenueTags = (tags) => {
  const seen = new Set()

  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(', ')
}

export const hasVenueTag = (value, tag) => (
  parseVenueTags(value).some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase())
)

export const toggleVenueTag = (value, tag) => {
  const tags = parseVenueTags(value)
  const exists = tags.some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase())
  return formatVenueTags(exists ? tags.filter((currentTag) => currentTag.toLowerCase() !== tag.toLowerCase()) : [...tags, tag])
}

export const mergeVenueTags = (value, tagsToAdd) => (
  formatVenueTags([...parseVenueTags(value), ...tagsToAdd])
)
