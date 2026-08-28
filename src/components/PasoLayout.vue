<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  paso: { type: Number, required: true },
  total: { type: Number, default: 4 },
})

const router = useRouter()
const progreso = () => (props.paso / props.total) * 100
</script>

<template>
  <div class="min-h-screen bg-crema flex flex-col items-center p-6">
    <div class="w-full max-w-sm">
      <div class="flex items-center justify-between mb-4">
        <button @click="router.back()" class="text-carbon text-lg" aria-label="Regresar">‹</button>
        <span class="text-xs text-gris">{{ paso }} de {{ total }}</span>
      </div>

      <div class="h-0.5 w-full bg-borde rounded-full mb-6">
        <div class="h-0.5 bg-carbon rounded-full transition-all" :style="{ width: progreso() + '%' }"></div>
      </div>

      <slot />
    </div>
  </div>
</template>