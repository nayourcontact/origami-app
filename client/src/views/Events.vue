<template>
  <main ref="page" class="events-page" aria-labelledby="events-title">

    <section ref="hero" class="events-hero events-panel">
      <div class="events-hero-copy">
        <span class="events-kicker">
          {{ currentLanguage === "en" ? "Events · Workshops · Exhibitions" : "Események · Workshopok · Kiállítások" }}
        </span>

        <h1 id="events-title">
          {{ currentLanguage === "en" ? "Events" : "Események" }}
        </h1>

        <p>
          {{
            currentLanguage === "en"
                ? "Discover upcoming origami workshops, family-friendly programs and past exhibitions shaped around the quiet poetry of paper."
                : "Fedezd fel a közelgő origami workshopokat, családbarát programokat és korábbi kiállításokat, amelyek a papír csendes költészetére épülnek."
          }}
        </p>
      </div>

      <div class="events-hero-art" aria-hidden="true">
        <span class="event-fold fold-large"></span>
        <span class="event-fold fold-small"></span>
        <span class="event-fold fold-line"></span>
      </div>
    </section>

    <nav class="events-filters" :aria-label="currentLanguage === 'en' ? 'Event filters' : 'Esemény szűrők'">
      <button :class="{ active: filter === 'all' }" @click="setFilter('all')">
        {{ currentLanguage === "en" ? "All" : "Összes" }}
      </button>

      <button :class="{ active: filter === 'upcoming' }" @click="setFilter('upcoming')">
        {{ currentLanguage === "en" ? "Upcoming" : "Közelgő" }}
      </button>

      <button :class="{ active: filter === 'past' }" @click="setFilter('past')">
        {{ currentLanguage === "en" ? "Past" : "Elmúlt" }}
      </button>
    </nav>

    <section ref="list" class="events-list" aria-live="polite">
      <article
          v-for="(event, index) in filteredEvents"
          :key="event._id"
          :class="['event-card', isUpcoming(event.eventDate) ? 'upcoming-card' : 'past-card']"
          :style="{ '--event-index': index }"
          @click="openModal(event)"
      >
        <div class="event-cover-wrap">
          <img
              v-if="event.coverImageUrl"
              :src="event.coverImageUrl"
              :alt="event.title"
              class="event-cover"
              loading="lazy"
              decoding="async"
          />
          <div v-else class="event-cover-placeholder" aria-hidden="true">
            <span></span>
          </div>
        </div>

        <div class="event-card-content">
          <div class="event-card-topline">
            <span class="event-status" :class="isUpcoming(event.eventDate) ? 'upcoming' : 'past'">
              {{ statusLabel(event.eventDate) }}
            </span>
            <span class="event-number">{{ String(index + 1).padStart(2, "0") }}</span>
          </div>

          <h2>{{ event.title }}</h2>

          <div class="event-meta">
            <span>{{ formatDate(event.eventDate) }}</span>
            <span>{{ event.location }}</span>
          </div>

          <p v-if="isUpcoming(event.eventDate) && event.ticketPrice" class="event-price">
            {{ currentLanguage === "en" ? "Ticket" : "Jegy" }} · {{ event.ticketPrice }}
          </p>

          <button
              class="event-more-button"
              @click.stop="openModal(event)"
          >
            <span>{{ currentLanguage === "en" ? "View details" : "Részletek" }}</span>
          </button>
        </div>
      </article>
    </section>

    <Teleport to="body">

      <div
          v-if="selectedGalleryItem"
          class="gallery-lightbox"
          @click.self="closeGalleryItem"
      >
        <button
            class="gallery-lightbox-close"
            @click="closeGalleryItem"
        >
          ×
        </button>

        <img
            v-if="selectedGalleryItem.type === 'image'"
            :src="selectedGalleryItem.url"
            alt="Gallery image"
        />

        <video
            v-else-if="selectedGalleryItem.type === 'video'"
            :src="selectedGalleryItem.url"
            controls
            autoplay
        ></video>
      </div>

      <div v-if="selectedEvent" ref="modalOverlay" class="event-modal-overlay" @click.self="closeModal">
        <article ref="modal" class="event-modal" role="dialog" aria-modal="true" :aria-label="selectedEvent.title">
          <button class="event-modal-close"
                  :aria-label="currentLanguage === 'en' ? 'Close event details' : 'Esemény részleteinek bezárása'"
                  @click="closeModal">×
          </button>

          <div class="event-modal-media">
            <img
                v-if="selectedEvent.coverImageUrl"
                :src="selectedEvent.coverImageUrl"
                :alt="selectedEvent.title"
                class="event-modal-cover"
            />
            <div v-else class="event-modal-cover-placeholder" aria-hidden="true"></div>
          </div>

          <div class="event-modal-body">
            <span class="event-status" :class="isUpcoming(selectedEvent.eventDate) ? 'upcoming' : 'past'">
              {{ statusLabel(selectedEvent.eventDate) }}
            </span>

            <h2>{{ selectedEvent.title }}</h2>

            <div class="event-modal-meta">
              <p><strong>{{ currentLanguage === "en" ? "Date" : "Dátum" }}</strong>
                {{ formatDate(selectedEvent.eventDate) }}</p>
              <p><strong>{{ currentLanguage === "en" ? "Location" : "Helyszín" }}</strong> {{ selectedEvent.location }}
              </p>
              <p v-if="isUpcoming(selectedEvent.eventDate) && selectedEvent.ticketPrice">
                <strong>{{ currentLanguage === "en" ? "Ticket" : "Jegy" }}</strong> {{ selectedEvent.ticketPrice }}
              </p>
            </div>

            <div class="event-description">
              <template
                  v-for="(block, index) in parsedDescription"
                  :key="index"
              >
                <!-- Sima szöveg -->
                <p
                    v-if="block.type === 'text'"
                    class="event-description-text"
                >
                  {{ block.content }}
                </p>

                <!-- Embedelt HTML, pl. YouTube iframe -->
                <div
                    v-else-if="block.type === 'html'"
                    class="event-description-embed"
                    v-html="block.content"
                ></div>

                <!-- Link -->
                <div
                    v-else-if="block.type === 'link'"
                    class="event-description-link-wrapper"
                >
                  <!-- OG preview, ha van -->
                  <a
                      v-if="linkPreviews[block.url]"
                      :href="block.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="link-preview-card"
                  >
                    <img
                        v-if="linkPreviews[block.url].image"
                        :src="linkPreviews[block.url].image"
                        :alt="linkPreviews[block.url].title || ''"
                        class="link-preview-image"
                    />

                    <div class="link-preview-content">
          <span class="link-preview-domain">
            {{ linkPreviews[block.url].siteName || getDomain(block.url) }}
          </span>

                      <strong v-if="linkPreviews[block.url].title">
                        {{ linkPreviews[block.url].title }}
                      </strong>

                      <p v-if="linkPreviews[block.url].description">
                        {{ linkPreviews[block.url].description }}
                      </p>

                      <span class="link-preview-url">
            {{ block.url }}
          </span>
                    </div>
                  </a>

                  <!-- Ha nincs OG adat -->
                  <a
                      v-else
                      :href="block.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="event-plain-link"
                  >
                    {{ block.url }}
                  </a>
                </div>
              </template>
            </div>

            <div v-if="selectedEvent.gallery?.length" class="event-gallery">
              <h3>{{ currentLanguage === "en" ? "Gallery" : "Galéria" }}</h3>

              <div class="event-gallery-grid">
                <figure
                    v-for="item in selectedEvent.gallery"
                    :key="item.url"
                    class="event-gallery-item"
                    @click="openGalleryItem(item)"
                >
                  <img
                      v-if="item.type === 'image'"
                      :src="item.url"
                      :alt="currentLanguage === 'en' ? 'Event gallery image' : 'Esemény galéria kép'"
                      loading="lazy"
                      decoding="async"
                  />

                  <video
                      v-else-if="item.type === 'video'"
                      :src="item.url"
                      controls
                  ></video>
                </figure>
              </div>
            </div>
          </div>
        </article>
      </div>
    </Teleport>

    <p v-if="!loading && !filteredEvents.length" class="events-empty">
      {{ currentLanguage === "en" ? "No events to display yet." : "Nincs megjeleníthető esemény." }}
    </p>
  </main>
</template>

<script>
import api from "../axios.js";
import {API_BASE_URL} from "../config.js";
import "../assets/styles/Events.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {t} from "../locales.js";

gsap.registerPlugin(ScrollTrigger);

export default {
  name: "Events",

  data() {
    return {
      events: [],
      loading: false,
      filter: "all",
      selectedEvent: null,
      currentLanguage: this.$route?.params?.lang || "hu",
      selectedGalleryItem: null,

      linkPreviews: {}
    };
  },

  computed: {
    filteredEvents() {
      return this.events.filter((event) => {
        if (this.filter === "upcoming") {
          return this.isUpcoming(event.eventDate);
        }

        if (this.filter === "past") {
          return !this.isUpcoming(event.eventDate);
        }

        return true;
      });
    },

    parsedDescription() {
      if (!this.selectedEvent?.description) {
        return [];
      }

      return this.parseDescription(
          this.selectedEvent.description
      );
    }
  },

  async mounted() {
    await this.fetchEvents();
    await this.$nextTick();
    this.animateEventsPage();
  },

  beforeUnmount() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    document.body.style.overflow = "";
  },

  methods: {
    t,

    loadDescriptionPreviews(description) {
      const blocks = this.parseDescription(description);

      blocks
          .filter(block => block.type === "link")
          .forEach(block => {
            this.loadLinkPreview(block.url);
          });
    },

    async loadLinkPreview(url) {
      if (!url) return;

      if (
          Object.prototype.hasOwnProperty.call(
              this.linkPreviews,
              url
          )
      ) {
        return;
      }

      this.linkPreviews[url] = undefined;

      try {
        const res = await api.get(
            `${API_BASE_URL}/api/link-preview`,
            {
              params: {
                url
              }
            }
        );

        if (res.status === 204) {
          this.linkPreviews[url] = null;
          return;
        }

        if (!res.data) {
          this.linkPreviews[url] = null;
          return;
        }

        if (
            !res.data.title &&
            !res.data.description &&
            !res.data.image
        ) {
          this.linkPreviews[url] = null;
          return;
        }
        this.linkPreviews[url] = res.data;
      } catch (error) {
        console.error(
            "[LinkPreview] request hiba:",
            url,
            error.response?.status,
            error.response?.data,
            error
        );

        this.linkPreviews[url] = null;
      }
    },

    decodeHtml(html) {
      if (!html) return "";

      const textarea = document.createElement("textarea");
      textarea.innerHTML = html;

      return textarea.value;
    },

    parseDescription(description) {
      if (!description) return [];

      const decoded = this.decodeHtml(description);

      const blocks = [];

      // iframe-ek és URL-ek felismerése
      const tokenRegex =
          /(<iframe[\s\S]*?<\/iframe>)|(https?:\/\/[^\s<]+)/gi;

      let lastIndex = 0;
      let match;

      while ((match = tokenRegex.exec(decoded)) !== null) {

        // Token előtti sima szöveg
        if (match.index > lastIndex) {
          const text = decoded
              .slice(lastIndex, match.index)
              .trim();

          if (text) {
            blocks.push({
              type: "text",
              content: text
            });
          }
        }

        const value = match[0];

        if (value.toLowerCase().startsWith("<iframe")) {
          blocks.push({
            type: "html",
            content: value
          });
        } else {
          // Mondatvégi írásjelek levágása az URL-ről
          const url = value.replace(/[.,;!?]+$/, "");

          blocks.push({
            type: "link",
            url
          });

        }

        lastIndex = tokenRegex.lastIndex;
      }

      // Utolsó token utáni szöveg
      if (lastIndex < decoded.length) {
        const text = decoded
            .slice(lastIndex)
            .trim();

        if (text) {
          blocks.push({
            type: "text",
            content: text
          });
        }
      }

      return blocks;
    },

    getDomain(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    },

    openGalleryItem(item) {
      this.selectedGalleryItem = item;
    },

    closeGalleryItem() {
      this.selectedGalleryItem = null;
    },

    setFilter(value) {
      this.filter = value;
      this.$nextTick(() => this.animateEventCards(true));
    },

    animateEventsPage() {
      const hero = this.$refs.hero;
      if (!hero) {
        console.error("[Events] hero ref missing");
        return;
      }

      const heroTitle = hero.querySelector("h1");
      const heroKicker = hero.querySelector(".events-kicker");
      const heroText = hero.querySelector("p");
      const folds = hero.querySelectorAll(".event-fold");

      gsap.set(hero, {
        autoAlpha: 0,
        y: 26,
        scale: 0.985,
        filter: "blur(18px)",
        transformPerspective: 1200,
        transformOrigin: "50% 50%"
      });

      gsap.set([heroKicker, heroTitle, heroText], {
        autoAlpha: 0,
        y: 24,
        filter: "blur(10px)"
      });

      gsap.set(folds, {
        opacity: 0,
        scale: 0.55,
        rotate: -28,
        transformOrigin: "50% 50%"
      });

      gsap.set(".events-filters button", {
        autoAlpha: 0,
        y: 18,
        filter: "blur(8px)"
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });

      tl.to(hero, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.15,
        ease: "power4.out"
      })
          .to(heroKicker, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            letterSpacing: "0.28em",
            duration: 0.75,
            ease: "power3.out"
          }, "-=0.7")
          .to(heroTitle, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            rotateX: 0,
            duration: 1,
            ease: "power4.out"
          }, "-=0.55")
          .to(heroText, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "power3.out"
          }, "-=0.55")
          .to(folds, {
            opacity: 0.75,
            scale: 1,
            rotate: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "back.out(1.8)"
          }, "-=0.55")
          .to(".events-filters button", {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.08,
            duration: 0.7,
            ease: "power3.out"
          }, "-=0.35");

      tl.eventCallback("onComplete", () => {
        this.animateEventCards();

        this.bindHeroParallax(hero);

        this.bindCardHover(
            this.$refs.list?.querySelectorAll(".event-card") || []
        );
      });
    },

    animateEventCards(isFilterChange = false) {
      const list = this.$refs.list;
      const cards = gsap.utils.toArray(list?.querySelectorAll(".event-card") || []);
      if (!cards.length) return;

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger === list) trigger.kill();
      });

      gsap.killTweensOf(cards);

      gsap.set(cards, {
        autoAlpha: 0,
        y: 30,
        scale: 0.985,
        filter: "blur(16px)",
        transformOrigin: "50% 60%"
      });

      const tl = gsap.timeline({
        scrollTrigger: isFilterChange ? null : {
          trigger: list,
          start: "top 82%",
          once: true
        }
      });

      tl.to(cards, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: isFilterChange ? 0.65 : 0.95,
        stagger: 0.09,
        ease: "power4.out",
        onComplete: () => {
          this.bindCardHover(cards);
        }
      });
    },

    bindHeroParallax(hero) {
      if (hero.dataset.motionBound === "true") return;
      hero.dataset.motionBound = "true";

      const title = hero.querySelector("h1");
      const kicker = hero.querySelector(".events-kicker");
      const subtitle = hero.querySelector("p");
      const foldLarge = hero.querySelector(".fold-large");
      const foldSmall = hero.querySelector(".fold-small");
      const foldLine = hero.querySelector(".fold-line");

      const resetHero = () => {
        gsap.to(hero, {
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 1.25,
          ease: "elastic.out(1, 0.45)"
        });

        gsap.to(title, {
          x: 0,
          y: 0,
          duration: 1.15,
          ease: "power4.out"
        });

        gsap.to([kicker, subtitle], {
          x: 0,
          y: 0,
          duration: 1.1,
          ease: "power4.out"
        });

        gsap.to(foldLarge, {
          x: 0,
          y: 0,
          rotate: 0,
          duration: 1.35,
          ease: "elastic.out(1, 0.5)"
        });

        gsap.to(foldSmall, {
          x: 0,
          y: 0,
          rotate: 0,
          duration: 1.35,
          ease: "elastic.out(1, 0.5)"
        });

        gsap.to(foldLine, {
          x: 0,
          y: 0,
          rotate: 45,
          duration: 1.35,
          ease: "elastic.out(1, 0.5)"
        });
      };

      const handleMouseMove = (e) => {
        const rect = hero.getBoundingClientRect();

        const x = gsap.utils.clamp(
            -0.5,
            0.5,
            (e.clientX - rect.left) / rect.width - 0.5
        );

        const y = gsap.utils.clamp(
            -0.5,
            0.5,
            (e.clientY - rect.top) / rect.height - 0.5
        );

        gsap.to(hero, {
          x: x * 3,
          y: y * 2,
          rotateX: y * -4,
          rotateY: x * 5,
          duration: 0.65,
          overwrite: "auto",
          ease: "power3.out"
        });

        gsap.to(title, {
          x: x * 14,
          y: y * 10,
          duration: 0.7,
          overwrite: "auto",
          ease: "power3.out"
        });

        gsap.to(kicker, {
          x: x * 6,
          y: y * 4,
          duration: 0.75,
          overwrite: "auto",
          ease: "power3.out"
        });

        gsap.to(subtitle, {
          x: x * 8,
          y: y * 5,
          duration: 0.8,
          overwrite: "auto",
          ease: "power3.out"
        });

        gsap.to(foldLarge, {
          x: x * -32,
          y: y * -24,
          rotate: x * 8,
          duration: 0.9,
          overwrite: "auto",
          ease: "power3.out"
        });

        gsap.to(foldSmall, {
          x: x * 30,
          y: y * 22,
          rotate: x * 7,
          duration: 0.9,
          overwrite: "auto",
          ease: "power3.out"
        });

        gsap.to(foldLine, {
          x: x * -18,
          y: y * 16,
          rotate: 45 + x * 6,
          duration: 0.9,
          overwrite: "auto",
          ease: "power3.out"
        });
      };

      hero.addEventListener("mousemove", handleMouseMove);
      hero.addEventListener("mouseleave", resetHero);
    },

    bindCardHover(cards) {
      cards.forEach((card) => {
        if (card.dataset.motionBound === "true") return;
        card.dataset.motionBound = "true";

        const media = card.querySelector(".event-cover");
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -6,
            scale: 1.012,
            duration: 0.5,
            ease: "power4.out",
            overwrite: "auto"
          });

          if (media) {
            gsap.to(media, {
              scale: 1.045,
              duration: 0.85,
              ease: "power4.out",
              overwrite: "auto"
            });
          }
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {y: 0, scale: 1, duration: 0.75, ease: "power4.out", overwrite: "auto"});
          if (media) gsap.to(media, {scale: 1, duration: 0.75, ease: "power4.out", overwrite: "auto"});
        });
      });
    },

    animateModalIn() {
      gsap.fromTo(this.$refs.modalOverlay,
          {autoAlpha: 0},
          {autoAlpha: 1, duration: 0.28, ease: "power2.out"}
      );

      gsap.fromTo(this.$refs.modal,
          {autoAlpha: 0, y: 44, scale: 0.96, filter: "blur(18px)"},
          {autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.75, ease: "power4.out"}
      );
    },

    async fetchEvents() {
      this.loading = true;

      try {
        const res = await api.get(`${API_BASE_URL}/api/events`);
        this.events = Array.isArray(res.data)
            ? [...res.data].sort(
                (a, b) => new Date(b.eventDate) - new Date(a.eventDate)
            )
            : [];
      } catch (err) {
        console.error("[Events] Események betöltése sikertelen:", err);
        this.events = [];
      } finally {
        this.loading = false;
      }
    },

    isUpcoming(date) {
      return new Date(date) >= new Date();
    },

    statusLabel(date) {
      const upcoming = this.isUpcoming(date);
      if (this.currentLanguage === "en") return upcoming ? "Upcoming" : "Past";
      return upcoming ? "Közelgő" : "Elmúlt";
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      if (isNaN(date)) return this.currentLanguage === "en" ? "Invalid date" : "Érvénytelen dátum";

      return date.toLocaleString(this.currentLanguage === "en" ? "en-US" : "hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    openModal(event) {
      this.selectedEvent = event;

      this.$nextTick(() => {
        this.loadDescriptionPreviews(event.description);
      });
    },

    closeModal() {
      this.selectedEvent = null;
      this.selectedGalleryItem = null;
      document.body.style.overflow = "";
    },
  },
};
</script>
