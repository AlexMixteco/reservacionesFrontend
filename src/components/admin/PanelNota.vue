<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  guardando: { type: Boolean, default: false },
  guardado: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'guardar'])
</script>

<template>
  <div>
    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      rows="2"
      placeholder="Nota interna sobre esta reservación (no la ve el cliente)..."
      class="w-full rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris"
    ></textarea>
    <div class="flex items-center gap-3 mt-2">
      <button
        @click="$emit('guardar')"
        class="rounded-lg bg-carbon text-white px-3 py-1.5 text-xs font-medium"
      >
        Guardar nota
      </button>
      <span v-if="guardando" class="text-xs text-gris">Guardando...</span>
      <span v-else-if="guardado" class="text-xs text-green-700">Guardado ✓</span>
    </div>
  </div>
</template>