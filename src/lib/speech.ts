/* Web Speech API 封装：朗读（TTS）与语音识别（ASR） */

// ---------- 朗读 ----------
let cachedVoice: SpeechSynthesisVoice | null = null

function pickVoice(locale: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const lang = locale.toLowerCase()
  return (
    voices.find((v) => v.lang.toLowerCase() === lang) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2))) ||
    voices[0]
  )
}

// 部分浏览器语音列表异步加载
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
  }
}

export function speak(text: string, locale: string, rate = 0.95): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve()
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = locale
    u.rate = rate
    u.pitch = 1
    if (!cachedVoice || cachedVoice.lang.slice(0, 2) !== locale.slice(0, 2)) {
      cachedVoice = pickVoice(locale)
    }
    if (cachedVoice) u.voice = cachedVoice
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

export function stopSpeak() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

// ---------- 语音识别 ----------
interface SpeechRecognitionResultLike {
  0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: { length: number; [i: number]: SpeechRecognitionResultLike }
}
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: unknown) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export const asrSupported = (): boolean => getRecognitionCtor() !== null

export interface RecognizeHandlers {
  onPartial?: (text: string) => void
  onResult: (text: string) => void
  onError?: (msg: string) => void
  onEnd?: () => void
}

export function recognize(locale: string, handlers: RecognizeHandlers): () => void {
  const Ctor = getRecognitionCtor()
  if (!Ctor) {
    handlers.onError?.('当前浏览器不支持语音识别，请使用 Chrome / Edge，或使用自评模式')
    return () => {}
  }
  const rec = new Ctor()
  rec.lang = locale
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1

  let finalText = ''
  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript
      if (i === e.results.length - 1) interim += transcript
    }
    // 最后一段作为候选最终结果
    finalText = e.results[e.results.length - 1][0].transcript.trim()
    handlers.onPartial?.(interim)
  }
  rec.onerror = () => handlers.onError?.('识别失败，请检查麦克风权限后重试')
  rec.onend = () => {
    handlers.onResult(finalText)
    handlers.onEnd?.()
  }

  try {
    rec.start()
  } catch {
    handlers.onError?.('无法启动麦克风，请稍后再试')
  }
  return () => rec.abort()
}
