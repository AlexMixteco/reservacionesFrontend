<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

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

onMounted(async () => {
  try {
    const respuesta = await api.get('/admin/reservaciones')
    reservaciones.value = respuesta.data
  } catch (e) {
    error.value = 'No se pudieron cargar las reservaciones.'
  } finally {
    cargando.value = false
  }
})

async function cerrarSesion() {
  await auth.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="min-h-screen bg-crema p-6">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-semibold text-carbon">Reservaciones</h1>
          <p class="text-sm text-gris">{{ auth.usuario?.nombre }}</p>
        </div>
        <button @click="cerrarSesion" class="text-sm text-gris hover:text-carbon">Cerrar sesión</button>
      </div>

      <p v-if="cargando" class="text-sm text-gris">Cargando...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="reservaciones.length === 0" class="text-sm text-gris">Todavía no hay reservaciones.</p>

      <div v-else class="bg-white rounded-2xl border border-borde overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gris border-b border-borde">
              <th class="px-4 py-3 font-medium">Cliente</th>
              <th class="px-4 py-3 font-medium">Servicio</th>
              <th class="px-4 py-3 font-medium">Fecha</th>
              <th class="px-4 py-3 font-medium">Hora</th>
              <th class="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservaciones" :key="r.id" class="border-b border-borde last:border-0">
              <td class="px-4 py-3 text-carbon">{{ r.nombre_cliente }}</td>
              <td class="px-4 py-3 text-carbon">{{ r.servicio.nombre }}</td>
              <td class="px-4 py-3 text-carbon">{{ r.fecha.split('T')[0] }}</td>
              <td class="px-4 py-3 text-carbon">{{ r.hora.slice(0, 5) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs" :class="ESTILO_ESTADO[r.estado]">
                  {{ r.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>