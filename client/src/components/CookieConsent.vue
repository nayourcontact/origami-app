<template>
  <Teleport to="body">
    <div v-if="showConsent" class="cookie-consent-box">
      <p class="cookie-text">
        🍪 {{ t(lang, 'cookieText') }}
        <button class="cookie-link" @click="showPrivacy = true">
          {{ t(lang, 'moreInfo') }}
        </button>
      </p>
      <div class="cookie-actions">
        <button @click="accept" class="cookie-accept">{{ t(lang, 'accept') }}</button>
        <button @click="decline" class="cookie-decline">{{ t(lang, 'decline') }}</button>
      </div>

      <PrivacyPolicy :show="showPrivacy" @update:show="showPrivacy = $event" />
    </div>
    <button v-if="!showConsent" type="button" class="visitor-settings-toggle" @click="showPreferences = !showPreferences" aria-label="Megjelenítési beállítások" :aria-expanded="showPreferences">⚙ Beállítások</button>
    <div v-if="showPreferences && !showConsent" class="visitor-preferences" role="group" aria-label="Megjelenítési beállítások">
      <div class="visitor-preferences-head"><strong>Megjelenítés</strong><button type="button" @click="showPreferences = false" aria-label="Bezárás">×</button></div>
      <label for="visitor-motion">Animációk</label>
      <select id="visitor-motion" :value="performanceProfile" @change="setPerformanceProfile($event.target.value)">
        <option value="auto">Automatikus</option>
        <option value="full">Bekapcsolva</option>
        <option value="lite">Kikapcsolva</option>
      </select>
      <small aria-live="polite">{{ performanceProfile === 'auto' ? (automaticLite ? 'A rendszer csökkentett módot választott' : 'A rendszer teljes módot választott') : (allowMotion ? 'Animációk aktívak' : 'Animációk kikapcsolva') }}</small>
      <small>Ok: {{ performanceReason }}</small>
      <button type="button" @click="showMetrics = !showMetrics; setPerformanceDiagnostics(showMetrics)">{{ showMetrics ? 'Mérés elrejtése' : 'Teljesítmény mérése' }}</button>
      <div v-if="showMetrics" class="visitor-motion-metrics" aria-live="off">
        <div>FPS: <strong>{{ performanceMetrics.fps ?? '–' }}</strong> · Frame p95: {{ performanceMetrics.frameP95 ?? '–' }} ms</div>
        <div>Long tasks / 4s: {{ performanceMetrics.longTaskMs ?? '–' }} ms</div>
        <div>JS heap: {{ performanceMetrics.heapUsedMB ?? 'nem támogatott' }} MB / {{ performanceMetrics.heapLimitMB ?? '–' }} MB</div>
        <div>CPU szálak: {{ performanceCapabilities.cpu ?? 'ismeretlen' }} · RAM: {{ performanceCapabilities.memoryGB ?? 'ismeretlen' }} GB</div>
        <small>A böngésző CPU %-át nem lehet megbízhatóan kiolvasni; Chrome Performance panellel mérd. A mérés nem fut a háttérben nyitott lapokon.</small>
        <button type="button" @click="resetAutomaticAssessment">Automatikus felmérés újraindítása</button>
      </div>
      <button type="button" class="visitor-cookie-link" @click="showPrivacy = true">Süti- és adatvédelmi tájékoztató</button>
    </div>
    <PrivacyPolicy v-if="!showConsent" :show="showPrivacy" @update:show="showPrivacy = $event" />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import PrivacyPolicy from './PrivacyPolicy.vue'
import { t } from '../locales'
import { allowMotion, automaticLite, performanceProfile, setPerformanceProfile, performanceReason, performanceMetrics, performanceCapabilities, setPerformanceDiagnostics, resetAutomaticAssessment } from '../composables/performance.js'

const showConsent = ref(false)
const showPreferences = ref(false)
const showPrivacy = ref(false)
const showMetrics = ref(false)

const route = useRoute()
const lang = computed(() => route.params.lang || 'hu')

onMounted(() => {
  const decision = localStorage.getItem('cookieConsent')

  // csak ha még nincs választás
  if (decision === null) {
    showConsent.value = true
  } else if (decision === 'true') {
    enableOptionalScripts()
  }
})

const accept = () => {
  localStorage.setItem('cookieConsent', 'true')
  showConsent.value = false
  enableOptionalScripts()
}

const decline = () => {
  localStorage.setItem('cookieConsent', 'false')
  showConsent.value = false
}

// 👉 ide jön minden, amit csak engedéllyel töltesz be
const enableOptionalScripts = () => {
  // Google Analytics
  const gaScript = document.createElement('script')
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'
  gaScript.async = true
  document.head.appendChild(gaScript)

  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  gtag('js', new Date())
  gtag('config', 'G-XXXXXXXXXX')

  // Google ID (ha használt)
  const gIdScript = document.createElement('script')
  gIdScript.src = 'https://accounts.google.com/gsi/client'
  gIdScript.async = true
  document.head.appendChild(gIdScript)
}
</script>

<style scoped>
.cookie-consent-box {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  max-width: 320px;
  width: 90vw;
  background: #fff;
  border: 1px solid #d1d5db;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.9rem;
  color: #1f2937;
  z-index: 9999;
}

.cookie-text {
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.cookie-link {
  text-decoration: underline;
  color: #646cff;
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  cursor: pointer;
  font-size: inherit;
}

.cookie-link:hover {
  color: #646cff;
}

.cookie-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.cookie-accept {
  background-color: #00ceff;
  color: white;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.cookie-accept:hover {
  background-color: #018aab;
}

.cookie-decline {
  background-color: #e5e7eb;
  color: #111827;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.cookie-decline:hover {
  background-color: #d1d5db;
}
</style>

<style scoped>
.visitor-settings-toggle {position:fixed;right:16px;bottom:16px;z-index:9997;border:1px solid #d4c3ac;background:#fff9f1;color:#372a22;border-radius:22px;padding:9px 13px;box-shadow:0 3px 12px #0002;cursor:pointer;font:12px system-ui,sans-serif}
.visitor-preferences {position:fixed;right:16px;bottom:61px;z-index:9998;width:min(290px,calc(100vw - 32px));background:#fffaf3;border:1px solid #d4c3ac;border-radius:14px;box-shadow:0 6px 25px #0002;padding:15px;display:grid;gap:10px;color:#32271d;font:13px system-ui,sans-serif}
.visitor-preferences-head {display:flex;justify-content:space-between;align-items:center}
.visitor-preferences-head button {border:0;background:transparent;font-size:22px;cursor:pointer;color:inherit}
.visitor-preferences select {width:100%;padding:9px;border-radius:8px;border:1px solid #bea98e;background:white;color:#32271d}
.visitor-preferences small {color:#665747}
.visitor-cookie-link {border:0;text-decoration:underline;text-align:left;background:transparent;padding:4px 0;color:#665747;cursor:pointer}
</style>

<style scoped>
.visitor-motion-metrics { font-size: .78rem; line-height: 1.55; border-top: 1px solid #ded7cb; margin-top: .5rem; padding-top: .5rem; }
.visitor-motion-metrics button { display: block; margin-top: .4rem; }
</style>
