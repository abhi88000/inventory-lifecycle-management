export function matchesLotSearch(lot: any, query: string): boolean {
  if (!query) return true
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    lot.lotNumber, lot.brand, lot.fitType, lot.fabricator, lot.washer, lot.finisher, lot.sourceRollNumber
  ].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(needle)
}

export function matchesRollSearch(roll: any, query: string): boolean {
  if (!query) return true
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [roll.rollNumber, roll.brand, roll.fabric].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(needle)
}
