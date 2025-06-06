<template>
  <Teleport to="body">
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <template v-if="subscriptionSuccess">
          <h3>{{ t(currentLanguage, 'subscriptionSuccessTitle') }}</h3>
          <p>{{ t(currentLanguage, 'successSubscription') }}</p>
          <div class="modal-buttons">
            <BaseButton
                @click="closeModal"
                icon="fas fa-times"
                size="md"
                variant="primary"
            >
              {{ t(currentLanguage, 'close') }}
            </BaseButton>
          </div>
        </template>

        <template v-else>
          <h3>{{ t(currentLanguage, 'confirmSubscriptionTitle') }}</h3>
          <p>{{ t(currentLanguage, 'confirmSubscriptionMessage') }}</p>
          <input
              type="email"
              :value="email"
              readonly
              class="email-input"
          />
          <input
              v-model="verificationCode"
              type="text"
              maxlength="6"
              :placeholder="t(currentLanguage, 'verificationPlaceholder')"
              class="email-input code-input"
          />
          <p v-if="codeError" class="error-message">{{ codeError }}</p>
          <div class="modal-buttons">
            <BaseButton
                @click="confirmAndSubscribe"
                :loading="loading"
                :disabled="confirmDisabled"
                icon="fas fa-check"
                size="md"
                variant="primary"
            >
              {{ t(currentLanguage, 'confirm') }}
            </BaseButton>
            <BaseButton
                @click="closeModal"
                icon="fas fa-times"
                size="md"
                variant="outline"
            >
              {{ t(currentLanguage, 'cancel') }}
            </BaseButton>
          </div>
        </template>
      </div>

    </div>
  </Teleport>

  <footer class="footer">
    <div class="footer-content">
      <div class="newsletter flex flex-col items-start gap-2">
        <input
            type="email"
            v-model.trim="email"
            :placeholder="t(currentLanguage, 'newsletterPlaceholder')"
            class="email-input"
            :aria-label="t(currentLanguage, 'emailLabel')"
            autocomplete="email"
            @keyup.enter="handleSubscribe"
        />
        <label class="flex items-start gap-3 text-sm w-full max-w-xs">
          <input
              type="checkbox"
              v-model="consentGiven"
              class="mt-[3px]"
              required
          />
          <span class="leading-snug">
            {{ t(currentLanguage, 'consentText') }}
            <a
                href="#"
                @click.prevent="openPrivacyModal"
                class="underline text-blue-600 inline"
            >
              {{ t(currentLanguage, 'privacy') }}
            </a>
          </span>
        </label>
        <BaseButton
            :disabled="loading"
            variant="gradient"
            size="sm"
            :tooltip="t(currentLanguage, 'subscribeTooltip')"
            @click="handleSubscribe"
        >
          <template #icon>
            <i :class="['fas', 'fa-paper-plane', { 'animate-spin': loading }, 'text-white']"></i>
          </template>
          {{ loading ? t(currentLanguage, 'subscribing') : t(currentLanguage, 'subscribe') }}
        </BaseButton>
      </div>
      <div class="social-links">
        <a href="https://www.instagram.com/origamialfredo/" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-instagram social-icon"></i>
        </a>
        <a href="https://www.threads.net/@origamialfredo" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-threads social-icon"></i>
        </a>
        <a href="https://www.facebook.com/alfred.takacs" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-facebook social-icon"></i>
        </a>
      </div>

      <p class="copyright">© 2025 origamialfredo | {{ t(currentLanguage, 'footerText') }}</p>
    </div>
  </footer>
  <PrivacyModal v-model:show="showPrivacy"/>
</template>

<script setup>
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import {t} from "../locales";
import axios from "axios";
import {API_BASE_URL} from "../config.js";
import "@fortawesome/fontawesome-free/css/all.css";
import "../assets/styles/Footer.css";
import PrivacyModal from "../components/PrivacyPolicy.vue";

const route = useRoute();
const currentLanguage = computed(() => route.params.lang || "hu");

const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const loading = ref(false);
const showConfirmModal = ref(false);
const verificationCode = ref("");
const codeError = ref("");
const subscriptionSuccess = ref(false);
const attemptCount = ref(0);
const maxAttempts = 5;
const confirmDisabled = computed(() => attemptCount.value >= maxAttempts || subscriptionSuccess.value);
const showPrivacy = ref(false);
const consentGiven = ref(false);

function openPrivacyModal() {
  showPrivacy.value = true;
}

function mapBackendMessageToKey(message) {
  const map = {
    "Email is required.": "errorEmailRequired",
    "Invalid email format.": "errorInvalidEmail",
    "Verification code sent.": "codeSent",
    "Failed to send verification code.": "errorSendCodeFailed",
    "Email and code are required.": "errorCodeAndEmailRequired",
    "No verification code found for this email.": "errorCodeNotFound",
    "Verification code expired.": "errorCodeExpired",
    "Invalid verification code.": "errorCodeInvalid",
    "Email already subscribed.": "errorAlreadySubscribed",
    "Successfully subscribed!": "successSubscription",
    "Subscription process failed.": "errorSubscription",
  };

  return map[message] || null;
}

const confirmAndSubscribe = async () => {
  await performSubscribe();
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const closeModal = () => {
  if (subscriptionSuccess.value) {
    setTimeout(() => {
      showConfirmModal.value = false;
      verificationCode.value = "";
      codeError.value = "";
      attemptCount.value = 0;
      subscriptionSuccess.value = false;
    }, 300);
  } else {
    showConfirmModal.value = false;
    verificationCode.value = "";
    codeError.value = "";
    attemptCount.value = 0;
    subscriptionSuccess.value = false;
  }
};

const handleSubscribe = async () => {
  if (!consentGiven.value) {
    errorMessage.value = t(currentLanguage.value, "errorConsentRequired");
    window.showToast?.(errorMessage.value, "error");
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";
  codeError.value = "";

  if (!email.value) {
    errorMessage.value = t(currentLanguage.value, "errorEmailRequired");
    window.showToast?.(errorMessage.value, "error");
    return;
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = t(currentLanguage.value, "errorInvalidEmail");
    window.showToast?.(errorMessage.value, "error");
    return;
  }

  try {
    loading.value = true;
    await axios.post(`${API_BASE_URL}/api/newsletter/send-code`, {
      email: email.value,
    });

    showConfirmModal.value = true;
    window.showToast?.(t(currentLanguage.value, "codeSent"), "info");
  } catch (err) {
    errorMessage.value = err.response?.data?.message || t(currentLanguage.value, "errorSubscription");
    window.showToast?.(errorMessage.value, "error");
  } finally {
    loading.value = false;
  }
};

const performSubscribe = async () => {
  if (verificationCode.value.length !== 6) {
    codeError.value = t(currentLanguage.value, "errorCodeRequired");
    window.showToast?.(codeError.value, "error");
    return;
  }

  try {
    loading.value = true;
    const response = await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, {
      email: email.value,
      code: verificationCode.value
    });
    console.log(response);

    subscriptionSuccess.value = true;
    successMessage.value = t(currentLanguage.value, "successSubscription");
    window.showToast?.(successMessage.value, "info");

    verificationCode.value = "";
    attemptCount.value = 0;
  } catch (err) {
    attemptCount.value++;
    const backendMessage = err.response?.data?.message;
    const key = mapBackendMessageToKey(backendMessage);
    const translated = key ? t(currentLanguage.value, key) : backendMessage;

    codeError.value = translated;
    window.showToast?.(translated, "error");
  } finally {
    loading.value = false;
  }
};

</script>
