<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import PanelNota from '../../components/admin/PanelNota.vue'

const router = useRouter()
const auth = useAuthStore()

const reservaciones = ref([])
const cargando = ref(true)
const error = ref(null)

const ESTILO_ESTADO = {
  pendiente: 'bg-acento text-carbon',
  confirmada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-700',
}

const expandido = reactive({})
const estadoGuardado = reactive({})

onMounted(async () => {
  try {
    const respuesta = await api.get('/admin/reservaciones')
    reservaciones.value = respuesta.data
    // Las que ya tienen nota se muestran abiertas desde el inicio, sin tener que darles clic.
    reservaciones.value.forEach((r) => {
      expandido[r.id] = !!r.notas_admin
    })
  } catch (e) {
    error.value = 'No se pudieron cargar las reservaciones.'
  } finally {
    cargando.value = false
  }
})

function alternarNotas(id) {
  expandido[id] = !expandido[id]
}

async function guardarNota(reservacion) {
  estadoGuardado[reservacion.id] = 'guardando'
  try {
    await api.patch(`/admin/reservaciones/${reservacion.id}/nota`, {
      notas_admin: reservacion.notas_admin,
    })
    estadoGuardado[reservacion.id] = 'guardado'
    setTimeout(() => {
      if (estadoGuardado[reservacion.id] === 'guardado') estadoGuardado[reservacion.id] = null
    }, 2000)
  } catch (e) {
    estadoGuardado[reservacion.id] = null
  }
}

async function cerrarSesion() {
  await auth.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="min-h-screen bg-crema p-4 md:p-6">
    <div class="max-w-3xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 class="text-xl font-semibold text-carbon">Reservaciones</h1>
          <p class="text-sm text-gris">{{ auth.usuario?.nombre }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button @click="router.push({ name: 'admin-servicios' })" class="text-sm text-gris hover:text-carbon">
            Servicios
          </button>
          <button @click="router.push({ name: 'admin-horarios' })" class="text-sm text-gris hover:text-carbon">
            Horarios
          </button>
          <button @click="router.push({ name: 'admin-negocio' })" class="text-sm text-gris hover:text-carbon">
            Mi negocio
          </button>
          <button @click="router.push({ name: 'admin-personal' })" class="text-sm text-gris hover:text-carbon">
            Profesionales
          </button>
          <button @click="cerrarSesion" class="text-sm text-gris hover:text-carbon">Cerrar sesión</button>
        </div>
      </div>

      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="reservaciones.length === 0" class="text-sm text-gris">Todavía no hay reservaciones.</p>

      <template v-else>
        <!-- Tabla: solo de md (tablet) en adelante -->
        <div class="hidden md:block bg-white rounded-2xl border border-borde overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gris border-b border-borde">
                <th class="px-4 py-3 font-medium">Cliente</th>
                <th class="px-4 py-3 font-medium">Servicio</th>
                <th class="px-4 py-3 font-medium">Fecha</th>
                <th class="px-4 py-3 font-medium">Hora</th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="r in reservaciones" :key="r.id">
                <tr class="border-b border-borde last:border-0">
                  <td class="px-4 py-3 text-carbon">
                    {{ r.nombre_cliente }}
                    <p v-if="r.comentario_cliente" class="text-xs text-gris italic mt-0.5">💬 {{ r.comentario_cliente }}</p>
                  </td>
                  <td class="px-4 py-3 text-carbon">{{ r.servicio.nombre }}</td>
                  <td class="px-4 py-3 text-carbon">{{ r.fecha.split('T')[0] }}</td>
                  <td class="px-4 py-3 text-carbon">{{ r.hora.slice(0, 5) }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs" :class="ESTILO_ESTADO[r.estado]">
                      {{ r.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button @click="alternarNotas(r.id)" class="text-xs text-gris hover:text-carbon underline">
                      {{ expandido[r.id] ? 'Ocultar' : (r.notas_admin ? 'Ver nota' : 'Agregar nota') }}
                    </button>
                  </td>
                </tr>
                <tr v-if="expandido[r.id]" class="border-b border-borde bg-crema">
                  <td colspan="6" class="px-4 py-3">
                    <PanelNota
                      v-model="r.notas_admin"
                      :guardando="estadoGuardado[r.id] === 'guardando'"
                      :guardado="estadoGuardado[r.id] === 'guardado'"
                      @guardar="guardarNota(r)"
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Tarjetas: solo en celular (debajo de md) -->
        <div class="md:hidden flex flex-col gap-3">
          <div
            v-for="r in reservaciones"
            :key="r.id"
            class="bg-white rounded-2xl border border-borde p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-carbon">{{ r.nombre_cliente }}</span>
              <span class="px-2 py-1 rounded-full text-xs" :class="ESTILO_ESTADO[r.estado]">
                {{ r.estado }}
              </span>
            </div>
            <p class="text-sm text-gris mb-1">✂️ {{ r.servicio.nombre }}</p>
            <p class="text-sm text-gris mb-3">📅 {{ r.fecha.split('T')[0] }} · 🕐 {{ r.hora.slice(0, 5) }}</p>
            <p v-if="r.comentario_cliente" class="text-xs text-gris italic mb-3">💬 {{ r.comentario_cliente }}</p>

            <button @click="alternarNotas(r.id)" class="text-xs text-carbon underline">
              {{ expandido[r.id] ? 'Ocultar' : (r.notas_admin ? 'Ver nota' : 'Agregar nota') }}
            </button>

            <div v-if="expandido[r.id]" class="mt-3">
              <PanelNota
                v-model="r.notas_admin"
                :guardando="estadoGuardado[r.id] === 'guardando'"
                :guardado="estadoGuardado[r.id] === 'guardado'"
                @guardar="guardarNota(r)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>