<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { t } from '../locales'
import BaseButton from '../components/BaseButton.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show'])

const closeModal = () => {
  emit('update:show', false)
}

const route = useRoute()
const lang = computed(() => route.params.lang || 'hu')
const content = computed(() => t(lang.value, 'privacyPolicyContent'))

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
        v-if="show"
        class="modal-overlay"
        @click="closeModal"
    >
      <div
          class="modal privacy-modal"
          role="dialog"
          aria-modal="true"
          @click.stop
      >
        <h3>{{ t(lang, 'privacy') }}</h3>

        <div class="modal-content">
          <p v-for="(block, index) in content" :key="index" v-html="block" />
        </div>

        <div class="modal-buttons">
          <BaseButton
              @click="closeModal"
              variant="primary"
              size="sm"
          >
            {{ t(lang, 'close') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
  width: 100%;
}

.privacy-modal {
  max-width: 650px;
  width: 100%;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 650px;
  margin: 3rem auto;
  box-sizing: border-box;
}

.modal-content p,
.modal-content ul {
  padding-left: 1rem;
  padding-right: 1rem;
}

.modal-content ul {
  list-style: disc;
  margin-left: 2rem;
}
</style>