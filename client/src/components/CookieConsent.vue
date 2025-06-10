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
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import PrivacyPolicy from './PrivacyPolicy.vue'
import { t } from '../locales'

const showConsent = ref(false)
const showPrivacy = ref(false)

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
