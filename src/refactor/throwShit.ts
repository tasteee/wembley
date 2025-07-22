const THROW_MESSAGE_MAP = {
  'fetchSoundfont': 'Error fetching soundfont',
  'parseSoundfont': 'Error parsing soundfont',
  'networkError': 'Network error occurred',
}

export const throwShit = (messageOrKey: string, data: any) => {
  const message = THROW_MESSAGE_MAP[messageOrKey] || messageOrKey;
  console.error(message, data)
  throw new Error(message)
}