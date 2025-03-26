<script setup>
import {ref, watch, onMounted, nextTick} from 'vue'
import {useRoute} from 'vue-router'
import {RouterView} from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ScrollManager from './components/ScrollManager.vue'
import axios from 'axios'
import {API_BASE_URL, INSTAGRAM_USER_ID} from './config.js'

const scrollManager = ref(null)
const backgroundVideoUrl = ref(null)
const route = useRoute()

watch(() => route.fullPath, async () => {
  await nextTick()
  setTimeout(() => {
    scrollManager.value?.updateScroll()
  }, 500)
})

onMounted(() => {
  loadBackgroundVideo()
  setTimeout(() => {
    scrollManager.value?.updateScroll()
  }, 1000)
})

async function loadBackgroundVideo() {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/posts/videos/${INSTAGRAM_USER_ID}`);
    const videos = res.data?.posts || []
    if (videos.length > 0) {
      const sorted = videos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      backgroundVideoUrl.value = sorted[0].mediaUrl
    }
  } catch (err) {
    console.error('Could not load the background video:', err)
  }
}
</script>

<template>
  <Navbar/>
  <ScrollManager ref="scrollManager"/>

  <div class="video-wrapper" v-if="backgroundVideoUrl">
    <video autoplay loop muted playsinline class="background-video">
      <source :src="backgroundVideoUrl" type="video/mp4"/>
      Your browser does not support the video tag.
    </video>
  </div>

  <div id="scroll-container" data-scroll-container>
    <div data-scroll-section class="scroll-page">
      <RouterView :key="$route.fullPath"/>
      <Footer/>
    </div>
  </div>

</template>
