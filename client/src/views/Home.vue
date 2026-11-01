<template>
  <section ref="viewWrapper" class="bio-section">
    <div class="hero-label">Origami Artist · Paper Craft · Workshops</div>

    <h2 class="bio-heading">
      {{ t(currentLanguage, 'homeMainTitle') }}
    </h2>

    <p class="hero-subtitle">
      {{ t(currentLanguage, 'heroTitle') }}
    </p>

    <div class="bio-origami-shape shape-one">
      <span class="fold fold-a"></span>
      <span class="fold fold-b"></span>
      <span class="fold fold-c"></span>
    </div>

    <div class="bio-origami-shape shape-two">
      <span class="fold fold-a"></span>
      <span class="fold fold-b"></span>
      <span class="fold fold-c"></span>
    </div>
  </section>

  <section
      v-if="galleryReady && posts?.length"
      ref="galleryWrapper"
      class="gallery-section--compact"
  >
    <div class="gallery-grid-six">

      <div
          v-for="(post, index) in posts"
          :key="post.igId || index"
          class="gallery-item"
      >

        <img v-if="post.mediaType === 'IMAGE' || post.mediaType === 'CAROUSEL_ALBUM'" :src="post.mediaUrl"
             alt="Origami kép" loading="lazy" decoding="async"/>
        <video
            v-else-if="post.mediaType === 'VIDEO'"
            :src="post.mediaUrl"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
        />
      </div>
    </div>
  </section>

  <section ref="introWrapper" class="intro-text-section">
    <div class="intro-kicker">Artist story · Paper philosophy</div>
    <div class="intro-content-wrapper">
      <div class="intro-image profile-image-wrapper">
        <div class="profile-image-ring">
          <img
              src="../assets/images/profile.jpg"
              alt="Takács Alfréd origami művész"
              decoding="async"
          />
        </div>
      </div>

      <div class="intro-text-container">
        <p>
        <span
            v-for="(line, idx) in t(currentLanguage, 'introText').split('\n')"
            :key="idx"
            class="intro-line"
        >
          {{ line }}<br/>
        </span>
        </p>
      </div>

    </div>

    <aside class="contact-card" aria-labelledby="contact-title">
      <span class="contact-kicker">
        {{ currentLanguage === 'en' ? 'Contact' : 'Kapcsolat' }}
      </span>

      <h3 id="contact-title">
        {{ currentLanguage === 'en' ? 'Get in touch' : 'Kapcsolatfelvétel' }}
      </h3>

      <a href="mailto:alfred.takacs92@gmail.com" class="contact-email">
        alfred.takacs92@gmail.com
      </a>
    </aside>

  </section>
</template>

<script setup>
import {
  posts,
  introImage,
  bio,
  initBio,
  initNewSixPosts
} from "../composables/Home.js";

import "../assets/styles/Home.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { allowMotion } from "../composables/performance.js";
import {ref, onMounted, onUnmounted, nextTick, watch} from "vue";
import {useRoute} from "vue-router";
import {t} from "../locales";

const viewWrapper = ref(null);
const galleryWrapper = ref(null);
const introWrapper = ref(null);
const route = useRoute();
const currentLanguage = route.params.lang || "hu";
const galleryReady = ref(false);

gsap.registerPlugin(ScrollTrigger);

let disposed = false;
let activeContext = null;
let motionVersion = 0;
let motionCleanups = [];

function teardownMotion() {
  motionVersion++;
  motionCleanups.forEach(fn => fn());
  motionCleanups = [];
  activeContext?.revert();
  activeContext = null;
}

async function setupMotion() {
  teardownMotion();
  if (!allowMotion.value || disposed) return;
  const version = motionVersion;
  await nextTick();
  if (disposed || !allowMotion.value || version !== motionVersion) return;
  // A context owns only this component's animations/triggers.
  activeContext = gsap.context(() => {
    const hero = viewWrapper.value;
    const intro = introWrapper.value;
    const gallery = galleryWrapper.value;
    if (hero) {
      attachHeroPointer(hero);
      gsap.fromTo(hero.querySelectorAll('.hero-label, .bio-heading, .hero-subtitle'),
        {autoAlpha: 1, y: 18},
        {autoAlpha: 1, y: 0, duration: .65, stagger: .09, ease: 'power2.out', clearProps: 'transform,opacity,visibility'});
    }
    if (intro) {
      gsap.fromTo(intro.querySelectorAll('.intro-kicker, .profile-image-ring, .intro-text-container, .contact-card'),
        {autoAlpha: 1, y: 16},
        {autoAlpha: 1, y: 0, stagger: .09, duration: .6, ease: 'power2.out',
          scrollTrigger: {trigger: intro, start: 'top 90%', once: true},
          clearProps: 'transform,opacity,visibility'});
    }
    if (gallery) {
      const items = gallery.querySelectorAll('.gallery-item');
      if (items.length) attachGalleryFocus(gallery, items);
      if (items.length) gsap.fromTo(items,
        {autoAlpha: 1, y: 12},
        {autoAlpha: 1, y: 0, duration: .5, stagger: .06, ease: 'power2.out',
          clearProps: 'transform,opacity,visibility'});
    }
  }, viewWrapper.value?.parentElement || undefined);
  ScrollTrigger.refresh();
}

// Pointer effects exist only in full mode. Listeners are removed before context.revert().
function attachHeroPointer(hero) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const title = hero.querySelector('.bio-heading');
  const label = hero.querySelector('.hero-label');
  const subtitle = hero.querySelector('.hero-subtitle');
  const shapeOne = hero.querySelector('.shape-one');
  const shapeTwo = hero.querySelector('.shape-two');
  const ease = 'power3.out';
  let frame = 0;
  let position = null;
  const move = (e) => {
    position = {x: e.clientX, y: e.clientY};
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!position) return;
      const rect = hero.getBoundingClientRect();
      const x = gsap.utils.clamp(-.5, .5, (position.x - rect.left) / rect.width - .5);
      const y = gsap.utils.clamp(-.5, .5, (position.y - rect.top) / rect.height - .5);
      activeContext?.add(() => gsap.to(hero, {x: x * 3, y: y * 2, rotateX: -y * 4, rotateY: x * 5, duration: .65, overwrite: 'auto', ease}));
      activeContext?.add(() => gsap.to(title, {x: x * 14, y: y * 10, duration: .7, overwrite: 'auto', ease}));
      activeContext?.add(() => gsap.to(label, {x: x * 6, y: y * 4, duration: .75, overwrite: 'auto', ease}));
      activeContext?.add(() => gsap.to(subtitle, {x: x * 8, y: y * 5, duration: .8, overwrite: 'auto', ease}));
      activeContext?.add(() => gsap.to(shapeOne, {x: x * -32, y: y * -24, rotate: -18 + x * 8, duration: .9, overwrite: 'auto', ease}));
      activeContext?.add(() => gsap.to(shapeTwo, {x: x * 30, y: y * 22, rotate: 22 + x * 7, scale: .75, duration: .9, overwrite: 'auto', ease}));
    });
  };
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    position = null;
    activeContext?.add(() => gsap.to([hero, title, label, subtitle], {x: 0, y: 0, rotateX: 0, rotateY: 0, duration: .8, overwrite: 'auto', ease}));
    activeContext?.add(() => gsap.to(shapeOne, {x: 0, y: 0, rotate: -18, duration: .85, overwrite: 'auto', ease}));
    activeContext?.add(() => gsap.to(shapeTwo, {x: 0, y: 0, rotate: 22, scale: .75, duration: .85, overwrite: 'auto', ease}));
  };
  hero.addEventListener('pointermove', move, {passive: true});
  hero.addEventListener('pointerleave', reset);
  motionCleanups.push(() => {
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', reset);
    if (frame) cancelAnimationFrame(frame);
  });
}

function attachGalleryFocus(gallery, items) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const handlers = [];
  items.forEach(item => {
    const media = item.querySelector('img, video');
    const enter = () => {
      activeContext?.add(() => gsap.to(items, {opacity: .48, scale: .965, filter: 'blur(2px) saturate(.82)', duration: .35, overwrite: 'auto', ease: 'power3.out'}));
      activeContext?.add(() => gsap.to(item, {opacity: 1, scale: 1.075, y: -14, zIndex: 20, filter: 'blur(0px) saturate(1.05)', boxShadow: '0 34px 90px rgba(35,26,20,.18)', duration: .4, overwrite: 'auto', ease: 'power3.out'}));
      if (media) activeContext?.add(() => gsap.to(media, {scale: 1.055, duration: .45, overwrite: 'auto', ease: 'power3.out'}));
    };
    const leave = () => {
      activeContext?.add(() => gsap.to(items, {opacity: 1, scale: 1, y: 0, filter: 'blur(0px) saturate(1)', boxShadow: '0 14px 32px rgba(35,26,20,.07)', duration: .4, overwrite: 'auto', ease: 'power3.out', onComplete: () => items.forEach(el => { el.style.zIndex = ''; })}));
      if (media) activeContext?.add(() => gsap.to(media, {scale: 1, duration: .4, overwrite: 'auto', ease: 'power3.out'}));
    };
    item.addEventListener('pointerenter', enter);
    item.addEventListener('pointerleave', leave);
    handlers.push(() => { item.removeEventListener('pointerenter', enter); item.removeEventListener('pointerleave', leave); });
  });
  motionCleanups.push(() => handlers.forEach(fn => fn()));
}

onMounted(async () => {
  void initBio(currentLanguage);
  void initNewSixPosts(currentLanguage).then(async () => {
    if (disposed) return;
    galleryReady.value = true;
    await nextTick();
    if (allowMotion.value) void setupMotion();
  });
  await setupMotion();
});

watch(allowMotion, () => { void setupMotion(); }, {flush: 'post'});

onUnmounted(() => {
  disposed = true;
  teardownMotion();
});

const animateGallery = () => {
  const gallery = galleryWrapper.value;
  if (!gallery) {
    console.warn("Gallery még nincs renderelve.");
    return;
  }

  const items = gsap.utils.toArray(gallery.querySelectorAll(".gallery-item"));
  if (!items.length) {
    console.warn("Nincsenek gallery itemek.");
    return;
  }

  gsap.set(items, {
    opacity: 0,
    y: 28,
    scale: 0.94,
    filter: "blur(14px)",
    transformOrigin: "50% 60%"
  });

  gsap.to(items, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    duration: 1,
    stagger: 0.08,
    ease: "power4.out",
    scrollTrigger: {
      trigger: gallery,
      start: "top 88%",
      once: true
    },
    onComplete: () => startGalleryFloat(items)
  });

  items.forEach((item) => {
    const media = item.querySelector("img, video");

    item.addEventListener("mouseenter", () => {
      gsap.killTweensOf(items);

      gsap.to(items, {
        opacity: 0.48,
        scale: 0.965,
        filter: "blur(2px) saturate(0.82)",
        duration: 0.55,
        overwrite: "auto",
        ease: "power3.out"
      });

      gsap.to(item, {
        opacity: 1,
        scale: 1.075,
        y: -14,
        zIndex: 20,
        filter: "blur(0px) saturate(1.05)",
        boxShadow: "0 34px 90px rgba(35, 26, 20, 0.18)",
        duration: 0.65,
        overwrite: "auto",
        ease: "power4.out"
      });

      gsap.to(media, {
        scale: 1.055,
        duration: 0.9,
        overwrite: "auto",
        ease: "power4.out"
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(items, {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px) saturate(1)",
        boxShadow: "0 14px 32px rgba(35, 26, 20, 0.07)",
        duration: 0.8,
        overwrite: "auto",
        ease: "power4.out",
        onComplete: () => {
          items.forEach((el) => {
            el.style.zIndex = "";
          });

          startGalleryFloat(items);
        }
      });

      gsap.to(media, {
        scale: 1,
        duration: 0.8,
        overwrite: "auto",
        ease: "power4.out"
      });
    });
  });
};

const startGalleryFloat = (items) => {
  items.forEach((item, index) => {
    gsap.to(item, {
      y: `+=${index % 2 === 0 ? -6 : 6}`,
      rotate: `+=${index % 2 === 0 ? 0.7 : -0.7}`,
      duration: 3.8 + index * 0.25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.12,
      overwrite: false
    });
  });
};

const animateIntro = () => {
  const intro = introWrapper.value;
  if (!intro) return;

  const kicker = intro.querySelector(".intro-kicker");
  const image = intro.querySelector(".profile-image-ring");
  const imageShine = intro.querySelector(".profile-image-ring::after");
  const lines = gsap.utils.toArray(intro.querySelectorAll(".intro-line"));

  const contact = intro.querySelector(".contact-card");
  const contactKicker = intro.querySelector(".contact-kicker");
  const contactTitle = intro.querySelector(".contact-card h3");
  const contactButton = intro.querySelector(".contact-email");

  gsap.set(contact, {
    opacity: 0,
    y: 30,
    filter: "blur(14px)"
  });

  gsap.set([contactKicker, contactTitle, contactButton], {
    opacity: 0,
    y: 26,
    filter: "blur(10px)"
  });

  gsap.set(intro, {
    opacity: 0,
    y: 34,
    scale: 0.985,
    filter: "blur(16px)"
  });

  gsap.set([kicker, image], {
    opacity: 0,
    y: 24,
    filter: "blur(10px)"
  });

  gsap.set(lines, {
    opacity: 0,
    y: 18,
    filter: "blur(8px)"
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top 82%",
      once: true
    }
  });

  tl.to(intro, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    duration: 1.1,
    ease: "power4.out"
  })
      .to(kicker, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.7,
        ease: "power3.out"
      }, "-=0.65")
      .to(image, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        rotate: -1.5,
        duration: 1,
        ease: "power4.out"
      }, "-=0.5")
      .to(lines, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.65")
      .to(contact, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.7,
        ease: "power3.out"
      }, "-=0.35")
      .to([contactKicker, contactTitle, contactButton], {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.09,
        duration: 0.75,
        ease: "power4.out"
      }, "-=0.45");
};

</script>
