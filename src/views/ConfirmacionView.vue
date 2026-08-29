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
const copiado = ref(false)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const fechaLegible = computed(() => {
  if (!reservacion.value) return ''
  const [y, m, d] = reservacion.value.fecha.split('T')[0].split('-').map(Number)
  return `${d} de ${MESES[m - 1]}`
})

const horaLegible = computed(() => {
  if (!reservacion.value) return ''
  return reservacion.value.hora.slice(0, 5)
})

// El enlace que el CLIENTE necesita guardar para poder gestionar su propia reserva
const enlaceGestion = computed(() => `${window.location.origin}/reserva/${route.params.token}`)

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

async function copiarEnlace() {
  await navigator.clipboard.writeText(enlaceGestion.value)
  copiado.value = true
  setTimeout(() => (copiado.value = false), 2000)
}

const puedeCompartir = typeof navigator.share === 'function'

async function compartirEnlace() {
  try {
    await navigator.share({
      title: 'Tu reserva en Zierra',
      text: `Reserva de ${reservacion.value.servicio.nombre} el ${fechaLegible.value} a las ${horaLegible.value} hrs`,
      url: enlaceGestion.value,
    })
  } catch (e) {
    // El usuario cerró el menú de compartir sin elegir nada — no es un error real, no hacemos nada.
  }
}

function abrirWhatsApp() {
  const numero = reservacion.value.negocio.telefono_whatsapp
  const mensaje = encodeURIComponent(
    `Hola, tengo una reserva de ${reservacion.value.servicio.nombre} el ${fechaLegible.value} a las ${horaLegible.value} hrs.\nPara cancelar o reprogramar: ${enlaceGestion.value}`
  )
  window.location.href = `https://api.whatsapp.com/send?phone=${numero}&text=${mensaje}`
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
        <p class="text-sm text-gris mb-6">Guarda tu enlace de gestión — lo vas a necesitar para cancelar o cambiar tu reserva.</p>

        <div class="bg-white rounded-2xl border border-borde p-4 flex flex-col gap-2 text-left text-sm text-carbon mb-4">
          <span>✂️ {{ reservacion.servicio.nombre }}</span>
          <span>📅 {{ fechaLegible }}</span>
          <span>🕐 {{ horaLegible }} hrs</span>
          <span>📍 {{ reservacion.negocio.nombre }}<template v-if="reservacion.negocio.direccion">, {{ reservacion.negocio.direccion }}</template></span>
        </div>

        <div class="bg-acento border border-acento-borde rounded-xl p-3 mb-4 text-left">
          <p class="text-xs text-carbon mb-2">Tu enlace para gestionar la reserva:</p>
          <div class="flex items-center gap-2 mb-2">
            <span class="flex-1 text-xs text-carbon truncate">{{ enlaceGestion }}</span>
          </div>
          <button
            v-if="puedeCompartir"
            @click="compartirEnlace"
            class="w-full rounded-lg bg-carbon text-white py-2 text-xs font-medium"
          >
            📤 Compartir enlace
          </button>
          <button
            v-else
            @click="copiarEnlace"
            class="w-full rounded-lg border border-acento-borde bg-white text-carbon py-2 text-xs font-medium"
          >
            {{ copiado ? 'Copiado ✓' : 'Copiar enlace' }}
          </button>
        </div>

        <button
          @click="abrirWhatsApp"
          class="w-full rounded-xl bg-acento border border-acento-borde text-carbon py-3 text-sm font-medium mb-3"
        >
          Avisar por WhatsApp
        </button>

        <button
          @click="router.push({ name: 'gestion', params: { token: route.params.token } })"
          class="w-full rounded-xl border border-borde bg-white text-carbon py-3 text-sm font-medium"
        >
          Ver o cancelar mi reserva
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