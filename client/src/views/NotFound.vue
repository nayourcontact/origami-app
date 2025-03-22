<template>
    <div class="not-found">
      <h1>404</h1>
      <p>{{ t(language, "notFoundMessage") }}</p>
      <RouterLink :to="`/${language}/home`" class="home-btn">
        {{ t(language, "backHome") }}
      </RouterLink>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { t } from "../locales";
  import "../assets/styles/NotFound.css";
  
  const route = useRoute();
  const router = useRouter();
  
  // Nyelv beállítása az URL alapján, de figyelembe vesszük a LocalStorage-t is
  const language = ref(route.params.lang || localStorage.getItem("language") || "hu");
  
  // Figyeljük az útvonalváltozásokat és frissítjük a nyelvi beállítást
  watch(
    () => route.params.lang,
    (newLang) => {
      if (newLang) {
        language.value = newLang;
        localStorage.setItem("language", newLang); // Nyelv mentése localStorage-ba
      }
    }
  );
  </script>
