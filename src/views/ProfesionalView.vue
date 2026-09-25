<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasoLayout from '../components/PasoLayout.vue'
import api from '../services/api'
import { useReservaStore } from '../stores/reserva'

const router = useRouter()
const store = useReservaStore()

const profesionales = ref([])
const cargando = ref(true)
const error = ref(null)

onMounted(async () => {
  if (!store.servicio) {
    router.replace({ name: 'servicio' })
    return
  }

  try {
    const respuesta = await api.get(`/negocios/${store.negocioId}/personal`, {
      params: { servicio_id: store.servicio.id },
    })
    profesionales.value = respuesta.data
  } catch (e) {
    error.value = 'No se pudieron cargar los profesionales.'
  } finally {
    cargando.value = false
  }
})

function elegir(persona) {
  store.seleccionarPersonal(persona)
  router.push({ name: 'dia' })
}
</script>

<template>
  <PasoLayout :paso="2" :total="5">
    <h1 class="text-xl font-semibold text-carbon mb-4">¿Con quién?</h1>

    <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="profesionales.length === 0" class="text-sm text-gris">
      No hay profesionales disponibles para este servicio todavía.
    </p>

    <div v-else class="flex flex-col gap-2">
      <button
        v-for="persona in profesionales"
        :key="persona.id"
        @click="elegir(persona)"
        class="w-full flex items-center gap-3 rounded-2xl border p-4 text-left"
        :class="store.personal?.id === persona.id
          ? 'bg-acento border-acento-borde'
          : 'bg-white border-borde hover:border-gris'"
      >
        <span class="w-9 h-9 rounded-full bg-crema flex items-center justify-center text-sm text-carbon">
          {{ persona.nombre.charAt(0).toUpperCase() }}
        </span>
        <span class="text-sm text-carbon">{{ persona.nombre }}</span>
      </button>
    </div>
  </PasoLayout>
</template>