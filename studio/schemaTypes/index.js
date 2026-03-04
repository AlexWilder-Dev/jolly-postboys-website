import menuCategory from './menuCategory'
import menuItem from './menuItem'
import event from './event'
import special from './special'
import siteSettings from './siteSettings'

export const schemaTypes = [
  // Settings (singleton)
  siteSettings,

  // Menu
  menuCategory,
  menuItem,

  // Events & specials
  event,
  special,
]
