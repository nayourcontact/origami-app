import { ref, computed } from 'vue';

const STORAGE_KEY = 'origami.motion.profile';
const OPTIONS = ['auto', 'full', 'lite'];
const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
const media = isBrowser && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const reducedMotion = ref(media?.matches ?? false);
const cpu = isBrowser ? navigator.hardwareConcurrency : undefined;
const memory = isBrowser ? navigator.deviceMemory : undefined;
const saveData = isBrowser && navigator.connection?.saveData === true;
// Conservative hard fallback. Four cores / four GB are NOT automatically slow.
const hardwareLimited = (cpu > 0 && cpu <= 2) || (memory > 0 && memory <= 2);
const hardLimitReason = reducedMotion.value ? 'Rendszer: csökkentett mozgás' : saveData ? 'Adattakarékos mód' : hardwareLimited ? 'Korlátozott hardver' : '';
function readProfile() {
  if (!isBrowser) return 'auto';
  try { const value = localStorage.getItem(STORAGE_KEY); return OPTIONS.includes(value) ? value : 'auto'; }
  catch { return 'auto'; }
}
export const performanceProfile = ref(readProfile());
export const measuredLite = ref(false);
// A hardware and Save-Data are diagnostics only: they do not prove slow rendering.
// Respect OS accessibility, otherwise start in full mode and downgrade based on real interaction.
export const automaticLite = computed(() => reducedMotion.value || measuredLite.value);
export const liteMode = computed(() => performanceProfile.value === 'lite' || (performanceProfile.value === 'auto' && automaticLite.value));
export const allowMotion = computed(() => !liteMode.value);
export const allowBackgroundVideo = computed(() => allowMotion.value && !saveData);
export const performanceReason = computed(() => performanceProfile.value !== 'auto' ? 'Kézi beállítás' :
  reducedMotion.value ? 'Rendszer: csökkentett mozgás' :
  measuredLite.value ? 'Tartós megjelenítési akadozás' : 'Automatikus: teljes mód');
export const performanceMetrics = ref({ fps: null, frameP95: null, longTaskMs: null, heapUsedMB: null, heapLimitMB: null, samples: 0, status: 'Mérésre vár' });
export function setPerformanceProfile(value) {
  if (!OPTIONS.includes(value)) return;
  performanceProfile.value = value;
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* private mode */ }
}
if (media) media.addEventListener?.('change', event => { reducedMotion.value = event.matches; });

// One global low-overhead monitor, only while the page is visible.
let running = false;
let rafId = 0;
let lastFrame = 0;
let windowStart = 0;
let frames = [];
let longTaskMs = 0;
let observer = null;
let lowWindows = 0;
let startedAt = 0;
let diagnostics = false;
let lastInteraction = 0;
let interactionListenersAttached = false;
const INTERACTION_WINDOW_MS = 5000;
const activity = () => { lastInteraction = performance.now(); };
function attachActivityListeners() {
  if (interactionListenersAttached) return;
  interactionListenersAttached = true;
  for (const name of ['pointermove', 'pointerdown', 'wheel', 'touchmove', 'keydown', 'scroll'])
    window.addEventListener(name, activity, { passive: true });
}
function detachActivityListeners() {
  if (!interactionListenersAttached) return;
  interactionListenersAttached = false;
  for (const name of ['pointermove', 'pointerdown', 'wheel', 'touchmove', 'keydown', 'scroll'])
    window.removeEventListener(name, activity);
}
const WINDOW_MS = 4000;
const WARMUP_MS = 12000;
const BAD_FPS = 42;
const BAD_P95_MS = 45;
const BAD_LONG_TASK_MS = 350;
const REQUIRED_BAD_WINDOWS = 2;

function heapSnapshot() {
  const info = isBrowser ? performance.memory : null; // Chrome-only, best effort
  return info ? { heapUsedMB: Math.round(info.usedJSHeapSize / 1048576), heapLimitMB: Math.round(info.jsHeapSizeLimit / 1048576) }
    : { heapUsedMB: null, heapLimitMB: null };
}
function tick(now) {
  if (!running) return;
  if (document.hidden) {
    lastFrame = 0; windowStart = 0; frames = []; longTaskMs = 0; lowWindows = 0;
    rafId = window.requestAnimationFrame(tick); return;
  }
  if (!startedAt) startedAt = now;
  if (!windowStart) windowStart = now;
  if (lastFrame) frames.push(Math.min(now - lastFrame, 1000));
  lastFrame = now;
  if (now - windowStart >= WINDOW_MS) {
    const durations = frames.filter(x => x > 0 && x < 1000).sort((a,b) => a-b);
    const count = durations.length;
    const elapsed = durations.reduce((a,b) => a+b, 0);
    const fps = count && elapsed ? Math.min(60, Math.round(1000 * count / elapsed)) : null;
    const p95 = count ? Math.round(durations[Math.min(count - 1, Math.floor(count * 0.95))]) : null;
    // Avoid disabling animations on a page that is loading or sitting idle.
    // A long task alone is not evidence that motion is expensive.
    const active = lastInteraction > 0 && now - lastInteraction < INTERACTION_WINDOW_MS;
    const eligible = active && now - startedAt >= WARMUP_MS && performanceProfile.value === 'auto' && !automaticLite.value;
    const bad = eligible && ((fps !== null && fps < BAD_FPS && p95 !== null && p95 > 24) || (p95 !== null && p95 > BAD_P95_MS && longTaskMs > BAD_LONG_TASK_MS));
    lowWindows = bad ? lowWindows + 1 : 0;
    performanceMetrics.value = { fps, frameP95: p95, longTaskMs: Math.round(longTaskMs), ...heapSnapshot(), samples: performanceMetrics.value.samples + 1, status: diagnostics ? 'Élő mérés' : 'Automatikus monitor' };
    if (lowWindows >= REQUIRED_BAD_WINDOWS) measuredLite.value = true;
    frames = []; longTaskMs = 0; windowStart = now;
  }
  rafId = window.requestAnimationFrame(tick);
}
export function startPerformanceMonitor() {
  if (!isBrowser || running) return;
  running = true;
  startedAt = 0;
  lastInteraction = 0;
  attachActivityListeners();
  rafId = window.requestAnimationFrame(tick);
  if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    try {
      observer = new PerformanceObserver(list => { if (!document.hidden) longTaskMs += list.getEntries().reduce((s, x) => s + x.duration, 0); });
      observer.observe({ entryTypes: ['longtask'] });
    } catch { observer = null; }
  }
}
export function stopPerformanceMonitor() {
  running = false;
  if (isBrowser) window.cancelAnimationFrame(rafId);
  observer?.disconnect(); observer = null;
  detachActivityListeners();
}
export function setPerformanceDiagnostics(value) { diagnostics = !!value; }
export function resetAutomaticAssessment() { measuredLite.value = false; lowWindows = 0; startedAt = 0; lastInteraction = 0; }
export const performanceCapabilities = { cpu: cpu || null, memoryGB: memory || null, saveData, longTasks: isBrowser && 'PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask') === true, hardLimitReason };
