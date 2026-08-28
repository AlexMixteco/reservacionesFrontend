<script setup>
defineProps({
  nombre: { type: String, required: true },
  duracion: { type: String, required: true },
  precio: { type: String, required: true },
  icono: { type: String, default: '✂️' },
  seleccionado: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    @click="$emit('click')"
    class="w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors"
    :class="seleccionado
      ? 'bg-acento border-acento-borde'
      : 'bg-white border-borde hover:border-gris'"
  >
    <span class="text-2xl">{{ icono }}</span>

    <span class="flex-1">
      <span class="block text-sm font-medium text-carbon">{{ nombre }}</span>
      <span class="block text-xs text-gris">{{ duracion }} · {{ precio }}</span>
    </span>

    <span
      class="w-5 h-5 rounded-full border flex items-center justify-center"
      :class="seleccionado ? 'bg-carbon border-carbon' : 'border-borde'"
    >
      <svg v-if="seleccionado" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-3 h-3">
        <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clip-rule="evenodd" />
      </svg>
    </span>
  </button>
</template>