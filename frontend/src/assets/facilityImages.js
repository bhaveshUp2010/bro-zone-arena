// High quality curated sports facility imagery and metadata helpers

export const SPORT_ICONS = {
  Football: '⚽',
  Badminton: '🏸',
  Basketball: '🏀',
  Tennis: '🎾',
  Cricket: '🏏',
  Volleyball: '🏐',
  Squash: '🎾',
  Futsal: '⚽',
  Default: '🏆',
}

export const VENUE_IMAGES = {
  Football: [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  ],
  Badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1613918431703-884391696014?auto=format&fit=crop&w=1200&q=80',
  ],
  Basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80',
  ],
  Tennis: [
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
  ],
  Cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  ],
  Default: [
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  ],
}

export const getFacilityImage = (sportName, facilityId = '') => {
  const images = VENUE_IMAGES[sportName] || VENUE_IMAGES.Default
  const charCodeSum = facilityId ? facilityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
  return images[charCodeSum % images.length]
}

export const getSportIcon = (sportName) => {
  return SPORT_ICONS[sportName] || SPORT_ICONS.Default
}
