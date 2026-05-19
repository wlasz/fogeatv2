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
  {
    title: 'Сценарий',
    tags: [
      'семейное',
      'для компании',
      'свидание',
      'ужин',
      'быстро',
      'центр',
      'вид',
      'терраса',
      'загород',
      'поздно',
      'доставка',
      'детям',
    ],
  },
]

export const CATEGORY_TAG_PRESETS = {
  Ресторан: ['ужин', 'семейное', 'свидание'],
  Кафе: ['завтраки', 'кофейня', 'десерты'],
  Хинкальная: ['хинкали', 'кавказская', 'для компании'],
  Пиццерия: ['пицца', 'доставка', 'быстро'],
  'Суши-бар': ['суши', 'японская', 'доставка'],
  Бургерная: ['бургеры', 'быстро', 'доставка'],
  'Гриль-бар': ['гриль', 'шашлык', 'для компании'],
  Фастфуд: ['быстро', 'доставка'],
  Бар: ['бар', 'пиво', 'коктейли'],
}

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

export const getSuggestedVenueTags = (category = '') => {
  if (CATEGORY_TAG_PRESETS[category]) return CATEGORY_TAG_PRESETS[category]
  if (category.includes('Кафе')) return CATEGORY_TAG_PRESETS.Кафе
  if (category.includes('Бар')) return CATEGORY_TAG_PRESETS.Бар
  if (category.includes('Фастфуд')) return CATEGORY_TAG_PRESETS.Фастфуд
  if (category.includes('Пицц')) return CATEGORY_TAG_PRESETS.Пиццерия
  if (category.includes('Суши')) return CATEGORY_TAG_PRESETS['Суши-бар']
  if (category.includes('Гриль')) return CATEGORY_TAG_PRESETS['Гриль-бар']

  return []
}
