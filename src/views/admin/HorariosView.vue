<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const DIAS = [
  { numero: 0, nombre: 'Domingo' },
  { numero: 1, nombre: 'Lunes' },
  { numero: 2, nombre: 'Martes' },
  { numero: 3, nombre: 'Miércoles' },
  { numero: 4, nombre: 'Jueves' },
  { numero: 5, nombre: 'Viernes' },
  { numero: 6, nombre: 'Sábado' },
]

// Estado local por día: { abierto, hora_inicio, hora_fin, guardando }
const dias = reactive(
  Object.fromEntries(DIAS.map((d) => [d.numero, { abierto: false, hora_inicio: '10:00', hora_fin: '20:00', guardando: false }]))
)

const cargandoHorarios = ref(true)
const bloqueos = ref([])
const cargandoBloqueos = ref(true)

const nuevoBloqueo = reactive({ fecha: '', motivo: '' })
const creandoBloqueo = ref(false)

onMounted(async () => {
  try {
    const respuesta = await api.get('/admin/horarios')
    respuesta.data.forEach((h) => {
      dias[h.dia_semana] = {
        abierto: true,
        hora_inicio: h.hora_inicio.slice(0, 5),
        hora_fin: h.hora_fin.slice(0, 5),
        guardando: false,
      }
    })
  } finally {
    cargandoHorarios.value = false
  }

  await cargarBloqueos()
})

async function cargarBloqueos() {
  cargandoBloqueos.value = true
  try {
    const respuesta = await api.get('/admin/bloqueos')
    bloqueos.value = respuesta.data
  } finally {
    cargandoBloqueos.value = false
  }
}

async function guardarDia(numeroDia) {
  const d = dias[numeroDia]
  d.guardando = true
  try {
    await api.put(`/admin/horarios/${numeroDia}`, {
      abierto: d.abierto,
      hora_inicio: d.abierto ? d.hora_inicio : null,
      hora_fin: d.abierto ? d.hora_fin : null,
    })
  } finally {
    d.guardando = false
  }
}

function alternarDia(numeroDia) {
  dias[numeroDia].abierto = !dias[numeroDia].abierto
  guardarDia(numeroDia)
}

async function crearBloqueo() {
  if (!nuevoBloqueo.fecha) return
  creandoBloqueo.value = true
  try {
    await api.post('/admin/bloqueos', {
      fecha: nuevoBloqueo.fecha,
      motivo: nuevoBloqueo.motivo || null,
    })
    nuevoBloqueo.fecha = ''
    nuevoBloqueo.motivo = ''
    await cargarBloqueos()
  } finally {
    creandoBloqueo.value = false
  }
}

async function eliminarBloqueo(id) {
  await api.delete(`/admin/bloqueos/${id}`)
  await cargarBloqueos()
}
</script>

<template>
  <div class="min-h-screen bg-crema p-4 md:p-6">
    <div class="max-w-2xl mx-auto">
      <button @click="router.push({ name: 'admin-dashboard' })" class="text-sm text-gris hover:text-carbon mb-4">
        ‹ Volver a reservaciones
      </button>

      <h1 class="text-xl font-semibold text-carbon mb-1">Horarios y disponibilidad</h1>
      <p class="text-sm text-gris mb-6">Define cuándo atiende tu negocio, y bloquea fechas específicas.</p>

      <!-- Horarios semanales -->
      <div class="bg-white rounded-2xl border border-borde p-4 mb-6">
        <p class="text-sm font-medium text-carbon mb-3">Horario semanal</p>
        <p v-if="cargandoHorarios" class="text-sm text-gris">Cargando...</p>
        <div v-else class="flex flex-col gap-2">
          <div v-for="d in DIAS" :key="d.numero" class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-2 border-b border-borde last:border-0 sm:border-0">
            <div class="flex items-center gap-3">
              <button
                @click="alternarDia(d.numero)"
                class="w-10 h-6 rounded-full relative shrink-0"
                :class="dias[d.numero].abierto ? 'bg-carbon' : 'bg-borde'"
              >
                <span
                  class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  :class="dias[d.numero].abierto ? 'left-4.5' : 'left-0.5'"
                ></span>
              </button>
              <span class="text-sm text-carbon w-24 shrink-0">{{ d.nombre }}</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <template v-if="dias[d.numero].abierto">
                <input
                  v-model="dias[d.numero].hora_inicio"
                  @change="guardarDia(d.numero)"
                  type="time"
                  class="rounded-lg border border-borde bg-white px-2 py-1 text-sm text-carbon"
                />
                <span class="text-sm text-gris">a</span>
                <input
                  v-model="dias[d.numero].hora_fin"
                  @change="guardarDia(d.numero)"
                  type="time"
                  class="rounded-lg border border-borde bg-white px-2 py-1 text-sm text-carbon"
                />
                <span v-if="dias[d.numero].guardando" class="text-xs text-gris">Guardando...</span>
              </template>
              <span v-else class="text-sm text-gris">Cerrado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bloqueos -->
      <div class="bg-white rounded-2xl border border-borde p-4">
        <p class="text-sm font-medium text-carbon mb-3">Bloquear una fecha (festivo, vacaciones)</p>

        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            v-model="nuevoBloqueo.fecha"
            type="date"
            class="rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon"
          />
          <input
            v-model="nuevoBloqueo.motivo"
            type="text"
            placeholder="Motivo (opcional)"
            class="flex-1 rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris"
          />
          <button
            @click="crearBloqueo"
            :disabled="creandoBloqueo || !nuevoBloqueo.fecha"
            class="rounded-lg bg-carbon text-white px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Bloquear
          </button>
        </div>

        <p v-if="cargandoBloqueos" class="text-sm text-gris">Cargando...</p>
        <p v-else-if="bloqueos.length === 0" class="text-sm text-gris">No hay fechas bloqueadas.</p>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="b in bloqueos"
            :key="b.id"
            class="flex items-center justify-between bg-crema rounded-lg px-3 py-2"
          >
            <div>
              <span class="text-sm text-carbon">{{ b.fecha.split('T')[0] }}</span>
              <span v-if="b.motivo" class="text-sm text-gris"> · {{ b.motivo }}</span>
            </div>
            <button @click="eliminarBloqueo(b.id)" class="text-xs text-red-600">Quitar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>