<template>
  <div class="toast-container">
    <transition-group name="toast-fade" tag="div">
      <div
          v-for="(toast, index) in toasts"
          :key="toast.id"
          :class="['toast', toast.type]"
          role="alert"
          aria-live="assertive"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";

const toasts = ref([]);

function show(messageText, toastType = "info") {
  const id = Date.now() + Math.random(); // egyedi ID
  const toast = {id, message: messageText, type: toastType};
  toasts.value.push(toast);

  // automatikus eltávolítás
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 4000);
}

onMounted(() => {
  /*window.showToast = show;

  window.addEventListener("show-toast", (e) => {
    const {message: msg, type: t} = e.detail || {};
    if (typeof msg === "string") {
      show(msg, t);
    }
  });*/
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 9999;
}

.toast {
  min-width: 220px;
  max-width: 320px;
  padding: 1rem 1.4rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  pointer-events: none;
  user-select: none;
}

.toast.info {
  background: linear-gradient(135deg, #4687c9, #3d6fa4);
}

.toast.error {
  background: linear-gradient(135deg, #d23b3b, #a83030);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
