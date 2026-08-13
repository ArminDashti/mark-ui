<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  description?: string
}>()

const emit = defineEmits<{
  close: []
}>()

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        class="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg"
      >
        <div class="flex flex-col space-y-1.5 p-4">
          <h2 class="text-lg font-semibold leading-none tracking-tight">{{ title }}</h2>
          <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
        </div>
        <div class="p-4 pt-0">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
