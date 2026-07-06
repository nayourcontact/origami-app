<template>
  <div class="button-container">
    <button
        ref="buttonRef"
        class="base-button"
        :class="[
        variantClass,
        sizeClass,
        { 'full-width': fullWidth }
    ]"
        :disabled="disabled || loading"
        @click="handleClick"
        @mouseenter="handleMouseEnter(); showTooltip = true"
        @mouseleave="handleMouseLeave(); showTooltip = false"
        @focus="handleMouseEnter(); showTooltip = true"
        @blur="handleMouseLeave(); showTooltip = false"
    >
      <span class="button-fold button-fold-left" aria-hidden="true"></span>
      <span class="button-fold button-fold-right" aria-hidden="true"></span>

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
        [
          "primary",
          "secondary",
          "outline",
          "gradient",
          "footer-icon",
          "footer-pill"
        ].includes(value),
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
  buttonRef,
  icon,
  fullWidth,
  disabled,
  tooltip,
  loading,
  showTooltip,
  translatedTooltip,
  variantClass,
  sizeClass,
  handleClick,
  handleMouseEnter,
  handleMouseLeave,
} = useBaseButton(props, emit);
</script>
