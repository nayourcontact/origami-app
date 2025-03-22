<template>
  <div class="button-container">
    <button
        :class="['base-button', variantClass, sizeClass, { 'full-width': fullWidth }]"
        :disabled="disabled"
        @click="handleClick"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
    >
      <i v-if="icon" :class="['button-icon', icon]"></i>
      <slot v-if="hasLabel"></slot>
    </button>

    <transition name="fade">
      <div v-if="showTooltip && tooltip" class="tooltip">
        {{ translatedTooltip }}
        <span class="tooltip-arrow"></span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {computed, defineProps, defineEmits, ref} from "vue";
import {t} from "../locales";
import {useRoute} from "vue-router";

const props = defineProps({
  variant: {type: String, default: "primary"},
  size: {type: String, default: "sm"},
  icon: {type: String, default: ""},
  fullWidth: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  tooltip: {type: String, default: ""},
});

const emit = defineEmits(["click"]);
const showTooltip = ref(false);
const route = useRoute();
const currentLanguage = computed(() => route.params.lang || "hu");
const hasLabel = computed(() => !!props.tooltip || !!props.icon);
const handleClick = () => {
  if (!props.disabled) emit("click");
};
const translatedTooltip = computed(() => props.tooltip ? t(currentLanguage.value, props.tooltip) : "");

const variantClass = computed(() => ({
  primary: "bg-transparent text-gray-800 hover:bg-gray-200",
  secondary: "bg-transparent text-gray-900 hover:bg-gray-300",
  outline: "bg-transparent text-gray-700 border border-transparent hover:bg-gray-400 hover:text-white",
  gradient: "bg-transparent text-gray-900 hover:bg-gray-200",
}[props.variant] || "text-gray-800 hover:bg-gray-200"));

const sizeClass = computed(() => ({
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
}[props.size] || "px-4 py-2 text-base"));
</script>

<style scoped>
.button-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 40px;
}

.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 16px;
  padding: 10px;
  background: transparent;
  border: none;
}

.full-width {
  width: 100%;
}

.base-button:hover {
  background: rgba(200, 200, 200, 0.3);
}

.button-icon {
  font-size: 20px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(6px);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  min-width: 90px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out, transform 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.button-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(8px);
}

.tooltip-arrow {
  content: "";
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.9);
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>