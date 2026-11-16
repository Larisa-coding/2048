export type SoundName = 'move' | 'merge' | 'record' | 'win' | 'gameover'

let audioCtx: AudioContext | null = null
let unlocked = false

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export const unlockAudio = async (): Promise<void> => {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      return
    }
  }
  unlocked = true
}

const tone = (
  freq: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  when = 0,
) => {
  const ctx = getCtx()
  if (!ctx || !unlocked) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const start = ctx.currentTime + when
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export const playSound = (name: SoundName, enabled: boolean): void => {
  if (!enabled) return
  void unlockAudio().then(() => {
    switch (name) {
      case 'move':
        tone(220, 0.06, 'triangle', 0.04)
        break
      case 'merge':
        tone(330, 0.08, 'sine', 0.06)
        tone(440, 0.1, 'sine', 0.04, 0.04)
        break
      case 'record':
        tone(523, 0.1, 'sine', 0.07)
        tone(659, 0.12, 'sine', 0.06, 0.08)
        tone(784, 0.16, 'sine', 0.05, 0.16)
        break
      case 'win':
        tone(523, 0.12, 'sine', 0.07)
        tone(659, 0.12, 'sine', 0.07, 0.1)
        tone(784, 0.12, 'sine', 0.07, 0.2)
        tone(1046, 0.2, 'sine', 0.06, 0.32)
        break
      case 'gameover':
        tone(196, 0.18, 'sawtooth', 0.04)
        tone(147, 0.25, 'sawtooth', 0.035, 0.12)
        break
    }
  })
}
