<template>
  <div ref="scrollContainer" class="scroll-container">
    <div class="video-wrapper">
      <video autoplay loop muted playsinline class="fixed top-0 left-0 w-full h-full object-cover z-0">
        <source src="../assets/videos/482827208_9035470259897903_1040891524832501533_n.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>

    <section ref="intro"
             class="relative flex flex-col items-center justify-center min-h-screen text-center text-white px-8">
      <h1 class="text-5xl sm:text-7xl font-extrabold tracking-wide opacity-0">
        Üdvözöllek az Origami Világában
      </h1>
      <p class="mt-6 text-lg sm:text-2xl max-w-3xl opacity-0">
        A papír művészete egy aprólékos folyamat, ahol minden hajtás egy történetet mesél el.
        Fedezd fel az egyedi alkotásokat, és hagyd, hogy inspiráljon a kreativitás ereje.
      </p>
      <button
          class="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md opacity-0 hover:bg-gray-200 transition duration-300">
        Fedezd fel
      </button>
    </section>

    <section ref="gallery" class="relative py-16 px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(image, index) in images" :key="index"
             class="rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
          <img :src="image" class="w-full h-64 object-cover">
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

import image1 from "../assets/images/481380548_1011302577517671_6178661449282385340_n.jpg";
import image2 from "../assets/images/481507709_554499343609416_3607355746556796657_n.jpg";
import image3 from "../assets/images/481686935_1700172133905983_1229115931246108137_n.jpg";
import image4 from "../assets/images/482523521_1394755978360160_8678528952687149298_n.jpg";
import image5 from "../assets/images/482601024_3910660735848857_6359899532700799832_n.jpg";
import image6 from "../assets/images/482729694_1453345856038176_4180568950418028172_n.jpg";

export default {
  setup() {
    const images = ref([image1, image2, image3, image4, image5, image6]);
    const intro = ref(null);
    const gallery = ref(null);
    const scrollContainer = ref(null);

    onMounted(() => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      gsap.to(intro.value.querySelectorAll("h1, p, button"), {
        opacity: 1,
        y: 0,
        stagger: 0.3,
        duration: 1,
        ease: "power2.out",
      });

      gsap.from(gallery.value, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: gallery.value,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return {images, intro, gallery, scrollContainer};
  },
};
</script>

<style scoped>
.scroll-container {
  overflow: hidden;
  position: relative;
}

.video-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: blur(10px);
}

.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

body {
  overscroll-behavior: none;
}

h1, p, button {
  opacity: 0;
  transform: translateY(20px);

}
</style>