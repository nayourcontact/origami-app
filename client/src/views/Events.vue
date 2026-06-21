<template>
  <div class="events-page">
<!--    <section class="events-hero">
      <p class="events-kicker">Origami Alfredo</p>
      <h1>Események</h1>
      <p>
        Workshopok, bemutatók és közösségi origami alkalmak egy helyen.
      </p>
    </section>-->
    <section ref="viewWrapper" class="bio-section">
      <!--<h2 class="bio-heading">{{ bio.split('\n')[0] }}</h2>-->
      <h2 class="bio-heading">
        Események
      </h2>
      <p>
        Workshopok, bemutatók és közösségi origami alkalmak egy helyen.
      </p>
    </section>

    <div class="events-filters">
      <button :class="{ active: filter === 'all' }" @click="filter = 'all'">
        Összes
      </button>
      <button :class="{ active: filter === 'upcoming' }" @click="filter = 'upcoming'">
        Upcoming
      </button>
      <button :class="{ active: filter === 'past' }" @click="filter = 'past'">
        Elmúlt
      </button>
    </div>

    <section class="events-list">
      <article
          v-for="event in filteredEvents"
          :key="event._id"
          class="event-card"
      >
        <div class="event-cover-wrap">
          <img
              v-if="event.coverImageUrl"
              :src="event.coverImageUrl"
              :alt="event.title"
              class="event-cover"
          />
          <div v-else class="event-cover-placeholder">
            📅
          </div>
        </div>

        <div class="event-card-content">
          <div class="event-status" :class="isUpcoming(event.eventDate) ? 'upcoming' : 'past'">
            {{ isUpcoming(event.eventDate) ? "Upcoming" : "Elmúlt" }}
          </div>

          <h2>{{ event.title }}</h2>

          <div class="event-meta">
            <span>🗓️ {{ formatDate(event.eventDate) }}</span>
            <span>📍 {{ event.location }}</span>
          </div>

          <p v-if="isUpcoming(event.eventDate) && event.ticketPrice" class="event-price">
            🎟️ {{ event.ticketPrice }}
          </p>

          <button class="event-more-button" @click="openModal(event)">
            Több infó
          </button>
        </div>
      </article>
    </section>

    <div v-if="selectedEvent" class="event-modal-overlay" @click.self="closeModal">
      <div class="event-modal">
        <button class="event-modal-close" @click="closeModal">×</button>

        <img
            v-if="selectedEvent.coverImageUrl"
            :src="selectedEvent.coverImageUrl"
            :alt="selectedEvent.title"
            class="event-modal-cover"
        />

        <div class="event-modal-body">
          <span class="event-status" :class="isUpcoming(selectedEvent.eventDate) ? 'upcoming' : 'past'">
            {{ isUpcoming(selectedEvent.eventDate) ? "Upcoming" : "Elmúlt" }}
          </span>

          <h2>{{ selectedEvent.title }}</h2>

          <div class="event-modal-meta">
            <p>🗓️ {{ formatDate(selectedEvent.eventDate) }}</p>
            <p>📍 {{ selectedEvent.location }}</p>
            <p v-if="isUpcoming(selectedEvent.eventDate) && selectedEvent.ticketPrice">
              🎟️ {{ selectedEvent.ticketPrice }}
            </p>
          </div>

          <p class="event-description">
            {{ selectedEvent.description }}
          </p>

          <div v-if="selectedEvent.gallery?.length" class="event-gallery">
            <h3>Galéria</h3>

            <div class="event-gallery-grid">
              <div
                  v-for="item in selectedEvent.gallery"
                  :key="item.url"
                  class="event-gallery-item"
              >
                <img
                    v-if="item.type === 'image'"
                    :src="item.url"
                    alt="Esemény galéria kép"
                />

                <video
                    v-else-if="item.type === 'video'"
                    :src="item.url"
                    controls
                ></video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!loading && !filteredEvents.length" class="events-empty">
      Nincs megjeleníthető esemény.
    </p>
  </div>
</template>

<script>
import api from "../axios.js";
import { API_BASE_URL } from "../config.js";
import "../assets/styles/Events.css";
import {t} from "../locales.js";

export default {
  name: "Events",

  data() {
    return {
      events: [],
      loading: false,
      filter: "all",
      selectedEvent: null,
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
  },

  mounted() {
    this.fetchEvents();
  },

  methods: {
    t,
    async fetchEvents() {
      this.loading = true;

      try {
        const res = await api.get(`${API_BASE_URL}/api/admin/events`);
        this.events = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Események betöltése sikertelen:", err);
        this.events = [];
      } finally {
        this.loading = false;
      }
    },

    isUpcoming(date) {
      return new Date(date) >= new Date();
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);

      if (isNaN(date)) {
        return "Érvénytelen dátum";
      }

      return date.toLocaleString("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    openModal(event) {
      this.selectedEvent = event;
      document.body.style.overflow = "hidden";
    },

    closeModal() {
      this.selectedEvent = null;
      document.body.style.overflow = "";
    },
  },
};
</script>