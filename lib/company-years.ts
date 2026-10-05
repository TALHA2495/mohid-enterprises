/** Company establishment date: 15 January 2005. */
export const ESTABLISHED = new Date(2005, 0, 15)

/** Completed years since establishment (anniversary-day floor). */
export function yearsEstablished(): number {
  const now = new Date()
  let years = now.getFullYear() - ESTABLISHED.getFullYear()
  const passedAnniversary =
    now.getMonth() > ESTABLISHED.getMonth() ||
    (now.getMonth() === ESTABLISHED.getMonth() && now.getDate() >= ESTABLISHED.getDate())
  if (!passedAnniversary) years -= 1
  return years
}

/** Display label, e.g. "21+". */
export const yearsEstablishedLabel = (): string => `${yearsEstablished()}+`
