<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useReservaStore } from '../stores/reserva'

const route = useRoute()
const router = useRouter()
const store = useReservaStore()

const reservacion = ref(null)
const cargando = ref(true)
const error = ref(null)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// El backend manda fecha como ISO completo ("2026-08-28T00:00:00...Z") y
// hora como "10:00:00" — aquí los volvemos legibles para mostrar y para el mensaje.
const fechaLegible = computed(() => {
  if (!reservacion.value) return ''
  const [y, m, d] = reservacion.value.fecha.split('T')[0].split('-').map(Number)
  return `${d} de ${MESES[m - 1]}`
})

const horaLegible = computed(() => {
  if (!reservacion.value) return ''
  return reservacion.value.hora.slice(0, 5) // "10:00:00" → "10:00"
})

onMounted(async () => {
  try {
    const respuesta = await api.get(`/reservaciones/${route.params.token}`)
    reservacion.value = respuesta.data
  } catch (e) {
    error.value = 'No se encontró esa reserva.'
  } finally {
    cargando.value = false
  }
})

function volverAlInicio() {
  store.reiniciar()
  router.push({ name: 'servicio' })
}

function abrirWhatsApp() {
  const numero = reservacion.value.negocio.telefono_whatsapp
  const mensaje = encodeURIComponent(
    `Hola, tengo una reserva de ${reservacion.value.servicio.nombre} el ${fechaLegible.value} a las ${horaLegible.value} hrs.`
  )
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-crema flex items-center justify-center p-6">
    <div class="w-full max-w-sm text-center">
      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <template v-else>
        <div class="w-16 h-16 rounded-full bg-carbon text-white text-2xl flex items-center justify-center mx-auto mb-4">
          ✓
        </div>

        <h1 class="text-xl font-semibold text-carbon mb-1">¡Listo! Tu reserva está confirmada 🎉</h1>
        <p class="text-sm text-gris mb-6">Te acabamos de enviar los detalles por WhatsApp.</p>

        <div class="bg-white rounded-2xl border border-borde p-4 flex flex-col gap-2 text-left text-sm text-carbon">
          <span>✂️ {{ reservacion.servicio.nombre }}</span>
          <span>📅 {{ fechaLegible }}</span>
          <span>🕐 {{ horaLegible }} hrs</span>
          <span>📍 {{ reservacion.negocio.nombre }}<template v-if="reservacion.negocio.direccion">, {{ reservacion.negocio.direccion }}</template></span>
        </div>

        <button
          @click="abrirWhatsApp"
          class="w-full mt-4 rounded-xl bg-acento border border-acento-borde text-carbon py-3 text-sm font-medium"
        >
          Abrir en WhatsApp
        </button>

        <button
          @click="volverAlInicio"
          class="w-full mt-3 text-sm text-gris"
        >
          Volver al inicio
        </button>
      </template>
    </div>
  </div>
</template>