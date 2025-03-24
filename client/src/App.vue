<script setup>
import {ref, watch, onMounted, nextTick} from 'vue'
import {useRoute} from 'vue-router'
import {RouterView} from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ScrollManager from './components/ScrollManager.vue'

const scrollManager = ref(null)
const route = useRoute()

watch(() => route.fullPath, async () => {
  await nextTick()
  setTimeout(() => {
    scrollManager.value?.updateScroll()
  }, 500)
})

onMounted(() => {
  setTimeout(() => {
    scrollManager.value?.updateScroll()
  }, 1000)
})
</script>

<template>
  <Navbar/>
  <ScrollManager ref="scrollManager"/>

  <div class="video-wrapper">
    <video autoplay loop muted playsinline class="background-video">
      <source src="/482827208_9035470259897903_1040891524832501533_n.mp4" type="video/mp4"/>
      Your browser does not support the video tag.
    </video>
  </div>

  <div id="scroll-container" data-scroll-container>
    <div data-scroll-section class="scroll-page">
      <RouterView :key="$route.fullPath" />
      <Footer />
    </div>
  </div>

</template>
