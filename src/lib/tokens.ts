export function computeEffectiveTokens(entries: { breakfastToken: number; lunchDinnerToken: number }[]): number {
  const totalBreakfast = entries.reduce((s, e) => s + e.breakfastToken, 0)
  const totalLunchDinner = entries.reduce((s, e) => s + e.lunchDinnerToken, 0)
  const extra = Math.max(0, totalBreakfast - totalLunchDinner)
  return totalLunchDinner + extra * 0.25
}
