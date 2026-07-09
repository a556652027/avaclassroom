//  極簡事件匯流排 (元件間解耦：navbar → profile modal / sidebar → org modal)
const listeners = new Map()

export const emitter = {
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event).add(fn)
    return () => listeners.get(event)?.delete(fn)
  },
  off(event, fn) {
    listeners.get(event)?.delete(fn)
  },
  emit(event, payload) {
    listeners.get(event)?.forEach((fn) => fn(payload))
  },
}
