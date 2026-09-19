<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasoLayout from '../components/PasoLayout.vue'
import { useReservaStore } from '../stores/reserva'
import api from '../services/api'

const router = useRouter()
const store = useReservaStore()

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const hoy = new Date()
const mesActual = ref(hoy.getMonth())
const anioActual = ref(hoy.getFullYear())
const diaSeleccionado = ref(null)
const diasAbiertos = ref([])
const fechasBloqueadas = ref([])

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
  if (mesActual.value === 0) {
    mesActual.value = 11
    anioActual.value -= 1
  } else {
    mesActual.value -= 1
  }
}

function mesSiguiente() {
  if (mesActual.value === 11) {
    mesActual.value = 0
    anioActual.value += 1
  } else {
    mesActual.value += 1
  }
}

function esDeshabilitado(fecha) {
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  if (fecha < inicioHoy) return true

  const diaSemana = fecha.getDay() // 0=domingo...6=sábado, igual que el backend
  if (!diasAbiertos.value.includes(diaSemana)) return true

  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  const iso = `${y}-${m}-${d}`
  if (fechasBloqueadas.value.includes(iso)) return true

  return false
}

async function cargarDisponibilidad() {
  try {
    const respuesta = await api.get(`/negocios/${store.negocioId}/dias-disponibles`)
    diasAbiertos.value = respuesta.data.dias_abiertos
    fechasBloqueadas.value = respuesta.data.fechas_bloqueadas
  } catch (e) {
    // Si falla, no bloqueamos nada — mejor dejar elegir de más que trabar el flujo
  }
}

onMounted(cargarDisponibilidad)

function esSeleccionado(fecha) {
  return diaSeleccionado.value &&
    fecha.toDateString() === diaSeleccionado.value.toDateString()
}

function elegirDia(fecha) {
  if (esPasado(fecha)) return
  diaSeleccionado.value = fecha
}

const textoSeleccionado = computed(() => {
  if (!diaSeleccionado.value) return ''
  const dia = diaSeleccionado.value
  const diasSemanaCompletos = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  return `${diasSemanaCompletos[dia.getDay()]} ${dia.getDate()} de ${MESES[dia.getMonth()].toLowerCase()}`
})

function continuar() {
  if (!diaSeleccionado.value) return
  const y = diaSeleccionado.value.getFullYear()
  const m = String(diaSeleccionado.value.getMonth() + 1).padStart(2, '0')
  const d = String(diaSeleccionado.value.getDate()).padStart(2, '0')
  store.seleccionarDia(`${y}-${m}-${d}`)
  router.push({ name: 'hora' })
}
</script>

<template>
  <PasoLayout :paso="2" :total="4">
    <h1 class="text-xl font-semibold text-carbon mb-4">Elige un día</h1>

    <div class="bg-white rounded-2xl border border-borde p-4">
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

    <button
      v-if="diaSeleccionado"
      class="w-full mt-4 flex items-center gap-2 rounded-xl border border-acento-borde bg-acento px-4 py-3 text-sm text-carbon"
    >
      📅 {{ textoSeleccionado }}
    </button>

    <button
      @click="continuar"
      :disabled="!diaSeleccionado"
      class="w-full mt-3 rounded-xl bg-carbon text-white py-3 text-sm font-medium disabled:opacity-40"
    >
      Continuar
    </button>
  </PasoLayout>
</template>