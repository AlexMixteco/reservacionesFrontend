<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const personal = ref([])
const servicios = ref([])
const cargando = ref(true)

const nuevoNombre = ref('')
const creando = ref(false)

const expandido = reactive({})
const horariosPorPersona = reactive({})
const guardandoServicios = reactive({})

const DIAS = [
  { numero: 0, nombre: 'Domingo' },
  { numero: 1, nombre: 'Lunes' },
  { numero: 2, nombre: 'Martes' },
  { numero: 3, nombre: 'Miércoles' },
  { numero: 4, nombre: 'Jueves' },
  { numero: 5, nombre: 'Viernes' },
  { numero: 6, nombre: 'Sábado' },
]

async function cargar() {
  cargando.value = true
  const [respPersonal, respServicios] = await Promise.all([
    api.get('/admin/personal'),
    api.get('/admin/servicios'),
  ])
  personal.value = respPersonal.data
  servicios.value = respServicios.data
  cargando.value = false
}

onMounted(cargar)

async function crearPersona() {
  if (!nuevoNombre.value.trim()) return
  creando.value = true
  try {
    const respuesta = await api.post('/admin/personal', { nombre: nuevoNombre.value })
    nuevoNombre.value = ''
    await cargar()
    // Abre el panel automático en cuanto se crea, sin que tengas que darle clic a "Editar"
    const nuevaPersona = personal.value.find((p) => p.id === respuesta.data.id)
    if (nuevaPersona) {
      await alternarPanel(nuevaPersona)
    }
  } finally {
    creando.value = false
  }
}

async function alternarActivo(persona) {
  const nuevoValor = !persona.activo
  persona.activo = nuevoValor
  try {
    await api.patch(`/admin/personal/${persona.id}`, { activo: nuevoValor })
  } catch (e) {
    persona.activo = !nuevoValor
  }
}

function tieneServicio(persona, servicioId) {
  return persona.servicios.some((s) => s.id === servicioId)
}

async function alternarServicio(persona, servicioId) {
  const idsActuales = persona.servicios.map((s) => s.id)
  const nuevosIds = idsActuales.includes(servicioId)
    ? idsActuales.filter((id) => id !== servicioId)
    : [...idsActuales, servicioId]

  guardandoServicios[persona.id] = true
  try {
    const respuesta = await api.put(`/admin/personal/${persona.id}/servicios`, {
      servicio_ids: nuevosIds,
    })
    persona.servicios = respuesta.data.servicios
  } finally {
    guardandoServicios[persona.id] = false
  }
}

async function alternarPanel(persona) {
  expandido[persona.id] = !expandido[persona.id]
  if (expandido[persona.id] && !horariosPorPersona[persona.id]) {
    await cargarHorarioPersona(persona.id)
  }
}

async function cargarHorarioPersona(personaId) {
  const dias = reactive(
    Object.fromEntries(DIAS.map((d) => [d.numero, { abierto: false, hora_inicio: '10:00', hora_fin: '20:00', guardando: false }]))
  )
  const respuesta = await api.get(`/admin/personal/${personaId}/horarios`)
  respuesta.data.forEach((h) => {
    dias[h.dia_semana] = {
      abierto: true,
      hora_inicio: h.hora_inicio.slice(0, 5),
      hora_fin: h.hora_fin.slice(0, 5),
      guardando: false,
    }
  })
  horariosPorPersona[personaId] = dias
}

async function guardarHorarioDia(personaId, numeroDia) {
  const d = horariosPorPersona[personaId][numeroDia]
  d.guardando = true
  try {
    await api.put(`/admin/personal/${personaId}/horarios/${numeroDia}`, {
      abierto: d.abierto,
      hora_inicio: d.abierto ? d.hora_inicio : null,
      hora_fin: d.abierto ? d.hora_fin : null,
    })
  } finally {
    d.guardando = false
  }
}

function alternarDia(personaId, numeroDia) {
  horariosPorPersona[personaId][numeroDia].abierto = !horariosPorPersona[personaId][numeroDia].abierto
  guardarHorarioDia(personaId, numeroDia)
}
</script>

<template>
  <div class="min-h-screen bg-crema p-4 md:p-6">
    <div class="max-w-2xl mx-auto">
      <button @click="router.push({ name: 'admin-dashboard' })" class="text-sm text-gris hover:text-carbon mb-4">
        ‹ Volver a reservaciones
      </button>

      <h1 class="text-xl font-semibold text-carbon mb-1">Profesionales</h1>
      <p class="text-sm text-gris mb-6">Quién trabaja en tu negocio, qué servicios da cada quien, y su horario propio.</p>

      <div class="bg-white rounded-2xl border border-borde p-4 mb-6">
        <p class="text-sm font-medium text-carbon mb-3">Agregar profesional</p>
        <div class="flex gap-2">
          <input
            v-model="nuevoNombre"
            type="text"
            placeholder="Nombre"
            class="flex-1 rounded-lg border border-borde bg-white px-3 py-2 text-sm text-carbon placeholder:text-gris"
          />
          <button
            @click="crearPersona"
            :disabled="creando"
            class="rounded-lg bg-carbon text-white px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>

      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
      <p v-else-if="personal.length === 0" class="text-sm text-gris">Todavía no hay profesionales.</p>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="persona in personal"
          :key="persona.id"
          class="bg-white rounded-2xl border border-borde p-4"
          :class="{ 'opacity-50': !persona.activo }"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-carbon">{{ persona.nombre }}</p>
            <div class="flex items-center gap-3">
              <button @click="alternarPanel(persona)" class="text-xs text-gris hover:text-carbon underline">
                {{ expandido[persona.id] ? 'Ocultar' : 'Editar' }}
              </button>
              <button
                @click="alternarActivo(persona)"
                class="text-xs rounded-full px-3 py-1 border"
                :class="persona.activo ? 'border-borde text-gris' : 'border-acento-borde bg-acento text-carbon'"
              >
                {{ persona.activo ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>

          <div v-if="expandido[persona.id]" class="mt-4 pt-4 border-t border-borde flex flex-col gap-4">
            <div>
              <p class="text-xs text-gris mb-2">Servicios que ofrece</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in servicios"
                  :key="s.id"
                  @click="alternarServicio(persona, s.id)"
                  :disabled="guardandoServicios[persona.id]"
                  class="text-xs rounded-full px-3 py-1.5 border"
                  :class="tieneServicio(persona, s.id)
                    ? 'bg-acento border-acento-borde text-carbon'
                    : 'bg-white border-borde text-gris'"
                >
                  {{ s.nombre }}
                </button>
              </div>
            </div>

            <div v-if="horariosPorPersona[persona.id]">
              <p class="text-xs text-gris mb-2">Horario propio (si no defines uno, usa el del negocio)</p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="d in DIAS"
                  :key="d.numero"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 py-1"
                >
                  <div class="flex items-center gap-3">
                    <button
                      @click="alternarDia(persona.id, d.numero)"
                      class="w-10 h-6 rounded-full relative shrink-0"
                      :class="horariosPorPersona[persona.id][d.numero].abierto ? 'bg-carbon' : 'bg-borde'"
                    >
                      <span
                        class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                        :class="horariosPorPersona[persona.id][d.numero].abierto ? 'left-4.5' : 'left-0.5'"
                      ></span>
                    </button>
                    <span class="text-sm text-carbon w-24 shrink-0">{{ d.nombre }}</span>
                  </div>
                  <div v-if="horariosPorPersona[persona.id][d.numero].abierto" class="flex items-center gap-2">
                    <input
                      v-model="horariosPorPersona[persona.id][d.numero].hora_inicio"
                      @change="guardarHorarioDia(persona.id, d.numero)"
                      type="time"
                      class="rounded-lg border border-borde bg-white px-2 py-1 text-sm text-carbon"
                    />
                    <span class="text-sm text-gris">a</span>
                    <input
                      v-model="horariosPorPersona[persona.id][d.numero].hora_fin"
                      @change="guardarHorarioDia(persona.id, d.numero)"
                      type="time"
                      class="rounded-lg border border-borde bg-white px-2 py-1 text-sm text-carbon"
                    />
                  </div>
                  <span v-else class="text-sm text-gris">Usa el horario general</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>