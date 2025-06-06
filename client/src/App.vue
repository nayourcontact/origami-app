<script setup>
import {ref, computed, watch} from 'vue'
import {useRoute} from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import axios from 'axios'
import {API_BASE_URL, INSTAGRAM_USER_ID} from './config.js'
import Toast from './components/Toast.vue'

const route = useRoute()
const backgroundVideoUrl = ref(null)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const loadBackgroundVideo = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/posts/videos/${INSTAGRAM_USER_ID}`)
    const videos = res.data?.posts || []
    if (videos.length > 0) {
      const sorted = videos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      backgroundVideoUrl.value = sorted[0].mediaUrl
    }
  } catch (err) {
    console.error('Could not load the background video:', err)
  }
}

watch(() => route.fullPath, () => {
  if (route.path.startsWith('/admin')) {
    document.body.classList.add('admin-mode')
  } else {
    document.body.classList.remove('admin-mode')
  }
})


loadBackgroundVideo();
</script>

<template>
  <div :class="{ 'admin-mode': isAdminRoute }">
    <Navbar v-if="!isAdminRoute"/>

    <div class="video-wrapper" v-if="backgroundVideoUrl && !isAdminRoute">
      <video autoplay loop muted playsinline class="background-video">
        <source :src="backgroundVideoUrl" type="video/mp4"/>
        Your browser does not support the video tag.
      </video>
    </div>

    <div id="scroll-container" data-scroll-container>
      <div class="page-layout" data-scroll-section>
        <main class="scroll-page">
          <RouterView :key="$route.fullPath"/>
        </main>
        <Footer v-if="!isAdminRoute"/>
      </div>
    </div>

    <Toast />
  </div>
</template>
