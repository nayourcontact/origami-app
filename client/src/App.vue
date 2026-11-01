<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { initLenis, refreshLenis, destroyLenis } from './composables/LenisSingleton.js'
import {useRoute} from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import axios from 'axios'
import {API_BASE_URL, INSTAGRAM_USER_ID} from './config.js'
import Toast from './components/Toast.vue'
import { allowMotion, allowBackgroundVideo, startPerformanceMonitor, stopPerformanceMonitor } from './composables/performance.js'
import CookieConsent from './components/CookieConsent.vue'

const route = useRoute()
const backgroundVideoUrl = ref(null)

const canShowVideo = computed(() => !isAdminRoute.value && allowBackgroundVideo.value)
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const toAbsoluteMediaUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_BASE_URL}${url}`
}

const loadBackgroundVideo = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/posts/videos/${INSTAGRAM_USER_ID}`)
    const videos = res.data?.posts || []
    if (videos.length > 0) {
      const sorted = [...videos].sort(
          (a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
      )
      backgroundVideoUrl.value = toAbsoluteMediaUrl(sorted[0]?.mediaUrl || null)
    }
  } catch (err) {
    console.error('Could not load the background video:', err)
  }
}

watch(() => route.fullPath, async () => {
  document.documentElement.classList.toggle('lite-motion', !allowMotion.value)
  document.documentElement.classList.toggle('full-motion', allowMotion.value)
  if (route.path.startsWith('/admin')) {
    document.body.classList.add('admin-mode')
  } else {
    document.body.classList.remove('admin-mode')
  }

  await nextTick()
  if (!isAdminRoute.value && allowMotion.value) initLenis()
  else destroyLenis()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshLenis()
    })
  })
}, { immediate: true })

onMounted(async () => {
  startPerformanceMonitor()
  if (canShowVideo.value) await loadBackgroundVideo()

  await nextTick()
  if (!isAdminRoute.value && allowMotion.value) initLenis()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshLenis()
      window.dispatchEvent(new Event('resize'))
    })
  })
})
watch([allowMotion, canShowVideo], async () => {
  document.documentElement.classList.toggle('lite-motion', !allowMotion.value)
  document.documentElement.classList.toggle('full-motion', allowMotion.value);
  if (!isAdminRoute.value && allowMotion.value) initLenis(); else destroyLenis();
  if (canShowVideo.value && !backgroundVideoUrl.value) await loadBackgroundVideo();
});
onUnmounted(() => { stopPerformanceMonitor(); destroyLenis(); });
</script>

<template>
  <div :class="{ 'admin-mode': isAdminRoute }">
    <Navbar v-if="!isAdminRoute"/>
    <div class="video-wrapper" v-if="backgroundVideoUrl && canShowVideo">
      <video
          :key="backgroundVideoUrl"
          :src="backgroundVideoUrl"
          autoplay
          loop
          muted
          playsinline
          preload="metadata"
          crossorigin="anonymous"
          class="background-video"
          @error="e => console.error('VIDEO ERROR', e.target?.error, backgroundVideoUrl)"
      />
    </div>

    <div id="scroll-container">
      <div class="page-layout">
        <main class="scroll-page">
          <RouterView :key="$route.fullPath" />
        </main>
        <Footer v-if="!isAdminRoute" />
      </div>
    </div>

    <Toast/>
    <CookieConsent/>
  </div>
</template>