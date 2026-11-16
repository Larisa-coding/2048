/** Mulberry32 state — seed is the mutable internal counter */
export interface RngState {
  seed: number
}

export const createRngState = (seed: number): RngState => ({
  seed: seed >>> 0,
})

/** Draw next float in [0, 1) and return updated state */
export const nextFloat = (state: RngState): { value: number; state: RngState } => {
  const nextSeed = (state.seed + 0x6d2b79f5) >>> 0
  let t = nextSeed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return { value, state: { seed: nextSeed } }
}

export const nextInt = (
  state: RngState,
  maxExclusive: number,
): { value: number; state: RngState } => {
  const { value, state: next } = nextFloat(state)
  return { value: Math.floor(value * maxExclusive), state: next }
}

export const randomSeed = (): number =>
  (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
