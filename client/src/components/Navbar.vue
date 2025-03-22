<template>
  <nav class="navbar">
    <h1 class="logo">@origamialfredo</h1>
    <div class="menu">
      <BaseButton
          v-for="(link, index) in navLinks"
          :key="index"
          variant="gradient"
          size="sm"
          :icon="link.icon"
          :tooltip="t(language, link.tooltip)"
          @click="handleNavigation(link.path)"
      >
        <template v-if="link.label">
          {{ t(language, link.label) }}
        </template>
      </BaseButton>

      <BaseButton
          variant="outline"
          size="sm"
          icon="fas fa-globe"
          :tooltip="t(language, 'toggleLanguage')"
          class="lang-btn"
          @click="toggleLanguage"
      >
        {{ language === 'hu' ? 'EN' : 'HU' }}
      </BaseButton>
    </div>
  </nav>
</template>

<script setup>
import {ref, computed, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {t} from "../locales";
import BaseButton from "../components/BaseButton.vue";
import "@fortawesome/fontawesome-free/css/all.css";
import "../assets/styles/Navbar.css";

const route = useRoute();
const router = useRouter();

const storedLanguage = localStorage.getItem("language");
const language = computed(() => route.params.lang || storedLanguage || "hu");

const navLinks = [
  {path: "/home", label: "", icon: "fas fa-home", tooltip: "homeTooltip"},
  {path: "/gallery", label: "", icon: "fas fa-images", tooltip: "galleryTooltip"},
  {path: "/tutorial", label: "", icon: "fas fa-book-open", tooltip: "tutorialTooltip"},
  {path: "/order", label: "", icon: "fas fa-shopping-cart", tooltip: "orderTooltip"},
];

const handleNavigation = (path) => {
  router.push(`/${language.value}${path}`);
};

const toggleLanguage = () => {
  const newLang = language.value === "hu" ? "en" : "hu";
  localStorage.setItem("language", newLang);

  router.push({
    path: `/${newLang}${route.path.replace(/^\/(hu|en)/, "")}`,
    query: route.query,
  });
};

onMounted(() => {
  if (!route.params.lang) {
    router.replace({path: `/${language.value}${route.fullPath}`});
  }
});
</script>
