<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const reservacion = ref(null)
const cargando = ref(true)
const error = ref(null)
const mostrarModalCancelar = ref(false)
const cancelando = ref(false)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const fechaLegible = computed(() => {
  if (!reservacion.value) return ''
  const [y, m, d] = reservacion.value.fecha.split('T')[0].split('-').map(Number)
  return `${d} de ${MESES[m - 1]}`
})

const horaLegible = computed(() => reservacion.value?.hora?.slice(0, 5) ?? '')

async function cargar() {
  try {
    const respuesta = await api.get(`/reservaciones/${route.params.token}`)
    reservacion.value = respuesta.data
  } catch (e) {
    error.value = 'No se encontró esa reserva.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

function irAReprogramar() {
  router.push({ name: 'reprogramar', params: { token: route.params.token } })
}

async function confirmarCancelacion() {
  cancelando.value = true
  try {
    await api.post(`/reservaciones/${route.params.token}/cancelar`)
    mostrarModalCancelar.value = false
    await cargar() // recarga para reflejar el nuevo estado "cancelada"
  } catch (e) {
    error.value = 'No se pudo cancelar, intenta de nuevo.'
  } finally {
    cancelando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-crema flex items-center justify-center p-6">
    <div class="w-full max-w-sm">
      <p v-if="cargando" class="text-sm text-gris text-center">Cargando...</p>
      <p v-else-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>

      <template v-else>
        <p class="text-xs text-gris mb-4 text-center">Tu reserva</p>

        <div v-if="reservacion.estado === 'cancelada'" class="bg-white rounded-2xl border border-borde p-4 text-center">
          <p class="text-sm text-carbon font-medium">Esta reserva fue cancelada.</p>
        </div>

        <template v-else>
          <div class="flex items-center gap-2 mb-3">
            <span class="w-8 h-8 rounded-full bg-acento flex items-center justify-center text-sm">✓</span>
            <div>
              <p class="text-sm font-medium text-carbon">Reserva confirmada</p>
              <p class="text-xs text-gris">Te esperamos ese día</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-borde p-4 flex flex-col gap-2 text-sm text-carbon mb-4">
            <span>✂️ {{ reservacion.servicio.nombre }}</span>
            <span>📅 {{ fechaLegible }}</span>
            <span>🕐 {{ horaLegible }} hrs</span>
          </div>

          <button
            @click="irAReprogramar"
            class="w-full rounded-xl border border-borde bg-white text-carbon py-3 text-sm font-medium mb-2"
          >
            Reprogramar
          </button>

          <button
            @click="mostrarModalCancelar = true"
            class="w-full text-sm text-red-600 py-2"
          >
            Cancelar reserva
          </button>
        </template>
      </template>
    </div>

    <!-- Modal de confirmación al cancelar -->
    <div
      v-if="mostrarModalCancelar"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl p-6 max-w-xs w-full text-center">
        <div class="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <span class="text-red-600">!</span>
        </div>
        <p class="text-sm font-medium text-carbon mb-1">¿Cancelar tu reserva?</p>
        <p class="text-xs text-gris mb-4">{{ reservacion?.servicio?.nombre }} · {{ fechaLegible }} · {{ horaLegible }} hrs</p>

        <button
          @click="confirmarCancelacion"
          :disabled="cancelando"
          class="w-full rounded-xl bg-red-600 text-white py-3 text-sm font-medium mb-2 disabled:opacity-50"
        >
          {{ cancelando ? 'Cancelando...' : 'Sí, cancelar' }}
        </button>
        <button
          @click="mostrarModalCancelar = false"
          class="w-full rounded-xl border border-borde text-carbon py-3 text-sm font-medium"
        >
          Mantener reserva
        </button>
      </div>
    </div>
  </div>
</template>