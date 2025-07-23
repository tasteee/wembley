// Documentation and demo site for wembly and she packages
// This will serve as the main documentation hub

import { wembley } from 'wembly'
import { brandColors } from 'she'

const siteInfo = {
  title: 'Wembly & She Documentation',
  description: 'Documentation and demos for the wembly soundfont library and she component library',
  packages: {
    wembly: '1.0.0',
    she: '1.0.0'
  },
  brandColors
} as const

export { siteInfo }

// Placeholder for future documentation and demo functionality
console.log('Site starting...', siteInfo)
console.log('Wembly library loaded:', typeof wembley)