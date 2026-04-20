<template>
  <section ref="gallerySection" class="gallery-section">
    <div class="gallery-scroll-container">
      <div class="gallery-grid">
        <div
            v-for="(post, index) in posts"
            :key="post.id || index"
            class="gallery-item"
            @click="openModal(post)"
        >
          <div class="gallery-media-wrapper">
            <div v-if="!loadedItems[index]" class="spinner"></div>

            <img
                v-if="post.mediaType === 'IMAGE' || post.mediaType === 'CAROUSEL_ALBUM'"
                :src="post.mediaUrl"
                alt="Origami kép"
                loading="lazy"
                decoding="async"
                @load="handleLoad(index, $event)"
            />

            <video
                v-else-if="post.mediaType === 'VIDEO'"
                :src="post.mediaUrl"
                preload="metadata"
                autoplay
                muted
                loop
                playsinline
                controls
                @loadeddata="handleLoad(index, $event)"
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
    </div>
  </div>
</template>

<script setup>
import {
  posts,
  loadMorePosts,
  hasMore,
  isLoading,
  page,
} from "../composables/Gallery.js";
import {onMounted, onUnmounted, ref, computed, nextTick, watch} from "vue";
import {useRoute} from "vue-router";
import {t} from "../locales";
import "../assets/styles/Gallery.css";
import gsap from "gsap";
import { refreshLenis } from "../composables/LenisSingleton.js";

const route = useRoute();
const currentLanguage = computed(() => route.params.lang || "hu");
const loadedItems = ref({});

const showModal = ref(false);
const selectedPost = ref(null);
const loadMoreTrigger = ref(null);
const headingSection = ref(null);
const gallerySection = ref(null);

let observer = null;
let mouseOverHandler = null;
let mouseOutHandler = null;

onMounted(async () => {
  await nextTick();

  const tl = gsap.timeline({
    defaults: {opacity: 0, y: 40, duration: 0.5, ease: "power3.out"}
  });

  if (headingSection.value) {
    tl.from(headingSection.value, {});
  }

  if (gallerySection.value) {
    tl.from(gallerySection.value, {}, headingSection.value ? "-=0.3" : undefined);
  }

  if (!Array.isArray(posts.value)) {
    posts.value = [];
  }
  page.value = 1;
  hasMore.value = true;
  loadedItems.value = {};

  await loadMorePosts(currentLanguage);
  await nextTick();
  await ensureScrollable();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshScroll();
      window.dispatchEvent(new Event("resize"));
    });
  });

  observer = new IntersectionObserver(async (entries) => {
    if (entries[0]?.isIntersecting && hasMore.value && !isLoading.value) {
      await loadMorePosts(currentLanguage);
      await nextTick();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          refreshScroll();
          window.dispatchEvent(new Event('resize'));
        });
      });
    }
  }, {
    root: null,
    threshold: 0,
    rootMargin: "0px 0px",
  });

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }

  mouseOverHandler = (e) => {
    const item = e.target?.closest?.(".gallery-item");
    if (item) {
      gsap.to(item, {scale: 1.03, duration: 0.2, ease: "power1.out"});
    }
  };

  mouseOutHandler = (e) => {
    const item = e.target?.closest?.(".gallery-item");
    if (item) {
      gsap.to(item, {scale: 1, duration: 0.2, ease: "power1.inOut"});
    }
  };

  document.addEventListener("mouseover", mouseOverHandler);
  document.addEventListener("mouseout", mouseOutHandler);
});

onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
  }

  if (mouseOverHandler) {
    document.removeEventListener("mouseover", mouseOverHandler);
  }

  if (mouseOutHandler) {
    document.removeEventListener("mouseout", mouseOutHandler);
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
  const target = event?.target || event?.currentTarget;
  if (!target?.closest) return;

  const el = target.closest(".gallery-item");
  if (!el || el.classList.contains("animated")) return;

  gsap.fromTo(
      el,
      {
        autoAlpha: 0,
        y: 10,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power1.out"
      }
  );

  el.classList.add("animated");
}

function refreshScroll() {
  refreshLenis();
}

function handleLoad(index, event) {
  loadedItems.value[index] = true;
  animateItem(event);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshScroll();
    });
  });
}

watch(() => route.fullPath, async () => {
  await nextTick();
  requestAnimationFrame(() => {
    refreshLenis();
  });
});

async function ensureScrollable() {
  await nextTick();

  while (
      hasMore.value &&
      document.documentElement.scrollHeight <= window.innerHeight + 20
      ) {
    await loadMorePosts(currentLanguage);
    await nextTick();

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          refreshScroll();
          resolve();
        });
      });
    });
  }
}
</script>