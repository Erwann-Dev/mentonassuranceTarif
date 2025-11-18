const KEY = 'moto-quote-form'

export function saveState<T>(state: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
}

export function loadState<T>(): T | undefined {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

