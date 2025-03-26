<template>
  <section class="bio-section">
    <h2 class="bio-heading">{{ bio.split('\n')[0] }}</h2>
    <blockquote class="bio-quote">{{ bio.split('\n')[1] }}</blockquote>
  </section>

  <section ref="gallery" class="gallery-section">
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

  <section class="intro-text-section">
    <div class="intro-content-wrapper">
      <div class="intro-image">
        <img v-if="introImage" :src="introImage" alt="Icar origami" />
      </div>
      <div class="intro-text-container">
        <p>
          Az origami japán művészet, amelynek lényege, hogy egyetlen papírlapból vágás nélkül bármilyen formát létre lehet hozni.
          Egyszerre kihívás és meditatív tevékenység, amely fejleszti a türelmet, a precizitást, a koncentrációt és a kézügyességet.
          Engem az alkotás része fogott meg a legjobban. Számomra az origami egy csodálatos utazás, egy Odüsszeia.
          Amikor szemeim előtt lépésről lépésre, szép lassan életre kel a papír – számomra ez a legizgalmasabb.
          Csatlakozz hozzám egy inspiráló bemutatóra, ahol néhány alkotásomat bemutatva, bevezetlek az origami csodálatos világába!
        </p>
      </div>
    </div>
  </section>


</template>

<script setup>
import {
  posts,
  introImage,
  intro,
  gallery,
  scrollContainer,
  bio,
  initAnimations,
  initBio,
  initNewPosts
} from "../composables/Home.js";
import "../assets/styles/Home.css";
import {onMounted} from "vue";

onMounted(() => {
  initAnimations({intro, gallery, scrollContainer});
  initBio();
  initNewPosts();
});
</script>
