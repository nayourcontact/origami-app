<template>
  <div class="button-container">
    <button
        :class="[
        'base-button',
        variantClass,
        sizeClass,
        { 'full-width': fullWidth },
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      ]"
        :disabled="disabled || loading"
        @click="handleClick"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        :aria-describedby="tooltip ? 'tooltip' : null"
    >
      <template v-if="loading">
        <i class="fas fa-spinner fa-spin button-icon" aria-hidden="true"></i>
      </template>
      <template v-else>
        <slot name="icon">
          <i v-if="icon" :class="['button-icon', icon]" aria-hidden="true"></i>
        </slot>
      </template>

      <slot/>
    </button>

    <transition name="fade">
      <div
          v-if="showTooltip && tooltip"
          :id="'tooltip'"
          role="tooltip"
          class="tooltip"
      >
        {{ translatedTooltip }}
        <span class="tooltip-arrow"></span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import "../assets/styles/BaseButton.css";
import {useBaseButton} from "../composables/BaseButton.js";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: value =>
        ["primary", "secondary", "outline", "gradient"].includes(value),
  },
  size: {
    type: String,
    default: "sm",
    validator: value => ["sm", "md", "lg"].includes(value),
  },
  icon: {type: String, default: ""},
  fullWidth: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  tooltip: {type: String, default: ""},
  loading: {type: Boolean, default: false},
});

const emit = defineEmits(["click"]);

const {
  icon,
  fullWidth,
  disabled,
  tooltip,
  loading,
  showTooltip,
  hasLabel,
  translatedTooltip,
  variantClass,
  sizeClass,
  handleClick,
} = useBaseButton(props, emit);
</script>
