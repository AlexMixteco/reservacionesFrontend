<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasoLayout from '../components/PasoLayout.vue'
import ServicioCard from '../components/ServicioCard.vue'
import api from '../services/api'
import { useReservaStore } from '../stores/reserva'

const router = useRouter()
const store = useReservaStore()

const servicios = ref([])
const cargando = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const [respServicios, respConfig] = await Promise.all([
      api.get(`/negocios/${store.negocioId}/servicios`),
      api.get(`/negocios/${store.negocioId}/configuracion`),
    ])
    servicios.value = respServicios.data
    store.requiereElegirProfesional = respConfig.data.requiere_elegir_profesional
  } catch (e) {
    error.value = 'No se pudieron cargar los servicios.'
  } finally {
    cargando.value = false
  }
})

function elegir(servicio) {
  store.seleccionarServicio(servicio)
  router.push({ name: store.requiereElegirProfesional ? 'profesional' : 'dia' })
}
</script>

<template>
  <PasoLayout :paso="1" :total="store.requiereElegirProfesional ? 5 : 4">
    <h1 class="text-xl font-semibold text-carbon mb-4">¿Qué servicio quieres?</h1>

    <p v-if="cargando" class="text-sm text-gris">Cargando servicios...</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-else class="flex flex-col gap-2">
      <ServicioCard
        v-for="servicio in servicios"
        :key="servicio.id"
        :nombre="servicio.nombre"
        :duracion="`${servicio.duracion_minutos} min`"
        :precio="`$${servicio.precio}`"
        :seleccionado="store.servicio?.id === servicio.id"
        @click="elegir(servicio)"
      />
    </div>
  </PasoLayout>
</template>