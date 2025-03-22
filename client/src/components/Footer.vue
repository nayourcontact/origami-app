<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="newsletter">
        <input type="email" :placeholder="t(currentLanguage, 'newsletterPlaceholder')" class="email-input" />
        <button class="subscribe-btn">{{ t(currentLanguage, 'subscribe') }}</button>
      </div>

      <div class="social-links">
        <a href="https://www.instagram.com/origamialfredo/" target="_blank">
          <i class="fab fa-instagram social-icon"></i>
        </a>
        <a href="https://www.threads.net/@origamialfredo" target="_blank">
          <i class="fab fa-threads social-icon"></i>
        </a>
      </div>

      <p class="copyright">© 2025 origamialfredo | {{ t(currentLanguage, 'footerText') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { t } from "../locales";
import "@fortawesome/fontawesome-free/css/all.css";
import "../assets/styles/Footer.css";

const route = useRoute();
const currentLanguage = computed(() => route.params.lang || "hu");
</script>
