<template>
  <section ref="viewWrapper" class="bio-section">
    <h2 class="bio-heading">{{ bio.split('\n')[0] }}</h2>
    <blockquote class="bio-quote">{{ bio.split('\n')[1] }}</blockquote>
  </section>

  <section ref="galleryWrapper" class="gallery-section">
    <div class="gallery-grid">
      <div v-for="(post, index) in posts" :key="index" class="gallery-item">
        <img v-if="post.mediaType === 'IMAGE' || post.mediaType === 'CAROUSEL_ALBUM'" :src="post.mediaUrl"
             alt="Origami kép"/>
        <video
            v-else-if="post.mediaType === 'VIDEO'"
            :src="post.mediaUrl"
            autoplay
            muted
            loop
            playsinline
        />
      </div>
    </div>
  </section>

  <section ref="introWrapper" class="intro-text-section">
    <div class="intro-content-wrapper">
      <div class="intro-image">
        <img v-if="introImage" :src="introImage" alt="Icar origami"/>
      </div>
      <div class="intro-text-container">
        <p>
          <span v-for="(line, idx) in t(currentLanguage, 'introText').split('\n')" :key="idx">
            {{ line }}<br />
          </span>
        </p>

      </div>
    </div>
  </section>

</template>

<script setup>
import {
  posts,
  introImage,
  bio,
  initAnimations,
  initBio,
  initNewSixPosts
} from "../composables/Home.js";

import "../assets/styles/Home.css";
import gsap from "gsap";
import {ref, onMounted} from "vue";
import {useRoute} from "vue-router";
import { t } from "../locales";

const viewWrapper = ref(null);
const galleryWrapper = ref(null);
const introWrapper = ref(null);
const route = useRoute();
const currentLanguage = route.params.lang || "hu";

onMounted(() => {
  initAnimations();
  initBio(currentLanguage);
  initNewSixPosts(currentLanguage);

  const tl = gsap.timeline({
    defaults: {opacity: 0, y: 40, duration: 0.5, ease: "power3.out"}
  });

  tl.from(viewWrapper.value, {})
      .from(galleryWrapper.value, {}, "-=0.3")
      .from(introWrapper.value, {}, "-=0.3");
});
</script>
