<template>
  <nav class="navbar">
    <h1 class="logo">    <img src="../assets/images/logo.png" class="bio-image"  alt="logo"/>
    </h1>
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
          variant="gradient"
          size="sm"
          icon="fas fa-envelope"
          tooltip="alfred.takacs92@gmail.com"
          @click="() => openExternal('mailto:alfred.takacs92@gmail.com')"
      />

      <BaseButton
          variant="gradient"
          size="sm"
          icon="fab fa-instagram"
          tooltip="Instagram"
          @click="() => openExternal('https://www.instagram.com/origamialfredo/')"
      />

      <BaseButton
          variant="gradient"
          size="sm"
          icon="fab fa-threads"
          tooltip="Threads"
          @click="() => openExternal('https://www.threads.net/@origamialfredo')"
      />

      <BaseButton
          variant="gradient"
          size="sm"
          icon="fab fa-facebook"
          tooltip="Facebook"
          @click="() => openExternal('https://www.facebook.com/alfred.takacs')"
      />

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
import {computed, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {t} from "../locales";
import "@fortawesome/fontawesome-free/css/all.css";
import "../assets/styles/Navbar.css";

const route = useRoute();
const router = useRouter();

const storedLanguage = localStorage.getItem("language");
const language = computed(() => route.params.lang || storedLanguage || "hu");

const openExternal = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const navLinks = [
  {path: "/home", label: "", icon: "fas fa-home", tooltip: "homeTooltip"},
  {path: "/gallery", label: "", icon: "fas fa-images", tooltip: "galleryTooltip"},
  {path: "/events", label: "", icon: "fas fa-calendar-days", tooltip: "eventsTooltip"},

  /*{path: "/tutorial", label: "", icon: "fas fa-book-open", tooltip: "tutorialTooltip"},*/
/*
  {path: "/order", label: "", icon: "fas fa-shopping-cart", tooltip: "orderTooltip"},
*/
];

const handleNavigation = (path) => {
  const targetPath = `/${language.value}${path.startsWith("/") ? path : "/" + path}`;
  if (router.currentRoute.value.path !== targetPath) {
    router.push(targetPath);
  } else {
    // workaround: force re-render
    router.replace("/__refresh").then(() => {
      router.replace(targetPath);
    });
  }
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
