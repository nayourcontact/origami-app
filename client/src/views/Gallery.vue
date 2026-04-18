<template>
<!--  <section ref="headingSection" class="bio-section">
    <h2 class="bio-heading">{{ t(currentLanguage, 'gallery') }}</h2>
  </section>-->

  <section ref="gallerySection" class="gallery-section">
    <div class="gallery-scroll-container">
      <div class="gallery-grid">
        <div
            v-for="(post, index) in posts"
            :key="index"
            class="gallery-item"
            @click="openModal(post)"
        >
          <div class="gallery-media-wrapper">
            <div v-if="!loadedItems[index]" class="spinner"></div>
            <img
                v-if="post.mediaType === 'IMAGE' || post.mediaType === 'CAROUSEL_ALBUM'"
                :src="post.mediaUrl"
                alt="Origami kép"
                @load="() => handleLoad(index, $event)"
            />
            <video
                v-else-if="post.mediaType === 'VIDEO'"
                :src="post.mediaUrl"
                autoplay
                muted
                loop
                playsinline
                controls
                @loadeddata="() => handleLoad(index, $event)"
            />
          </div>
        </div>
      </div>
      <p v-if="isLoading" class="loading-text">
        {{ t(currentLanguage, 'loading') || 'Töltés...' }}
      </p>
      <div ref="loadMoreTrigger" class="loading-trigger"></div>
    </div>
  </section>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content modal-two-column">
<!--
      <button class="close-button" @click="closeModal">×</button>
-->

      <div class="modal-media">
        <img
            v-if="selectedPost?.mediaType === 'IMAGE' || selectedPost?.mediaType === 'CAROUSEL_ALBUM'"
            :src="selectedPost.mediaUrl"
            alt="Nagy kép"
        />
        <video
            v-else-if="selectedPost?.mediaType === 'VIDEO'"
            :src="selectedPost.mediaUrl"
            autoplay
            muted
            loop
            playsinline
            controls
        />
      </div>

<!--      <div class="modal-caption-side" v-if="selectedPost?.caption">
        <p class="modal-caption">{{ cleanCaption }}</p>
      </div>-->
    </div>
  </div>
</template>

<script setup>
import {
  posts,
  loadMorePosts,
  hasMore,
  isLoading,
  page, // fontos, hogy exportált legyen a Gallery.js-ben
} from "../composables/Gallery.js";
import {onMounted, onUnmounted, ref, computed, nextTick, watch} from "vue";
import {useRoute} from "vue-router";
import {t} from "../locales";
import "../assets/styles/Gallery.css";
import gsap from "gsap";
import DOMPurify from "isomorphic-dompurify";

const route = useRoute();
const currentLanguage = computed(() => route.params.lang || "hu");
const loadedItems = ref({});

const showModal = ref(false);
const selectedPost = ref(null);
const loadMoreTrigger = ref(null);
const headingSection = ref(null);
const gallerySection = ref(null);
let observer = null;

const cleanCaption = computed(() => {
  return selectedPost.value?.caption
      ? DOMPurify.sanitize(selectedPost.value.caption, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      })
      : "";
});

onMounted(async () => {
  await nextTick();
  const tl = gsap.timeline({
    defaults: {opacity: 0, y: 40, duration: 0.5, ease: "power3.out"}
  });

  tl.from(headingSection.value, {})
      .from(gallerySection.value, {}, "-=0.3");

  posts.value = [];
  page.value = 1;
  hasMore.value = true;
  await loadMorePosts(currentLanguage);

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
          loadMorePosts();
        }
      },
      {
        root: document.querySelector(".gallery-scroll-container"),
        threshold: 1.0,
      }
  );
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});

onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
  }
});

function openModal(post) {
  selectedPost.value = post;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedPost.value = null;
}

watch(showModal, async (val) => {
  await nextTick();
  const modal = document.querySelector(".modal-content");
  if (modal && val) {
    gsap.fromTo(
        modal,
        {scale: 0.8, opacity: 0},
        {scale: 1, opacity: 1, duration: 0.3, ease: "power2.out"}
    );
  }
});

function animateItem(event) {
  const el = event.target.closest(".gallery-item");
  if (el && !el.classList.contains("animated")) {
    gsap.fromTo(el, {
      autoAlpha: 0, // kombinálja az opacity-t és visibility-t
      y: 10,
    }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      ease: "power1.out"
    });
    el.classList.add("animated");
  }
}

onMounted(() => {
  document.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".gallery-item");
    if (item) {
      gsap.to(item, {scale: 1.03, duration: 0.2, ease: "power1.out"});
    }
  });
  document.addEventListener("mouseout", (e) => {
    const item = e.target.closest(".gallery-item");
    if (item) {
      gsap.to(item, {scale: 1, duration: 0.2, ease: "power1.inOut"});
    }
  });
});

function handleLoad(index, event) {
  loadedItems.value[index] = true;
  animateItem(event);
}
</script>
