<script setup>
import {onMounted, onBeforeUnmount, nextTick, watch} from 'vue'
import {useRoute} from 'vue-router'
import LocomotiveScroll from 'locomotive-scroll'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import '../assets/styles/ScrollManager.css'

gsap.registerPlugin(ScrollTrigger)

let scrollInstance = null
const route = useRoute()

const initScroll = () => {
  const scrollContainer = document.querySelector('[data-scroll-container]')
  if (!scrollContainer) return

  scrollInstance = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    lerp: 0.07,
    multiplier: 1,
    class: 'is-inview',
  })

  scrollInstance.on('scroll', ScrollTrigger.update)

  scrollInstance.on('scroll', (obj) => {
    const scrollY = obj?.scroll?.y ?? obj?.y
    const scrollLimitY = obj?.scroll?.limit?.y ?? obj?.limit?.y ?? 1
    if (scrollY == null || scrollLimitY == null) return

    const progress = (scrollY / scrollLimitY) * 100
    const bar = document.getElementById('scroll-progress-bar')
    if (bar) {
      bar.style.width = `${progress}%`
    }
  })

  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      return arguments.length
          ? scrollInstance.scrollTo(value, {duration: 0, disableLerp: true})
          : scrollInstance.scroll.instance.scroll.y
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    pinType: scrollContainer.style.transform ? 'transform' : 'fixed',
  })

  ScrollTrigger.addEventListener('refresh', () => scrollInstance.update())
  ScrollTrigger.refresh()

  setTimeout(() => {
    scrollInstance.update()
  }, 200)
}

watch(
    () => route.fullPath,
    async () => {
      await nextTick()
      setTimeout(() => {
        scrollInstance?.update()
        ScrollTrigger.refresh()
      }, 1000)
    }
)

onBeforeUnmount(() => {
  scrollInstance?.destroy()
  ScrollTrigger.removeEventListener('refresh', scrollInstance.update)
})

let resizeObserver

const observeResize = () => {
  const scrollContainer = document.querySelector('[data-scroll-container]')
  if (!scrollContainer) return

  resizeObserver = new ResizeObserver(() => {
    scrollInstance?.update()
    ScrollTrigger.refresh()
  })

  resizeObserver.observe(scrollContainer)
}

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    initScroll()
    observeResize()
  }, 100)
})

defineExpose({
  updateScroll: () => {
    scrollInstance?.update()
    ScrollTrigger.refresh()
  }
})

</script>

<template>
  <div id="scroll-progress-bar"></div>
</template>
