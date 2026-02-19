import { MONTHS } from './constants'

/**
 * Convert YYYY-MM-DD → "D MMM YY" (e.g. "1 Apr 26", "18 Feb 26").
 * No zero-padding on day. Month as 3-letter abbreviation. 2-digit year.
 */
const formatDate = (dateStr: string): string => {
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const day = parseInt(dayStr, 10)
  const monthIndex = parseInt(monthStr, 10) - 1
  const yearShort = yearStr.slice(2)
  return `${day.toString()} ${MONTHS[monthIndex]} ${yearShort}`
}

export { formatDate }
