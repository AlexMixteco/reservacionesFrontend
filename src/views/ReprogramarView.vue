<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const reservacion = ref(null)
const cargando = ref(true)
const error = ref(null)
const enviando = ref(false)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const hoy = new Date()
const mesActual = ref(hoy.getMonth())
const anioActual = ref(hoy.getFullYear())
const diaSeleccionado = ref(null)
const horaSeleccionada = ref(null)
const horarios = ref([])
const cargandoHorarios = ref(false)

const nombreMes = computed(() => `${MESES[mesActual.value]} ${anioActual.value}`)

const diasDelMes = computed(() => {
  const primerDia = new Date(anioActual.value, mesActual.value, 1)
  const offset = (primerDia.getDay() + 6) % 7
  const totalDias = new Date(anioActual.value, mesActual.value + 1, 0).getDate()
  const celdas = Array(offset).fill(null)
  for (let dia = 1; dia <= totalDias; dia++) {
    celdas.push(new Date(anioActual.value, mesActual.value, dia))
  }
  return celdas
})

function mesAnterior() {
  if (mesActual.value === 0) { mesActual.value = 11; anioActual.value -= 1 }
  else mesActual.value -= 1
}
function mesSiguiente() {
  if (mesActual.value === 11) { mesActual.value = 0; anioActual.value += 1 }
  else mesActual.value += 1
}
function esDeshabilitado(fecha) {
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return fecha < inicioHoy
}
function esSeleccionado(fecha) {
  return diaSeleccionado.value && fecha.toDateString() === diaSeleccionado.value.toDateString()
}

function fechaISO(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function elegirDia(fecha) {
  if (esDeshabilitado(fecha)) return
  diaSeleccionado.value = fecha
  horaSeleccionada.value = null
  cargandoHorarios.value = true
  try {
    const respuesta = await api.get(`/negocios/${reservacion.value.negocio_id}/disponibilidad`, {
      params: { servicio_id: reservacion.value.servicio_id, fecha: fechaISO(fecha) },
    })
    horarios.value = respuesta.data.horarios_disponibles
  } finally {
    cargandoHorarios.value = false
  }
}

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

async function guardar() {
  if (!diaSeleccionado.value || !horaSeleccionada.value) return
  enviando.value = true
  error.value = null
  try {
    await api.put(`/reservaciones/${route.params.token}/reprogramar`, {
      fecha: fechaISO(diaSeleccionado.value),
      hora: horaSeleccionada.value,
    })
    router.push({ name: 'gestion', params: { token: route.params.token } })
  } catch (e) {
    error.value = e.response?.data?.errors?.hora?.[0] ?? 'No se pudo reprogramar, intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-crema flex flex-col items-center p-6">
    <div class="w-full max-w-sm">
      <button @click="router.back()" class="text-carbon text-lg mb-2" aria-label="Regresar">‹</button>

      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
      <p v-else-if="error && !reservacion" class="text-sm text-red-600">{{ error }}</p>

      <template v-else-if="reservacion">
        <h1 class="text-xl font-semibold text-carbon mb-1">Reprogramar</h1>
        <p class="text-sm text-gris mb-4">{{ reservacion.servicio.nombre }}</p>

        <div class="bg-white rounded-2xl border border-borde p-4 mb-3">
          <div class="flex items-center justify-between mb-3">
            <button @click="mesAnterior" class="p-1 text-gris hover:text-carbon">‹</button>
            <span class="text-sm font-medium text-carbon">{{ nombreMes }}</span>
            <button @click="mesSiguiente" class="p-1 text-gris hover:text-carbon">›</button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-xs text-gris mb-1">
            <span v-for="(d, i) in DIAS_SEMANA" :key="i">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <template v-for="(fecha, i) in diasDelMes" :key="i">
              <button
                v-if="fecha"
                @click="elegirDia(fecha)"
                :disabled="esDeshabilitado(fecha)"
                class="aspect-square text-sm rounded-full flex items-center justify-center"
                :class="[
                  esDeshabilitado(fecha) ? 'text-borde cursor-not-allowed' : 'text-carbon hover:bg-acento',
                  esSeleccionado(fecha) ? 'bg-carbon text-white hover:bg-carbon' : '',
                ]"
              >
                {{ fecha.getDate() }}
              </button>
              <span v-else></span>
            </template>
          </div>
        </div>

        <div v-if="diaSeleccionado" class="mb-3">
          <p v-if="cargandoHorarios" class="text-sm text-gris">Cargando horarios...</p>
          <p v-else-if="horarios.length === 0" class="text-sm text-gris">No hay horarios disponibles ese día.</p>
          <div v-else class="grid grid-cols-3 gap-2">
            <button
              v-for="hora in horarios"
              :key="hora"
              @click="horaSeleccionada = hora"
              class="rounded-xl border py-3 text-sm text-center"
              :class="horaSeleccionada === hora
                ? 'bg-carbon text-white border-carbon'
                : 'bg-white text-carbon border-borde hover:border-gris'"
            >
              {{ hora }}
            </button>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

        <button
          @click="guardar"
          :disabled="!diaSeleccionado || !horaSeleccionada || enviando"
          class="w-full rounded-xl bg-carbon text-white py-3 text-sm font-medium disabled:opacity-40"
        >
          {{ enviando ? 'Guardando...' : 'Guardar nuevo horario' }}
        </button>
      </template>
    </div>
  </div>
</template>