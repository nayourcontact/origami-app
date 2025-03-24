<template>
  <section class="bio-section">
    <h2 class="bio-heading">Travel with me to the World of Origami!</h2>
    <blockquote class="bio-quote">
      "The World of Imagination is boundless." <span class="bio-author">– J. Rousseau</span>
    </blockquote>
    <div class="bio-hashtags">
      <span class="hashtag">#origami</span>
      <span class="hashtag">#instagood</span>
      <span class="hashtag">#papercrafts</span>
      <span class="hashtag">#instafy</span>
      <span class="hashtag">#origamiart</span>
    </div>
  </section>

  <section ref="gallery" class="gallery-section">
    <div class="gallery-grid">
      <div v-for="(image, index) in images" :key="index" class="gallery-item">
        <img :src="image" alt="Origami kép"/>
      </div>
    </div>
  </section>
</template>

<script setup>
import {images, intro, gallery, scrollContainer, initAnimations} from "../composables/Home.js";
import "../assets/styles/Home.css";
import {onMounted} from "vue";

onMounted(() => {
  initAnimations({intro, gallery, scrollContainer});
});
</script>
