// Centralized brand UX component library and styles
// This package will contain shared UI components, design tokens, and styling

export const version = '1.0.0'

export const brandColors = {
  primary: '#007acc',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8'
} as const

export type BrandColorsT = typeof brandColors

// Placeholder for future component exports
export const components = {
  // Future components will be exported here
} as const