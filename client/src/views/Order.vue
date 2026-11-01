<template>
  <section ref="headingSection" class="bio-section">
    <h2 class="bio-heading">{{ t(currentLanguage, 'order') }}</h2>
  </section>

  <section class="order-section">
    <div ref="formWrapper" class="order-form-wrapper">
      <form @submit.prevent="submitOrder(consentGiven.value)" class="order-form">
        <label>
          <div class="label-row">
            {{ t(currentLanguage, 'name') }} <span class="required-star">*</span>
          </div>
          <input id="name" v-model="name" type="text" required/>
        </label>

        <label>
          <div class="label-row">
            {{ t(currentLanguage, 'email') }} <span class="required-star">*</span>
          </div>
          <input id="email" v-model="email" type="email" required/>
        </label>

        <label>
          <div class="label-row">
            {{ t(currentLanguage, 'details') }} <span class="required-star">*</span>
          </div>
          <textarea id="details" v-model="details" required></textarea>
        </label>

        <label>
          {{ t(currentLanguage, 'notes') }}
          <textarea id="notes" v-model="notes" placeholder="Pl.: kék papír..."></textarea>
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p
            v-if="successMessage"
            class="success-message"
            v-show="successMessage"
            ref="successRef"
        >
          {{ successMessage }}
        </p>

        <label class="checkbox-label">
          <input type="checkbox" v-model="consentGiven" class="checkbox-input"/>
          <span>
            {{ t(currentLanguage, 'orderConsentText') }}
            <a
                href="#"
                @click.prevent="openPrivacyModal"
                class="privacy-link"
            >
              {{ t(currentLanguage, 'privacy') }}
            </a>
          </span>
        </label>

        <button type="submit" class="submit-button">
          {{ t(currentLanguage, 'submitOrder') }}
        </button>
      </form>
    </div>
  </section>
  <PrivacyModal v-model:show="showPrivacy"/>
</template>

<script setup>
import {t} from "../locales";
import useOrderForm from "../composables/Order.js";
import {useRoute} from "vue-router";
import {computed, onMounted, onUnmounted, watch, nextTick, ref} from "vue";
import gsap from "gsap";
import {allowMotion} from "../composables/performance.js";
import PrivacyModal from "../components/PrivacyPolicy.vue";

const route = useRoute();
const currentLanguage = computed(() => route.params.lang || "hu");
const successRef = ref(null);
const headingSection = ref(null);
const formWrapper = ref(null);
const showPrivacy = ref(false);

const {
  name,
  email,
  details,
  notes,
  errorMessage,
  successMessage,
  submitOrder,
  invalidFields,
  consentGiven
} = useOrderForm(currentLanguage);

function openPrivacyModal() {
  showPrivacy.value = true;
}

let entrance = null;
const activeTweens = new Set();
function cleanupMotion() {
  entrance?.kill();entrance = null;
  for (const tween of activeTweens) tween.kill();
  activeTweens.clear();
  const els = [headingSection.value, formWrapper.value, successRef.value].filter(Boolean);
  if (els.length) {gsap.killTweensOf(els);gsap.set(els, {clearProps: 'transform,opacity,visibility'});}
  formWrapper.value?.querySelectorAll('input,textarea').forEach(el => {
    gsap.killTweensOf(el);gsap.set(el, {clearProps: 'transform'});
  });
}
function startMotion() {
  cleanupMotion();
  if (!allowMotion.value || !headingSection.value || !formWrapper.value) return;
  entrance = gsap.timeline({defaults: {duration: .5, ease: 'power3.out'}})
    .fromTo(headingSection.value, {opacity: .5, y: 30}, {opacity: 1, y: 0, clearProps: 'transform,opacity'})
    .fromTo(formWrapper.value, {opacity: .5, y: 30}, {opacity: 1, y: 0, clearProps: 'transform,opacity'}, '-=.3');
}
onMounted(startMotion);
onUnmounted(cleanupMotion);
watch(allowMotion, () => nextTick(startMotion), {flush: 'post'});

watch(successMessage, async (msg) => {
  if (msg && allowMotion.value) {
    await nextTick();
    if (!allowMotion.value || !successRef.value) return;
    activeTweens.add(gsap.fromTo(
        successRef.value,
        {opacity: 0, scale: 0.9},
        {opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)", clearProps: 'transform,opacity'}
    ));
  }
});

watch(errorMessage, async (val) => {
  if (val && allowMotion.value && invalidFields.value.length) {
    await nextTick();
    invalidFields.value.forEach((field) => {
      const el = document.querySelector(`#${field}`);
      if (el) {
        activeTweens.add(gsap.fromTo(el, {x: -5}, {x: 5, duration: 0.1, yoyo: true, repeat: 3, clearProps: 'transform'}));
      }
    });
  }
});
</script>

<style scoped>
@import "../assets/styles/Order.css";
</style>
